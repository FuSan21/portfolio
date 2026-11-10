"use client";

import { Html, RoundedBox } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { FALLBACK, MAX_PARTICLES, SERVICES, Sim, type Edge, type Health } from "./sim";

const C = {
  carbon: "#0F1226",
  copy: new THREE.Color("#7D8CFF"),
  form: new THREE.Color("#E6E2D6"),
  green: new THREE.Color("#B9D8B0"),
  stamp: new THREE.Color("#E0473A"),
  idle: new THREE.Color("#3A4170"),
};
const isBroken = (h: Health) => h === "failing" || h === "open";
const tmp = new THREE.Color();
const tmpV = new THREE.Vector3();
const dummy = new THREE.Object3D();

function Driver({ sim, onChange }: { sim: Sim; onChange: () => void }) {
  useFrame((_, dt) => {
    if (sim.tick(Math.min(dt, 0.05))) onChange();
  });
  return null;
}

function Particles({ sim }: { sim: Sim }) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  useFrame(() => {
    const m = mesh.current;
    if (!m) return;
    sim.particles.forEach((p, i) => {
      if (!p.alive) {
        dummy.scale.setScalar(0);
      } else {
        const e = sim.edges[p.edge];
        e.curve.getPoint(Math.min(p.t, 1), tmpV);
        dummy.position.copy(tmpV);
        dummy.scale.setScalar(p.dir === 1 ? 1 : 0.8);
        const h = sim.health[e.to];
        const c =
          isBroken(h) || p.retries > 0 ? C.stamp
          : e.standby ? C.green
          : h === "half" ? C.form
          : C.copy;
        m.setColorAt(i, tmp.copy(c).multiplyScalar(isBroken(h) ? 2.4 : 1.9));
      }
      dummy.updateMatrix();
      m.setMatrixAt(i, dummy.matrix);
    });
    m.instanceMatrix.needsUpdate = true;
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
  });
  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, MAX_PARTICLES]} frustumCulled={false}>
      <sphereGeometry args={[0.045, 10, 10]} />
      <meshBasicMaterial toneMapped={false} />
    </instancedMesh>
  );
}

function EdgeTube({ sim, edge, k }: { sim: Sim; edge: Edge; k: number }) {
  const geo = useMemo(() => new THREE.TubeGeometry(edge.curve, 48, 0.012, 6, false), [edge]);
  const mat = useRef<THREE.MeshBasicMaterial>(null);
  useFrame(() => {
    if (!mat.current) return;
    const h = sim.health[edge.to];
    const load = Math.min(sim.heat[k], 6) / 6;
    const [c, o] =
      h === "failing" ? [C.stamp, 0.7]
      : h === "open" ? [C.stamp, 0.18]
      : edge.standby ? [C.green, 0.05 + load * 0.6]
      : [C.copy, 0.12 + load * 0.3];
    mat.current.color.lerp(c, 0.1);
    mat.current.opacity += (o - mat.current.opacity) * 0.1;
  });
  return (
    <mesh geometry={geo}>
      <meshBasicMaterial ref={mat} transparent opacity={0.15} depthWrite={false} color={C.copy} />
    </mesh>
  );
}

const STATUS: Record<Health, [string, string] | null> = {
  ok: null,
  failing: ["5xx · retrying", "text-stamp"],
  open: ["⊘ breaker open", "text-stamp"],
  half: ["◐ half-open", "text-form"],
  recovered: ["✓ closed", "text-greenbar"],
};

function ServiceNode({ sim, i, health, onToggle }: { sim: Sim; i: number; health: Health; onToggle: (i: number) => void }) {
  const def = SERVICES[i];
  const group = useRef<THREE.Group>(null);
  const box = useRef<THREE.Mesh>(null);
  const core = useRef<THREE.MeshBasicMaterial>(null);
  const glass = useRef<THREE.MeshPhysicalMaterial>(null);
  const crack = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    const h = sim.health[i];
    const g = group.current;
    if (!g || !core.current || !glass.current || !box.current || !crack.current) return;
    const shake = h === "failing" ? 0.06 : h === "open" ? 0.015 : 0;
    g.position.set(
      def.pos[0] + (Math.random() - 0.5) * shake,
      def.pos[1] + Math.sin(t * 0.7 + i) * 0.06 + (Math.random() - 0.5) * shake,
      def.pos[2] + (Math.random() - 0.5) * shake,
    );
    box.current.rotation.set(t * 0.15 + i, t * 0.2 + i * 0.7, 0);
    crack.current.visible = isBroken(h);
    crack.current.rotation.copy(box.current.rotation);

    const active = def.standby && sim.inHeat(i) > 0.4;
    const pulse = 0.75 + 0.25 * Math.sin(t * 6);
    const [c, s] =
      h === "failing" ? [C.stamp, Math.random() > 0.15 ? 2.6 : 0.4]
      : h === "open" ? [C.stamp, 1.2]
      : h === "half" ? [C.form, 1.6 * pulse]
      : h === "recovered" ? [C.green, 2]
      : def.standby ? (active ? [C.green, 1.8] : [C.idle, 1])
      : [C.copy, 1.6];
    core.current.color.lerp(tmp.copy(c).multiplyScalar(s), 0.2);
    glass.current.color.lerp(isBroken(h) ? C.stamp : C.form, 0.08);
  });

  const status = STATUS[health];
  const standbyLabel = def.standby && health === "ok" ? `standby · ${Object.keys(FALLBACK).find((k) => FALLBACK[k] === def.id)}` : null;

  return (
    <group ref={group} position={def.pos}>
      <RoundedBox
        ref={box}
        args={[0.72, 0.72, 0.72]}
        radius={0.16}
        smoothness={4}
        onClick={(e) => {
          e.stopPropagation();
          onToggle(i);
        }}
        onPointerOver={() => {
          if (i !== 0) document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          document.body.style.cursor = "";
        }}
      >
        <meshPhysicalMaterial
          ref={glass}
          transmission={1}
          roughness={0.42}
          thickness={0.8}
          ior={1.35}
          metalness={0}
          clearcoat={0.6}
          clearcoatRoughness={0.3}
          color={C.form}
        />
      </RoundedBox>
      <mesh>
        <sphereGeometry args={[0.13, 20, 20]} />
        <meshBasicMaterial ref={core} toneMapped={false} color={C.copy} />
      </mesh>
      <mesh ref={crack} visible={false} scale={0.62}>
        <icosahedronGeometry args={[1, 1]} />
        <meshBasicMaterial wireframe toneMapped={false} color={tmp.copy(C.stamp).multiplyScalar(1.6)} transparent opacity={0.7} />
      </mesh>
      <Html center position={[0, -0.7, 0]} zIndexRange={[5, 0]} className="pointer-events-none select-none">
        <div className="flex flex-col items-center whitespace-nowrap font-mono text-[10px] leading-tight tracking-wide">
          <span className={isBroken(health) ? "text-stamp" : "text-form/85"}>{def.id}</span>
          {status ? (
            <span className={`${status[1]} mt-0.5 uppercase`}>{status[0]}</span>
          ) : standbyLabel ? (
            <span className="mt-0.5 uppercase text-form/35">{standbyLabel}</span>
          ) : null}
        </div>
      </Html>
    </group>
  );
}

function Rig({ children }: { children: React.ReactNode }) {
  const g = useRef<THREE.Group>(null);
  useFrame(({ clock, pointer }) => {
    if (!g.current) return;
    const t = clock.elapsedTime;
    const ry = Math.sin(t * 0.07) * 0.22 + pointer.x * 0.22;
    const rx = 0.12 - pointer.y * 0.1;
    g.current.rotation.y += (ry - g.current.rotation.y) * 0.04;
    g.current.rotation.x += (rx - g.current.rotation.x) * 0.04;
  });
  return (
    <group ref={g} position={[0.1, 0.1, 0]}>
      {children}
    </group>
  );
}

type Metrics = ReturnType<Sim["metrics"]>;

function Hud({ sim, health }: { sim: Sim; health: Health[] }) {
  const [m, setM] = useState<Metrics>({ rps: 0, p95: 0, err: 0, open: 0 });
  useEffect(() => {
    const id = setInterval(() => setM(sim.metrics()), 300);
    return () => clearInterval(id);
  }, [sim]);

  const down = SERVICES.filter((_, i) => isBroken(health[i])).map((s) => s.id);
  const rerouted = down.filter((id) => FALLBACK[id] && health[SERVICES.findIndex((s) => s.id === id)] === "open");
  const line =
    down.length === 0 ? (health.some((h) => h !== "ok") ? "recovering · breakers closing" : "all services nominal")
    : rerouted.length ? `rerouted ${rerouted.map((id) => `${id} → ${FALLBACK[id]}`).join(", ")}`
    : `incident · ${down.join(", ")}`;

  const row = (label: string, value: string, bad: boolean) => (
    <div className="flex justify-between gap-6">
      <span className="text-form/50">{label}</span>
      <span className={bad ? "text-stamp" : "text-form"}>{value}</span>
    </div>
  );

  return (
    <div className="pointer-events-none absolute left-6 top-4 z-20 w-64 border border-form/10 bg-ledger/70 px-4 py-3 font-mono text-xs backdrop-blur md:left-10">
      <p className="mono-label mb-2 text-copy">mesh / prod-eu-1</p>
      {row("throughput", `${m.rps.toLocaleString()} rps`, false)}
      {row("p95 latency", `${m.p95} ms`, m.p95 > 600)}
      {row("error rate", `${m.err.toFixed(1)} %`, m.err > 2)}
      {row("breakers open", `${m.open}`, m.open > 0)}
      <p className={`mt-2 border-t border-form/10 pt-2 text-[10px] uppercase ${down.length ? "text-stamp" : "text-greenbar"}`}>{line}</p>
    </div>
  );
}

export default function ChaosScene() {
  const sim = useMemo(() => new Sim(), []);
  const [health, setHealth] = useState<Health[]>(() => SERVICES.map(() => "ok"));
  const sync = () => setHealth([...sim.health]);
  const toggle = (i: number) => {
    sim.toggle(i);
    sync();
  };

  return (
    <div className="relative h-full w-full">
      <Canvas
        dpr={[1, 1.75]}
        camera={{ position: [0, 0.3, 10.5], fov: 45 }}
        gl={{ antialias: true }}
        onPointerMissed={() => (document.body.style.cursor = "")}
      >
        <color attach="background" args={[C.carbon]} />
        <ambientLight intensity={0.5} />
        <pointLight position={[-4, 5, 6]} intensity={40} color="#E6E2D6" />
        <pointLight position={[5, -3, 4]} intensity={25} color="#7D8CFF" />
        <Driver sim={sim} onChange={sync} />
        <Rig>
          {sim.edges.map((e, k) => (
            <EdgeTube key={k} sim={sim} edge={e} k={k} />
          ))}
          <Particles sim={sim} />
          {SERVICES.map((s, i) => (
            <ServiceNode key={s.id} sim={sim} i={i} health={health[i]} onToggle={toggle} />
          ))}
        </Rig>
        <EffectComposer>
          <Bloom mipmapBlur intensity={0.9} luminanceThreshold={0.75} luminanceSmoothing={0.2} />
        </EffectComposer>
      </Canvas>
      <Hud sim={sim} health={health} />
    </div>
  );
}
