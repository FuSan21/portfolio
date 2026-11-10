"use client";

import { Text } from "@react-three/drei";
import { Canvas, useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import {
  BallCollider,
  CuboidCollider,
  Physics,
  RigidBody,
  type IntersectionEnterPayload,
} from "@react-three/rapier";
import { useEffect, useRef, useState, type RefObject } from "react";
import * as THREE from "three";
import { HERO_FONT } from "@/components/heroes/shared";

const CARBON = "#0F1226";
const LEDGER = "#1A1E3A";
const COPY = "#7D8CFF";
const FORM = "#E6E2D6";
const GREENBAR = "#B9D8B0";
const STAMP = "#E0473A";

// Invented sample rules, one per peg row.
const RULES = [
  "age >= 18",
  "premium in range",
  "replacement ok",
  "income verified",
  "no open NIGO",
  "suitability signed",
  "liquidity >= 10%",
] as const;

const HALF_W = 4;
const TOP = 6;
const FLOOR = -5;
const BIN_TOP = -3.1;
const SPACING = 0.95;
const PEG_R = 0.12;
const TOKEN_R = 0.18;
const MAX_TOKENS = 24;
const CENTER_X = -1.3; // board plus the rule labels on its left

const PEGS = RULES.flatMap((_, row) => {
  const count = row % 2 === 0 ? 8 : 7;
  const y = 3.8 - row * SPACING;
  return Array.from({ length: count }, (_, i) => ({
    row,
    x: (i - (count - 1) / 2) * SPACING,
    y,
  }));
});

const BINS = [
  { key: "FAIL", x: -2.667, color: FORM },
  { key: "PASS", x: 0, color: GREENBAR },
  { key: "PEND", x: 2.667, color: COPY },
] as const;
type BinKey = (typeof BINS)[number]["key"];
type Counts = Record<BinKey, number>;

type Flash = { pegs: number[]; rows: number[]; bins: number[] };

function FitCamera() {
  const camera = useThree((s) => s.camera);
  const size = useThree((s) => s.size);
  useEffect(() => {
    const cam = camera as THREE.PerspectiveCamera;
    const t = Math.tan(((cam.fov / 2) * Math.PI) / 180);
    const aspect = size.width / size.height;
    const d = Math.max(15 / 2 / t, 14 / 2 / (t * aspect));
    // Sit a little low and look up, so the board reads as tilted.
    cam.position.set(CENTER_X + 0.6, -0.4 - d * 0.16, d);
    cam.lookAt(CENTER_X, 0.1, 0);
    cam.updateProjectionMatrix();
  }, [camera, size]);
  return null;
}

function Token({ id, x }: { id: number; x: number }) {
  return (
    <RigidBody
      colliders={false}
      position={[x, 5.4, 0]}
      enabledTranslations={[true, true, false]}
      enabledRotations={[false, false, true]}
      ccd
      userData={{ token: id }}
    >
      <BallCollider args={[TOKEN_R]} restitution={0.45} friction={0.05} />
      <mesh>
        <sphereGeometry args={[TOKEN_R, 24, 16]} />
        <meshStandardMaterial
          color={FORM}
          emissive={FORM}
          emissiveIntensity={1.6}
          toneMapped={false}
        />
      </mesh>
    </RigidBody>
  );
}

function Wall({ x, y, w, h }: { x: number; y: number; w: number; h: number }) {
  return (
    <RigidBody type="fixed" colliders={false} position={[x, y, 0]}>
      <CuboidCollider args={[w / 2, h / 2, 0.5]} friction={0.1} />
      <mesh>
        <boxGeometry args={[w, h, 0.3]} />
        <meshStandardMaterial color={LEDGER} emissive={COPY} emissiveIntensity={0.35} />
      </mesh>
    </RigidBody>
  );
}

function Board({
  flash,
  counts,
  decided,
  onHit,
  onLand,
  onDrop,
}: {
  flash: RefObject<Flash>;
  counts: Counts;
  decided: boolean;
  onHit: (peg: number) => void;
  onLand: (bin: number, p: IntersectionEnterPayload) => void;
  onDrop: (e: ThreeEvent<PointerEvent>) => void;
}) {
  const pegMats = useRef<(THREE.MeshStandardMaterial | null)[]>([]);
  const binMats = useRef<(THREE.MeshBasicMaterial | null)[]>([]);
  const labels = useRef<({ fillOpacity: number } | null)[]>([]);
  const hot = new THREE.Color(FORM);
  const cool = new THREE.Color(COPY);

  useFrame((_, dt) => {
    const f = flash.current;
    const decay = Math.exp(-dt * 3.5);
    f.pegs.forEach((v, i) => {
      const m = pegMats.current[i];
      if (m) {
        m.emissiveIntensity = 0.9 + v * 5;
        m.emissive.copy(cool).lerp(hot, v);
      }
      f.pegs[i] = v * decay;
    });
    f.rows.forEach((v, r) => {
      const l = labels.current[r];
      if (l) l.fillOpacity = 0.35 + 0.65 * v;
      f.rows[r] = v * Math.exp(-dt * 1.5);
    });
    f.bins.forEach((v, b) => {
      const m = binMats.current[b];
      const base = decided && BINS[b].key === "PASS" ? 0.55 : 0.08;
      if (m) m.opacity = base + v * 0.6;
      f.bins[b] = v * decay;
    });
  });

  return (
    <group>
      {/* Click catcher and backplate */}
      <mesh position={[0, 0, -0.6]} onPointerDown={onDrop}>
        <planeGeometry args={[80, 80]} />
        <meshBasicMaterial color={CARBON} />
      </mesh>
      <mesh position={[0, (TOP + FLOOR) / 2, -0.4]}>
        <planeGeometry args={[HALF_W * 2, TOP - FLOOR]} />
        <meshStandardMaterial color={LEDGER} emissive={COPY} emissiveIntensity={0.05} />
      </mesh>

      <Wall x={-HALF_W - 0.1} y={(TOP + FLOOR) / 2} w={0.2} h={TOP - FLOOR} />
      <Wall x={HALF_W + 0.1} y={(TOP + FLOOR) / 2} w={0.2} h={TOP - FLOOR} />
      <Wall x={0} y={FLOOR - 0.1} w={HALF_W * 2 + 0.4} h={0.2} />
      <Wall x={-1.333} y={(BIN_TOP + FLOOR) / 2} w={0.1} h={BIN_TOP - FLOOR} />
      <Wall x={1.333} y={(BIN_TOP + FLOOR) / 2} w={0.1} h={BIN_TOP - FLOOR} />

      {PEGS.map((p, i) => (
        <RigidBody
          key={i}
          type="fixed"
          colliders={false}
          position={[p.x, p.y, 0]}
          onCollisionEnter={() => onHit(i)}
        >
          <BallCollider args={[PEG_R]} restitution={0.5} />
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[PEG_R, PEG_R, 0.5, 20]} />
            <meshStandardMaterial
              ref={(m) => {
                pegMats.current[i] = m;
              }}
              color={LEDGER}
              emissive={COPY}
              emissiveIntensity={0.9}
              toneMapped={false}
            />
          </mesh>
        </RigidBody>
      ))}

      {RULES.map((rule, r) => (
        <Text font={HERO_FONT}
          key={rule}
          ref={(t: { fillOpacity: number } | null) => {
            labels.current[r] = t;
          }}
          position={[-HALF_W - 0.35, 3.8 - r * SPACING, 0]}
          fontSize={0.26}
          anchorX="right"
          anchorY="middle"
          color={FORM}
          fillOpacity={0.35}
        >
          {rule}
        </Text>
      ))}

      {BINS.map((bin, b) => (
        <group key={bin.key} position={[bin.x, 0, 0]}>
          <mesh position={[0, (BIN_TOP + FLOOR) / 2, -0.3]}>
            <planeGeometry args={[2.55, BIN_TOP - FLOOR]} />
            <meshBasicMaterial
              ref={(m) => {
                binMats.current[b] = m;
              }}
              color={bin.color}
              transparent
              opacity={0.08}
              toneMapped={false}
            />
          </mesh>
          <CuboidCollider
            sensor
            args={[1.2, 0.35, 0.5]}
            position={[0, FLOOR + 0.35, 0]}
            onIntersectionEnter={(p) => onLand(b, p)}
          />
          <Text font={HERO_FONT} position={[0, FLOOR - 0.6, 0]} fontSize={0.42} color={bin.color} anchorY="middle">
            {bin.key}
          </Text>
          <Text font={HERO_FONT}
            position={[0, FLOOR - 1.1, 0]}
            fontSize={0.24}
            color={FORM}
            fillOpacity={0.6}
            anchorY="middle"
          >
            {String(counts[bin.key]).padStart(3, "0")}
          </Text>
        </group>
      ))}
    </group>
  );
}

export default function Scene() {
  const [tokens, setTokens] = useState<{ id: number; x: number }[]>([]);
  const [counts, setCounts] = useState<Counts>({ FAIL: 0, PASS: 0, PEND: 0 });
  const nextId = useRef(0);
  const landed = useRef(new Set<number>());
  const flash = useRef<Flash>({
    pegs: PEGS.map(() => 0),
    rows: RULES.map(() => 0),
    bins: BINS.map(() => 0),
  });
  const decided = counts.PASS >= 3;

  const drop = (x: number) => {
    const id = nextId.current++;
    const jitter = (Math.random() - 0.5) * 0.12;
    const clamped = Math.max(-HALF_W + 0.4, Math.min(HALF_W - 0.4, x + jitter));
    setTokens((t) => [...t, { id, x: clamped }].slice(-MAX_TOKENS));
  };

  const onHit = (peg: number) => {
    flash.current.pegs[peg] = 1;
    flash.current.rows[PEGS[peg].row] = 1;
  };

  const onLand = (bin: number, p: IntersectionEnterPayload) => {
    const id = (p.other.rigidBodyObject?.userData as { token?: number } | undefined)?.token;
    if (typeof id !== "number" || landed.current.has(id)) return;
    landed.current.add(id);
    flash.current.bins[bin] = 1;
    const key = BINS[bin].key;
    setCounts((c) => ({ ...c, [key]: c[key] + 1 }));
    window.setTimeout(() => setTokens((t) => t.filter((tk) => tk.id !== id)), 2200);
  };

  useEffect(() => {
    const t = window.setTimeout(() => {
      setTokens((t) => [{ id: -1, x: 0.07 }, ...t]);
    }, 500);
    return () => window.clearTimeout(t);
  }, []);

  return (
    <div className="absolute inset-0">
      <Canvas camera={{ fov: 40, position: [0, 0, 20] }} dpr={[1, 2]}>
        <color attach="background" args={[CARBON]} />
        <ambientLight intensity={0.4} />
        <pointLight position={[0, 2, 4]} intensity={30} color={COPY} />
        <FitCamera />
        <Physics gravity={[0, -12, 0]}>
          <Board
            flash={flash}
            counts={counts}
            decided={decided}
            onHit={onHit}
            onLand={onLand}
            onDrop={(e) => drop(e.point.x)}
          />
          {tokens.map((t) => (
            <Token key={t.id} id={t.id} x={t.x} />
          ))}
        </Physics>
        <EffectComposer>
          <Bloom mipmapBlur intensity={0.9} luminanceThreshold={0.55} luminanceSmoothing={0.2} />
        </EffectComposer>
      </Canvas>

      {decided && (
        <div className="pointer-events-none absolute right-6 top-6 md:right-12 md:top-10">
          <div
            className="-rotate-6 border-4 px-5 py-3 font-display text-3xl uppercase md:text-5xl"
            style={{ borderColor: STAMP, color: STAMP }}
          >
            Decision: PASS
          </div>
          <p className="mono-label mt-3 text-right text-form/60">
            3 applications cleared every rule
          </p>
        </div>
      )}
    </div>
  );
}
