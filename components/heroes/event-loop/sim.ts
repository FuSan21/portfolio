import { Vector3, type Object3D } from "three";

// Deterministic, kinematic model of the event loop. Scheduling rules:
// one item on the stack at a time; after it finishes, every queued microtask
// drains before anything else; a render opportunity only happens once the
// microtask queue is empty; then the next task gets a turn.

export type Kind = "task" | "micro";
export type MarbleInfo = { id: number; kind: Kind; code: string };
export type Snapshot = { marbles: MarbleInfo[]; status: string; frame: number };

type Mode = "wait" | "enter" | "run" | "exit";
type Marble = MarbleInfo & {
  mode: Mode;
  pos: Vector3;
  from: Vector3;
  t: number;
  spawnsMicro: boolean;
};

const TASK_CODE = [
  "setTimeout(ship, 0)",
  "setTimeout(poll, 16)",
  "setInterval(tick, 100)",
  "setTimeout(retry, 250)",
  "port.postMessage(batch)",
  "button.onclick = submit",
];
const MICRO_CODE = [
  "fetch().then(parse)",
  "Promise.resolve().then(log)",
  "queueMicrotask(flush)",
  "await db.query(sql)",
  "res.json().then(render)",
  "new MutationObserver(sync)",
];

export const RADIUS: Record<Kind, number> = { task: 0.32, micro: 0.16 };
export const CONVEYOR_Y = -2.4;
const SPAWN: Record<Kind, Vector3> = {
  task: new Vector3(-7.5, CONVEYOR_Y + RADIUS.task, 0),
  micro: new Vector3(5.6, 3.7, 0),
};
const slot = (kind: Kind, i: number) =>
  kind === "task"
    ? new Vector3(-1.3 - i * 0.8, CONVEYOR_Y + RADIUS.task, 0)
    : new Vector3(0.85 + i * 0.4, 2.2 + i * 0.16, 0);
const SPEED: Record<Kind, number> = { task: 2.6, micro: 7 };
const ENTER: Record<Kind, number> = { task: 0.8, micro: 0.4 };
const RUN: Record<Kind, number> = { task: 1.3, micro: 0.4 };
const EXIT = 0.6;
const EXIT_TO = new Vector3(1.8, -3.6, 0);
const MAX: Record<Kind, number> = { task: 7, micro: 9 };
const FRAME_INTERVAL = 1.6;
const RENDER_TIME = 0.7;

const ease = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const pick = <T,>(xs: readonly T[]) => xs[Math.floor(Math.random() * xs.length)];
const cubic = (a: Vector3, b: Vector3, c: Vector3, d: Vector3, t: number) => {
  const u = 1 - t;
  return new Vector3()
    .addScaledVector(a, u * u * u)
    .addScaledVector(b, 3 * u * u * t)
    .addScaledVector(c, 3 * u * t * t)
    .addScaledVector(d, t * t * t);
};

export class EventLoopSim {
  private all: Marble[] = [];
  private queues: Record<Kind, Marble[]> = { task: [], micro: [] };
  private current: Marble | null = null;
  private objects = new Map<number, Object3D>();
  private listeners = new Set<() => void>();
  private nextId = 1;
  private clock = 0;
  private lastRender = 0;
  private rendering = 0;
  private idleFor = 0;
  private snapshot: Snapshot = { marbles: [], status: "idle", frame: 0 };
  gate = 0; // 0 closed, 1 open

  constructor() {
    // Seed so the machine is busy on load: tasks queue first, then promises
    // arrive and visibly jump ahead of them.
    this.spawn("task");
    this.spawn("task");
    this.spawn("task");
    this.spawn("micro");
    this.spawn("micro");
  }

  subscribe = (fn: () => void) => {
    this.listeners.add(fn);
    return () => void this.listeners.delete(fn);
  };
  getSnapshot = () => this.snapshot;

  private publish(patch: Partial<Snapshot>) {
    this.snapshot = {
      ...this.snapshot,
      ...patch,
      marbles: this.all.map(({ id, kind, code }) => ({ id, kind, code })),
    };
    this.listeners.forEach((fn) => fn());
  }

  attach = (id: number, obj: Object3D | null) => {
    if (obj) this.objects.set(id, obj);
    else this.objects.delete(id);
  };

  glow(id: number) {
    const m = this.current;
    return m && m.id === id && m.mode === "run" ? 1 : 0;
  }

  spawn(kind: Kind, code = pick(kind === "task" ? TASK_CODE : MICRO_CODE)) {
    if (this.queues[kind].length >= MAX[kind]) return;
    const m: Marble = {
      id: this.nextId++,
      kind,
      code,
      mode: "wait",
      pos: SPAWN[kind].clone(),
      from: new Vector3(),
      t: 0,
      spawnsMicro: kind === "task" && Math.random() < 0.45,
    };
    this.all.push(m);
    this.queues[kind].push(m);
    this.idleFor = 0;
    this.publish({});
  }

  private start(m: Marble) {
    this.current = m;
    m.mode = "enter";
    m.t = 0;
    m.from.copy(m.pos);
    this.publish({ status: `${m.kind === "task" ? "task" : "microtask"} · ${m.code}` });
  }

  private schedule() {
    if (this.current || this.rendering > 0) return;
    const micro = this.queues.micro.shift();
    if (micro) return this.start(micro);
    if (this.clock - this.lastRender >= FRAME_INTERVAL) {
      this.rendering = RENDER_TIME;
      this.lastRender = this.clock;
      const frame = this.snapshot.frame + 1;
      return this.publish({ status: `render · paint frame ${frame}`, frame });
    }
    const task = this.queues.task.shift();
    if (task) return this.start(task);
    if (this.snapshot.status !== "idle") this.publish({ status: "idle" });
  }

  step(dt: number) {
    dt = Math.min(dt, 0.05);
    this.clock += dt;
    if (this.rendering > 0) this.rendering = Math.max(0, this.rendering - dt);
    this.gate += ((this.rendering > 0 ? 1 : 0) - this.gate) * Math.min(1, dt * 10);

    // Keep the machine alive if nobody is playing with it.
    this.idleFor += dt;
    if (this.idleFor > 5 && !this.current && !this.queues.task.length) {
      this.spawn("task");
      if (Math.random() < 0.7) this.spawn("micro");
    }

    this.schedule();

    for (const kind of ["task", "micro"] as const) {
      this.queues[kind].forEach((m, i) => {
        const target = slot(kind, i);
        const d = target.clone().sub(m.pos);
        const len = d.length();
        const max = SPEED[kind] * dt;
        if (len > max) m.pos.addScaledVector(d, max / len);
        else m.pos.copy(target);
      });
    }

    const m = this.current;
    if (m) {
      if (m.mode === "enter") {
        m.t = Math.min(1, m.t + dt / ENTER[m.kind]);
        const lift = m.kind === "task" ? -0.25 : 0.3;
        m.pos.copy(
          cubic(
            m.from,
            new Vector3(0, m.from.y, 0),
            new Vector3(0, m.from.y + lift, 0),
            new Vector3(0, 0, 0),
            ease(m.t),
          ),
        );
        if (m.t >= 1) {
          m.mode = "run";
          m.t = 0;
        }
      } else if (m.mode === "run") {
        const before = m.t;
        m.t = Math.min(1, m.t + dt / RUN[m.kind]);
        // A task callback that itself queues a promise: it lands in the
        // microtask chute and still runs before the next waiting task.
        if (m.spawnsMicro && before < 0.5 && m.t >= 0.5) this.spawn("micro");
        if (m.t >= 1) {
          m.mode = "exit";
          m.t = 0;
          m.from.copy(m.pos);
          this.current = null;
          this.schedule();
        }
      }
    }

    for (const x of this.all) {
      if (x.mode !== "exit") continue;
      x.t = Math.min(1, x.t + dt / EXIT);
      const k = x.t * x.t;
      x.pos.set(
        x.from.x + (EXIT_TO.x - x.from.x) * Math.max(0, x.t - 0.4) / 0.6,
        x.from.y + (EXIT_TO.y - x.from.y) * k,
        0,
      );
    }
    if (this.all.some((x) => x.mode === "exit" && x.t >= 1)) {
      this.all = this.all.filter((x) => !(x.mode === "exit" && x.t >= 1));
      this.publish({});
    }

    for (const x of this.all) {
      const obj = this.objects.get(x.id);
      if (!obj) continue;
      obj.position.copy(x.pos);
      const rolling = x.mode === "wait" ? -x.pos.x / RADIUS[x.kind] : 0;
      obj.rotation.z = x.mode === "run" ? this.clock * -9 : rolling;
      obj.scale.setScalar(x.mode === "exit" ? 1 - Math.max(0, x.t - 0.5) * 2 : 1);
    }
  }
}
