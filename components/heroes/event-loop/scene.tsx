"use client";

import { Html, Lightformer, Environment, Text } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import type { Group, Mesh, MeshStandardMaterial } from "three";
import { CONVEYOR_Y, EventLoopSim, RADIUS, type MarbleInfo } from "./sim";
import { HERO_FONT } from "@/components/heroes/shared";

const C = {
  carbon: "#0F1226",
  ledger: "#1A1E3A",
  copy: "#7D8CFF",
  form: "#E6E2D6",
  greenbar: "#B9D8B0",
  stamp: "#E0473A",
  brass: "#B8904F",
  darkBrass: "#6E5530",
};
const CHUTE_SLOPE = Math.atan(0.4);

function Brass({ dark = false }: { dark?: boolean }) {
  return (
    <meshStandardMaterial
      color={dark ? C.darkBrass : C.brass}
      metalness={1}
      roughness={dark ? 0.45 : 0.28}
    />
  );
}

function Label({
  children,
  size = 0.18,
  color = C.form,
  ...props
}: {
  children: string;
  size?: number;
  color?: string;
  position: [number, number, number];
  rotation?: [number, number, number];
  anchorX?: "left" | "center" | "right";
}) {
  return (
    <Text font={HERO_FONT} fontSize={size} letterSpacing={0.18} color={color} anchorY="middle" {...props}>
      {children}
    </Text>
  );
}

function Marble({ info, sim }: { info: MarbleInfo; sim: EventLoopSim }) {
  const [hover, setHover] = useState(false);
  const mat = useRef<MeshStandardMaterial>(null);
  const r = RADIUS[info.kind];
  const color = info.kind === "task" ? C.copy : C.greenbar;

  useFrame(() => {
    if (!mat.current) return;
    const target = 0.6 + sim.glow(info.id) * 3.4 + (hover ? 1 : 0);
    mat.current.emissiveIntensity += (target - mat.current.emissiveIntensity) * 0.2;
  });

  return (
    <group ref={(o) => sim.attach(info.id, o)}>
      <mesh
        onPointerOver={(e) => {
          e.stopPropagation();
          setHover(true);
        }}
        onPointerOut={() => setHover(false)}
      >
        <sphereGeometry args={[r, 32, 16]} />
        <meshStandardMaterial
          ref={mat}
          color={color}
          emissive={color}
          emissiveIntensity={0.6}
          metalness={0.3}
          roughness={0.15}
          toneMapped={false}
        />
      </mesh>
      {hover && (
        <Html center position={[0, r + 0.3, 0]} style={{ pointerEvents: "none" }}>
          <div className="whitespace-nowrap rounded-sm border border-form/20 bg-ledger/95 px-2 py-1 font-mono text-[11px] text-form">
            <span className={info.kind === "task" ? "text-copy" : "text-greenbar"}>
              {info.kind === "task" ? "task " : "micro "}
            </span>
            {info.code}
          </div>
        </Html>
      )}
    </group>
  );
}

function CallStack() {
  return (
    <group>
      <mesh>
        <cylinderGeometry args={[0.46, 0.46, 3.4, 48, 1, true]} />
        <meshPhysicalMaterial
          transmission={1}
          thickness={0.25}
          roughness={0.04}
          ior={1.45}
          color="#dfe6ff"
          transparent
          opacity={0.9}
          side={2}
        />
      </mesh>
      {[-1.7, 1.7, 0].map((y) => (
        <mesh key={y} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.49, y === 0 ? 0.025 : 0.06, 12, 48]} />
          <Brass />
        </mesh>
      ))}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * 0.56, 0, -0.1]}>
          <boxGeometry args={[0.06, 3.6, 0.06]} />
          <Brass dark />
        </mesh>
      ))}
      <Label position={[-0.85, 0, 0]} rotation={[0, 0, Math.PI / 2]} color={C.form}>
        CALL STACK
      </Label>
    </group>
  );
}

function Conveyor() {
  const rollers = useRef<Group>(null);
  useFrame((_, dt) => {
    rollers.current?.children.forEach((c) => (c.rotation.y -= dt * 3));
  });
  const length = 7.2;
  const cx = -1 - length / 2;
  return (
    <group>
      <mesh position={[cx, CONVEYOR_Y - 0.05, 0]}>
        <boxGeometry args={[length, 0.1, 0.7]} />
        <meshStandardMaterial color="#14172e" roughness={0.85} />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[cx, CONVEYOR_Y + 0.05, s * 0.38]}>
          <boxGeometry args={[length, 0.08, 0.05]} />
          <Brass />
        </mesh>
      ))}
      <group ref={rollers}>
        {Array.from({ length: 12 }, (_, i) => (
          <mesh
            key={i}
            position={[cx - length / 2 + 0.3 + i * 0.6, CONVEYOR_Y - 0.2, 0]}
            rotation={[Math.PI / 2, 0, 0]}
          >
            <cylinderGeometry args={[0.1, 0.1, 0.74, 12]} />
            <Brass dark />
          </mesh>
        ))}
      </group>
      {/* Lift cup that carries a task up into the bottom of the stack */}
      <mesh position={[0, CONVEYOR_Y + 0.02, 0]}>
        <cylinderGeometry args={[0.5, 0.36, 0.12, 32]} />
        <Brass />
      </mesh>
      <Label position={[cx, CONVEYOR_Y - 0.55, 0]} color={C.copy}>
        TASK QUEUE · setTimeout, events, I/O
      </Label>
    </group>
  );
}

function Chute() {
  const len = 5.6;
  const x0 = 0.6;
  const cx = x0 + (len / 2) * Math.cos(CHUTE_SLOPE);
  const cy = 2.2 + (cx - 0.85) * 0.4 - RADIUS.micro - 0.03;
  return (
    <group position={[cx, cy, 0]} rotation={[0, 0, CHUTE_SLOPE]}>
      <mesh>
        <boxGeometry args={[len, 0.05, 0.4]} />
        <Brass dark />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[0, 0.1, s * 0.2]}>
          <boxGeometry args={[len, 0.16, 0.03]} />
          <Brass />
        </mesh>
      ))}
      <Label position={[0, 0.5, 0]} color={C.greenbar}>
        MICROTASK QUEUE · always first
      </Label>
    </group>
  );
}

function RenderGate({ sim, frame }: { sim: EventLoopSim; frame: number }) {
  const left = useRef<Mesh>(null);
  const right = useRef<Mesh>(null);
  const glow = useRef<MeshStandardMaterial>(null);
  useFrame(() => {
    const g = sim.gate;
    if (left.current) left.current.position.x = -0.32 - g * 0.6;
    if (right.current) right.current.position.x = 0.32 + g * 0.6;
    if (glow.current) glow.current.emissiveIntensity = 0.15 + g * 3;
  });
  return (
    <group position={[3.4, -0.6, 0]}>
      <mesh position={[0, 0, -0.15]}>
        <planeGeometry args={[1.2, 1.4]} />
        <meshStandardMaterial
          ref={glow}
          color={C.greenbar}
          emissive={C.greenbar}
          emissiveIntensity={0.15}
          toneMapped={false}
        />
      </mesh>
      <mesh ref={left} position={[-0.32, 0, 0]}>
        <boxGeometry args={[0.62, 1.4, 0.08]} />
        <meshStandardMaterial color={C.ledger} metalness={0.6} roughness={0.4} />
      </mesh>
      <mesh ref={right} position={[0.32, 0, 0]}>
        <boxGeometry args={[0.62, 1.4, 0.08]} />
        <meshStandardMaterial color={C.ledger} metalness={0.6} roughness={0.4} />
      </mesh>
      {/* Frame. Doors slide behind its uprights. */}
      {[
        [0, 0.78, 1.5, 0.14],
        [0, -0.78, 1.5, 0.14],
        [-0.68, 0, 0.14, 1.7],
        [0.68, 0, 0.14, 1.7],
      ].map(([x, y, w, h], i) => (
        <mesh key={i} position={[x, y, 0.1]}>
          <boxGeometry args={[w, h, 0.2]} />
          <Brass />
        </mesh>
      ))}
      <Label position={[0, 1.1, 0]} color={C.greenbar}>
        RENDER
      </Label>
      <Label position={[0, -1.1, 0]} size={0.14} color={C.form}>
        {`FRAME ${String(frame).padStart(4, "0")}`}
      </Label>
    </group>
  );
}

function Machine({ sim, marbles, frame }: { sim: EventLoopSim; marbles: MarbleInfo[]; frame: number }) {
  useFrame((_, dt) => sim.step(dt));
  return (
    <>
      <color attach="background" args={[C.carbon]} />
      <ambientLight intensity={0.25} />
      <directionalLight position={[-4, 6, 5]} intensity={1.6} color="#ffe2b8" />
      <pointLight position={[0, 0, 1.5]} intensity={4} color={C.copy} distance={4} />
      <Environment resolution={128}>
        <Lightformer form="rect" intensity={2.5} color="#ffd9a0" position={[-5, 4, 4]} scale={[6, 3, 1]} />
        <Lightformer form="rect" intensity={1.2} color={C.copy} position={[5, -2, 3]} scale={[4, 4, 1]} />
        <Lightformer form="ring" intensity={1.5} color="#ffffff" position={[0, 6, -3]} scale={3} />
      </Environment>
      <mesh position={[0, 0, -1.2]}>
        <planeGeometry args={[30, 16]} />
        <meshStandardMaterial color={C.ledger} roughness={0.95} />
      </mesh>
      <CallStack />
      <Conveyor />
      <Chute />
      <RenderGate sim={sim} frame={frame} />
      {marbles.map((m) => (
        <Marble key={m.id} info={m} sim={sim} />
      ))}
      <EffectComposer>
        <Bloom mipmapBlur luminanceThreshold={0.9} intensity={1.1} radius={0.6} />
      </EffectComposer>
    </>
  );
}

export default function Scene() {
  const [sim] = useState(() => new EventLoopSim());
  const snap = useSyncExternalStore(sim.subscribe, sim.getSnapshot, sim.getSnapshot);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.repeat || e.metaKey || e.ctrlKey || e.altKey || e.key === "Tab") return;
      // Keys aimed at a field or control belong to it, not the machine.
      if (e.target instanceof Element && e.target.closest("input, textarea, select, button, a, [contenteditable]")) return;
      sim.spawn("micro");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [sim]);

  return (
    <div className="relative h-full w-full cursor-crosshair" onClick={() => sim.spawn("task")}>
      <Canvas dpr={[1, 2]} camera={{ position: [-0.9, 0.3, 10.5], fov: 42 }}>
        <Machine sim={sim} marbles={snap.marbles} frame={snap.frame} />
      </Canvas>
      <div className="pointer-events-none absolute left-6 top-6 md:left-10">
        <p className="mono-label text-copy">Now on the stack</p>
        <p className="mt-1 font-mono text-sm text-form">{snap.status}</p>
      </div>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          sim.spawn("micro");
        }}
        className="mono-label absolute right-6 top-6 rounded-sm border border-greenbar/50 bg-ledger/80 px-3 py-2 text-greenbar hover:bg-ledger md:right-10"
      >
        + Promise.then
      </button>
    </div>
  );
}
