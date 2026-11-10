import * as THREE from "three";

// A deliberately fake traffic simulation. Requests are particles that hop
// edge by edge from the gateway; breaking a service makes them slow, bounce
// back with exponential backoff, and eventually fail until its breaker trips.

export type Health = "ok" | "failing" | "open" | "half" | "recovered";

type V3 = [number, number, number];

export const SERVICES: { id: string; pos: V3; standby?: boolean }[] = [
  { id: "gateway", pos: [-5.2, 0.2, 0] },
  { id: "auth.okta", pos: [-2.7, 1.5, 0.4] },
  { id: "token-cache", pos: [-2.9, -0.5, -1.4], standby: true },
  { id: "notify", pos: [-2.4, -2.3, 0.9] },
  { id: "rules-engine", pos: [0, 0.5, 0] },
  { id: "audit", pos: [1.6, -2.6, 0.3] },
  { id: "pandadoc", pos: [2.3, 2.1, -0.5] },
  { id: "crm", pos: [2.4, -0.5, 1.0] },
  { id: "crm.replica", pos: [2.0, -1.2, -1.7], standby: true },
  { id: "doc-render", pos: [4.9, 2.6, 0.4] },
  { id: "doc-render.b", pos: [4.7, 1.0, -1.5], standby: true },
  { id: "ods-sync", pos: [5.0, -0.8, 0] },
];

const ROUTES: Record<string, [string, number][]> = {
  gateway: [["auth.okta", 0.78], ["notify", 0.22]],
  "auth.okta": [["rules-engine", 1]],
  "token-cache": [["rules-engine", 1]],
  "rules-engine": [["pandadoc", 0.42], ["crm", 0.46], ["audit", 0.12]],
  pandadoc: [["doc-render", 1]],
  crm: [["ods-sync", 1]],
  "crm.replica": [["ods-sync", 1]],
  notify: [["audit", 1]],
};

export const FALLBACK: Record<string, string> = {
  "auth.okta": "token-cache",
  crm: "crm.replica",
  "doc-render": "doc-render.b",
};

export type Edge = {
  from: number;
  to: number;
  standby: boolean;
  curve: THREE.QuadraticBezierCurve3;
  len: number;
};

type Particle = {
  alive: boolean;
  edge: number;
  t: number;
  dir: 1 | -1 | 0; // forward, retreating, waiting out a backoff
  retries: number;
  backTo: number;
  wait: number;
  age: number;
};

export const MAX_PARTICLES = 480;
const SPEED = 2.5;
const SPAWN_PER_SEC = 24;
const MS_PER_SEC = 55; // particle seconds -> fake latency
const TIMEOUT_MS = 1600;

const idx = new Map(SERVICES.map((s, i) => [s.id, i]));
const broken = (h: Health) => h === "failing" || h === "open";

export class Sim {
  health: Health[] = SERVICES.map(() => "ok");
  since: number[] = SERVICES.map(() => 0);
  edges: Edge[] = [];
  heat: Float32Array;
  time = 0;
  particles: Particle[] = [];
  private edgeKey = new Map<string, number>();
  private spawnAcc = 0;
  private events: { t: number; ms: number; ok: boolean; retry: boolean }[] = [];

  constructor() {
    const add = (a: string, b: string) => {
      const key = `${a}>${b}`;
      if (this.edgeKey.has(key)) return;
      const from = idx.get(a)!;
      const to = idx.get(b)!;
      const pa = new THREE.Vector3(...SERVICES[from].pos);
      const pb = new THREE.Vector3(...SERVICES[to].pos);
      const n = this.edges.length;
      const mid = pa
        .clone()
        .lerp(pb, 0.5)
        .add(new THREE.Vector3(0, 0.35, n % 2 ? 0.7 : -0.7));
      const curve = new THREE.QuadraticBezierCurve3(pa, mid, pb);
      const standby = !!(SERVICES[from].standby || SERVICES[to].standby);
      this.edgeKey.set(key, n);
      this.edges.push({ from, to, standby, curve, len: curve.getLength() });
    };
    for (const [src, outs] of Object.entries(ROUTES)) {
      for (const [dst] of outs) {
        add(src, dst);
        if (FALLBACK[dst]) add(src, FALLBACK[dst]);
      }
    }
    this.heat = new Float32Array(this.edges.length);
    for (let i = 0; i < MAX_PARTICLES; i++) {
      this.particles.push({ alive: false, edge: 0, t: 0, dir: 1, retries: 0, backTo: 0, wait: 0, age: 0 });
    }
  }

  toggle(i: number) {
    if (i === 0) return; // the gateway is the blast door, keep it up
    this.health[i] = broken(this.health[i]) ? "half" : "failing";
    this.since[i] = this.time;
  }

  /** Incoming traffic on a node, used to light up standby replicas. */
  inHeat(i: number) {
    let h = 0;
    this.edges.forEach((e, k) => {
      if (e.to === i) h += this.heat[k];
    });
    return h;
  }

  /** Edge index to take from `node`, -1 for a fast-fail, -2 for terminal. */
  private choose(node: number): number {
    const outs = ROUTES[SERVICES[node].id];
    if (!outs) return -2;
    let r = Math.random();
    let pick = outs[outs.length - 1][0];
    for (const [id, w] of outs) {
      if ((r -= w) <= 0) {
        pick = id;
        break;
      }
    }
    const h = this.health[idx.get(pick)!];
    const fb = FALLBACK[pick];
    const fbUp = fb !== undefined && !broken(this.health[idx.get(fb)!]);
    const src = SERVICES[node].id;
    const via = (dst: string) => this.edgeKey.get(`${src}>${dst}`)!;
    if (h === "open") return fbUp ? via(fb) : -1;
    if (h === "half" && Math.random() > 0.3) return fbUp ? via(fb) : -1;
    return via(pick);
  }

  private record(ms: number, ok: boolean, retry = false) {
    this.events.push({ t: this.time, ms, ok, retry });
  }

  /** Advances the sim; returns true when any service changed state. */
  tick(dt: number): boolean {
    this.time += dt;
    let changed = false;
    this.health.forEach((h, i) => {
      const age = this.time - this.since[i];
      const next =
        h === "failing" && age > 1.8 ? "open"
        : h === "half" && age > 2.4 ? "recovered"
        : h === "recovered" && age > 4 ? "ok"
        : h;
      if (next !== h) {
        this.health[i] = next;
        this.since[i] = this.time;
        changed = true;
      }
    });

    this.spawnAcc += dt * SPAWN_PER_SEC;
    while (this.spawnAcc >= 1) {
      this.spawnAcc -= 1;
      const e = this.choose(0);
      if (e < 0) {
        this.record(4, false);
        continue;
      }
      const p = this.particles.find((q) => !q.alive);
      if (p) Object.assign(p, { alive: true, edge: e, t: 0, dir: 1, retries: 0, wait: 0, age: 0 });
    }

    const decay = Math.exp(-dt * 2);
    for (let k = 0; k < this.heat.length; k++) this.heat[k] *= decay;

    for (const p of this.particles) {
      if (!p.alive) continue;
      p.age += dt;
      const e = this.edges[p.edge];
      this.heat[p.edge] += dt;
      if (p.dir === 0) {
        p.wait -= dt;
        if (p.wait <= 0) p.dir = 1;
        continue;
      }
      if (broken(this.health[e.to])) {
        if (p.dir === 1) {
          const slow = 1 - 0.85 * THREE.MathUtils.smoothstep(p.t, 0.5, 0.9);
          p.t += (SPEED * dt * slow) / e.len;
          if (p.t >= 0.9) {
            p.retries++;
            this.record(p.age * MS_PER_SEC + TIMEOUT_MS * 0.6, false, true); // each 5xx attempt counts
            if (p.retries > 3) {
              p.alive = false;
              this.record(p.age * MS_PER_SEC + TIMEOUT_MS, false);
            } else {
              p.dir = -1;
              p.backTo = 0.9 - 0.08 * 2 ** (p.retries - 1);
            }
          }
        } else {
          p.t -= (SPEED * 1.4 * dt) / e.len;
          if (p.t <= p.backTo) {
            p.t = p.backTo;
            p.dir = 0;
            p.wait = 0.25 * 2 ** p.retries;
          }
        }
        continue;
      }
      p.dir = 1;
      p.t += (SPEED * dt) / e.len;
      if (p.t >= 1) {
        const next = this.choose(e.to);
        if (next >= 0) {
          p.edge = next;
          p.t = 0;
        } else {
          p.alive = false;
          this.record(p.age * MS_PER_SEC + (next === -1 ? 0 : 20), next === -2);
        }
      }
    }
    return changed;
  }

  metrics() {
    const windowSec = 2;
    this.events = this.events.filter((e) => this.time - e.t < windowSec);
    const n = this.events.length;
    if (!n) return { rps: 0, p95: 0, err: 0, open: 0 };
    const fails = this.events.filter((e) => !e.ok).length;
    const sorted = this.events.map((e) => e.ms).sort((a, b) => a - b);
    return {
      rps: Math.round((this.events.filter((e) => !e.retry).length / windowSec) * 46 * (0.97 + Math.random() * 0.06)),
      p95: Math.round(sorted[Math.floor(n * 0.95)] ?? sorted[n - 1]),
      err: (fails / n) * 100,
      open: this.health.filter((h) => h === "open").length,
    };
  }
}
