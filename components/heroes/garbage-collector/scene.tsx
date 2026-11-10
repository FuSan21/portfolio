"use client";

import { RoundedBox, Text } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import {
  CuboidCollider,
  interactionGroups,
  Physics,
  RigidBody,
  useSpringJoint,
  type RapierRigidBody,
} from "@react-three/rapier";
import { createRef, useEffect, useMemo, useRef, useState, type RefObject } from "react";
import * as THREE from "three";
import { EDGES, NODES, ROOT_Y, WELL_Y, reach, segHit, type Vec3 } from "./heap";
import { HERO_FONT } from "@/components/heroes/shared";

type Phase = "idle" | "mark" | "sweep";
type Stats = { live: number; collected: number };
type BodyRef = RefObject<RapierRigidBody>;

/** Holds one rigid-body ref per heap node; a class so render code can hand refs out by index. */
class BodyStore {
  private refs = NODES.map(() => createRef<RapierRigidBody>() as BodyRef);
  of(i: number): BodyRef {
    return this.refs[i];
  }
  /** Skips bodies already removed from the world; touching a freed handle panics rapier's wasm. */
  get(i: number) {
    const body = this.refs[i].current;
    return body?.isValid() ? body : undefined;
  }
}

const COLORS = {
  ledger: new THREE.Color("#1A1E3A"),
  grey: new THREE.Color("#34374a"),
  copy: new THREE.Color("#7D8CFF"),
  form: new THREE.Color("#E6E2D6"),
  stamp: new THREE.Color("#E0473A"),
};
const SPARKS = 10;
const STEP_MS = 90; // traversal delay per graph depth
const NO_HIT = interactionGroups(1, []);

/** World position of an edge endpoint: a root anchor or a block centre. */
const endpoint = (bodies: BodyStore, node: number, anchor: Vec3, out: THREE.Vector3) => {
  if (node === 0) return out.set(anchor[0], ROOT_Y, 0);
  const t = bodies.get(node)?.translation();
  return t ? out.set(t.x, t.y, t.z) : out.set(0, 0, 0);
};

function Reference({ store, a, b, anchor, rest }: { store: BodyStore; a: number; b: number; anchor: Vec3; rest: number }) {
  useSpringJoint(store.of(a), store.of(b), [anchor, [0, 0, 0], rest, 7, 0.35]);
  return null;
}

function Heap({ onPhase, onStats }: { onPhase: (p: Phase) => void; onStats: (s: Stats) => void }) {
  const { gl, camera } = useThree();
  const [bodies] = useState(() => new BodyStore());
  const [cut, setCut] = useState<ReadonlySet<number>>(() => new Set());
  const [dead, setDead] = useState<ReadonlySet<number>>(() => new Set());
  const [gone, setGone] = useState<ReadonlySet<number>>(() => new Set());
  const [compact, setCompact] = useState(false);

  const live = useRef({ cut, dead });
  const mark = useRef<{ at: number; depth: Map<number, number> }>({ at: -1e9, depth: new Map() });
  const deadAt = useRef(new Map<number, number>());
  const userCut = useRef(false);
  const sparks = useRef<{ p: THREE.Vector3; at: number }[]>([]);
  const mats = useRef<(THREE.MeshStandardMaterial | null)[]>([]);
  const groups = useRef<(THREE.Group | null)[]>([]);
  const sparkMeshes = useRef<(THREE.Mesh | null)[]>([]);
  const lines = useRef<THREE.LineSegments>(null);

  useEffect(() => {
    live.current = { cut, dead };
  }, [cut, dead]);

  // GC loop: mark (traverse from ROOT), then sweep whatever was not reached.
  useEffect(() => {
    const timers: number[] = [];
    const run = () => {
      const { cut: c, dead: d } = live.current;
      const depth = reach(c, d);
      mark.current = { at: performance.now(), depth };
      onPhase("mark");
      timers.push(
        window.setTimeout(() => {
          const fresh = NODES.map((_, i) => i).filter((i) => i > 0 && !depth.has(i) && !d.has(i));
          if (!fresh.length) return onPhase("idle");
          const now = performance.now();
          for (const i of fresh) {
            deadAt.current.set(i, now);
            bodies.get(i)?.setGravityScale(1.4, true);
          }
          const next = new Set([...live.current.dead, ...fresh]);
          live.current = { ...live.current, dead: next };
          setDead(next);
          if (userCut.current) setCompact(true);
          onStats({ live: NODES.length - 1 - next.size, collected: next.size });
          onPhase("sweep");
          timers.push(window.setTimeout(() => onPhase("idle"), 900));
          timers.push(window.setTimeout(() => setGone((g) => new Set([...g, ...fresh])), 2600));
        }, 700),
      );
    };
    timers.push(window.setTimeout(run, 900));
    const id = window.setInterval(run, 1600);
    return () => {
      window.clearInterval(id);
      timers.forEach((t) => window.clearTimeout(t));
    };
  }, [bodies, onPhase, onStats]);

  // Cutting: swipe segment vs every live reference, in screen space.
  useEffect(() => {
    const el = gl.domElement;
    let last: { x: number; y: number } | null = null;
    const a = new THREE.Vector3();
    const b = new THREE.Vector3();
    const pt = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      return { x: e.clientX - r.left, y: e.clientY - r.top };
    };
    const toPx = (v: THREE.Vector3) => {
      const p = v.clone().project(camera);
      return { x: ((p.x + 1) / 2) * el.clientWidth, y: ((1 - p.y) / 2) * el.clientHeight };
    };
    const down = (e: PointerEvent) => {
      last = pt(e);
      el.setPointerCapture(e.pointerId);
    };
    const move = (e: PointerEvent) => {
      if (!last) return;
      const p = pt(e);
      const { cut: c, dead: d } = live.current;
      const hits: number[] = [];
      EDGES.forEach((edge, i) => {
        if (c.has(i) || d.has(edge.from) || d.has(edge.to)) return;
        endpoint(bodies, edge.from, edge.anchor, a);
        endpoint(bodies, edge.to, edge.anchor, b);
        const u = segHit(last!, p, toPx(a), toPx(b));
        if (u === null) return;
        hits.push(i);
        sparks.current = [...sparks.current, { p: a.clone().lerp(b, u), at: performance.now() }].slice(-SPARKS);
      });
      last = p;
      if (!hits.length) return;
      userCut.current = true;
      const next = new Set([...c, ...hits]);
      live.current = { ...live.current, cut: next };
      setCut(next);
    };
    const up = () => {
      last = null;
    };
    el.addEventListener("pointerdown", down);
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", up);
    el.addEventListener("pointercancel", up);
    return () => {
      el.removeEventListener("pointerdown", down);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerup", up);
      el.removeEventListener("pointercancel", up);
    };
  }, [gl, camera, bodies]);

  // Tidy slots for survivors once the user has caused a collection.
  const targets = useMemo(() => {
    const map = new Map<number, THREE.Vector2>();
    if (!compact) return map;
    const alive = NODES.map((n, i) => ({ n, i }))
      .filter(({ i }) => i > 0 && !dead.has(i))
      .sort((x, y) => Number(!x.n.word) - Number(!y.n.word) || x.i - y.i);
    const perRow = 4;
    alive.forEach(({ i }, k) => {
      const row = Math.floor(k / perRow);
      const inRow = Math.min(perRow, alive.length - row * perRow);
      const col = k % perRow;
      map.set(i, new THREE.Vector2((col - (inRow - 1) / 2) * 1.85, ROOT_Y - 1.5 - row * 1.15));
    });
    return map;
  }, [compact, dead]);

  const linePositions = useMemo(() => new Float32Array(EDGES.length * 6), []);
  const lineColors = useMemo(() => new Float32Array(EDGES.length * 6), []);
  const tmpA = useMemo(() => new THREE.Vector3(), []);
  const tmpB = useMemo(() => new THREE.Vector3(), []);
  const tmpC = useMemo(() => new THREE.Color(), []);

  useFrame(({ clock }) => {
    const now = performance.now();
    const t = clock.elapsedTime;
    const { at, depth } = mark.current;
    let maxDepth = 0;
    depth.forEach((v) => (maxDepth = Math.max(maxDepth, v)));
    const markDone = now > at + maxDepth * STEP_MS + 150;
    const glow = (i: number) => {
      const d = depth.get(i);
      if (d === undefined) return 0;
      const local = now - (at + d * STEP_MS);
      return local < 0 ? 0 : Math.exp(-local / 450);
    };

    NODES.forEach((_, i) => {
      if (i === 0) return;
      const body = bodies.get(i);
      const mat = mats.current[i];
      const g = groups.current[i];
      if (!body || !mat || !g) return;
      const died = deadAt.current.get(i);
      if (died !== undefined) {
        const k = (now - died) / 1000;
        mat.color.copy(COLORS.grey);
        mat.emissive.copy(COLORS.stamp);
        mat.emissiveIntensity = Math.max(0, 0.6 - k);
        g.scale.setScalar(Math.max(0.001, 1 - Math.max(0, k - 0.9) / 1.4));
        return;
      }
      // Gentle drift so the heap sways, plus pull toward tidy slots after a sweep.
      const p = body.translation();
      const target = targets.get(i);
      const fx = Math.sin(t * 0.6 + i * 1.7) * 0.0025 + (target ? (target.x - p.x) * 0.02 : 0);
      const fy = Math.cos(t * 0.8 + i * 2.3) * 0.0018 + (target ? (target.y - p.y) * 0.02 : 0);
      body.applyImpulse({ x: fx, y: fy, z: 0 }, true);
      const unmarked = markDone && !depth.has(i) && at > 0;
      mat.color.copy(unmarked ? COLORS.grey : COLORS.ledger);
      mat.emissive.copy(COLORS.copy);
      mat.emissiveIntensity = unmarked ? 0 : 0.08 + glow(i) * 1.8;
    });

    EDGES.forEach((edge, i) => {
      const off = i * 6;
      const alive = !cut.has(i) && !dead.has(edge.from) && !dead.has(edge.to);
      endpoint(bodies, edge.from, edge.anchor, tmpA);
      endpoint(bodies, edge.to, edge.anchor, tmpB);
      if (!alive) tmpB.copy(tmpA);
      linePositions.set([tmpA.x, tmpA.y, tmpA.z, tmpB.x, tmpB.y, tmpB.z], off);
      tmpC.copy(COLORS.form).multiplyScalar(0.38).lerp(COLORS.copy, Math.min(1, glow(edge.to) * 1.4));
      lineColors.set([tmpC.r, tmpC.g, tmpC.b, tmpC.r, tmpC.g, tmpC.b], off);
    });
    const geo = lines.current?.geometry;
    if (geo) {
      geo.attributes.position.needsUpdate = true;
      geo.attributes.color.needsUpdate = true;
    }

    sparkMeshes.current.forEach((m, j) => {
      const s = sparks.current[j];
      if (!m) return;
      const k = s ? (now - s.at) / 450 : 1;
      m.visible = k < 1;
      if (s && k < 1) {
        m.position.copy(s.p);
        m.scale.setScalar(0.05 + k * 0.35);
        (m.material as THREE.MeshBasicMaterial).opacity = 1 - k;
      }
    });
  });

  return (
    <>
      <RigidBody ref={bodies.of(0)} type="fixed" position={[0, ROOT_Y, 0]} colliders={false}>
        <mesh>
          <boxGeometry args={[9.4, 0.14, 0.2]} />
          <meshStandardMaterial color="#7D8CFF" emissive="#7D8CFF" emissiveIntensity={1.6} />
        </mesh>
        <Text font={HERO_FONT} position={[-4.7, 0.32, 0]} anchorX="left" fontSize={0.2} letterSpacing={0.2} color="#7D8CFF">
          GC ROOTS
        </Text>
      </RigidBody>

      {NODES.map((n, i) =>
        i === 0 || gone.has(i) ? null : (
          <RigidBody
            key={i}
            ref={bodies.of(i)}
            position={n.pos}
            colliders={false}
            gravityScale={0}
            linearDamping={0.7}
            angularDamping={2.5}
            enabledTranslations={[true, true, false]}
            enabledRotations={[false, false, true]}
          >
            <CuboidCollider args={[0.7, 0.3, 0.15]} collisionGroups={NO_HIT} />
            <group ref={(el) => void (groups.current[i] = el)}>
              <RoundedBox args={[1.4, 0.6, 0.3]} radius={0.08} smoothness={3}>
                <meshStandardMaterial ref={(el) => void (mats.current[i] = el)} roughness={0.55} />
              </RoundedBox>
              <Text font={HERO_FONT} position={[0, n.word ? 0.13 : 0, 0.16]} fontSize={n.word ? 0.13 : 0.2} color="#E6E2D6">
                {n.type}
              </Text>
              {n.word ? (
                <Text font={HERO_FONT} position={[0, -0.09, 0.16]} fontSize={0.24} color="#B9D8B0">
                  {n.word}
                </Text>
              ) : null}
            </group>
          </RigidBody>
        ),
      )}

      {EDGES.map((e, i) =>
        cut.has(i) || dead.has(e.from) || dead.has(e.to) ? null : (
          <Reference key={i} store={bodies} a={e.from} b={e.to} anchor={e.anchor} rest={e.rest} />
        ),
      )}

      <lineSegments ref={lines} frustumCulled={false}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[linePositions, 3]} />
          <bufferAttribute attach="attributes-color" args={[lineColors, 3]} />
        </bufferGeometry>
        <lineBasicMaterial vertexColors />
      </lineSegments>

      {Array.from({ length: SPARKS }, (_, j) => (
        <mesh key={j} ref={(el) => void (sparkMeshes.current[j] = el)} visible={false}>
          <sphereGeometry args={[1, 12, 12]} />
          <meshBasicMaterial color="#E0473A" transparent toneMapped={false} />
        </mesh>
      ))}
    </>
  );
}

function SweepWell() {
  return (
    <group position={[0, WELL_Y, -0.5]}>
      {[0, 1, 2, 3].map((k) => (
        <mesh key={k} rotation={[-Math.PI / 2.3, 0, 0]}>
          <ringGeometry args={[1.2 + k * 0.9, 1.24 + k * 0.9, 96]} />
          <meshBasicMaterial color="#E0473A" transparent opacity={0.5 - k * 0.11} toneMapped={false} />
        </mesh>
      ))}
      <mesh rotation={[-Math.PI / 2.3, 0, 0]} position={[0, -0.01, 0]}>
        <circleGeometry args={[4.4, 96]} />
        <meshBasicMaterial color="#05060f" />
      </mesh>
      <Text font={HERO_FONT} position={[0, -0.75, 0.6]} fontSize={0.16} letterSpacing={0.3} color="#E0473A">
        SWEEP
      </Text>
    </group>
  );
}

const PHASE_LABEL: Record<Phase, string> = { idle: "GC · idle", mark: "GC · mark…", sweep: "GC · sweep…" };

export default function GarbageCollectorScene() {
  const [gen, setGen] = useState(0);
  const [phase, setPhase] = useState<Phase>("idle");
  const [stats, setStats] = useState<Stats>({ live: NODES.length - 1, collected: 0 });

  return (
    <div className="relative h-full w-full touch-pan-y select-none">
      <Canvas camera={{ position: [0, -0.3, 14], fov: 42 }} dpr={[1, 2]}>
        <color attach="background" args={["#0F1226"]} />
        <ambientLight intensity={0.5} />
        <directionalLight position={[3, 6, 8]} intensity={1.6} />
        <Physics gravity={[0, -9.81, 0]}>
          <Heap key={gen} onPhase={setPhase} onStats={setStats} />
        </Physics>
        <SweepWell />
        <EffectComposer>
          <Bloom luminanceThreshold={0.55} intensity={0.9} mipmapBlur />
        </EffectComposer>
      </Canvas>
      <div className="pointer-events-none absolute left-6 top-6 md:left-10">
        <p className={`mono-label ${phase === "sweep" ? "text-stamp" : phase === "mark" ? "text-copy" : "text-form/60"}`}>
          {PHASE_LABEL[phase]}
        </p>
        <p className="mono-label mt-1 text-form/40">
          heap {stats.live} objects · collected {stats.collected}
        </p>
      </div>
      <button
        type="button"
        onClick={() => {
          setGen((g) => g + 1);
          setPhase("idle");
          setStats({ live: NODES.length - 1, collected: 0 });
        }}
        className="mono-label absolute right-6 top-6 border border-form/30 px-3 py-1.5 text-form/80 hover:border-form hover:text-form md:right-10"
      >
        Rebuild heap
      </button>
    </div>
  );
}
