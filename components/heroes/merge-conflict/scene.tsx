"use client";

import { Text } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Bloom, DepthOfField, EffectComposer, Vignette } from "@react-three/postprocessing";
import type { MotionValue } from "framer-motion";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { HERO_FONT } from "@/components/heroes/shared";

// ---------------------------------------------------------------------------
// Data: two invented versions of the same function. Rows either match or
// conflict; a conflict names its winner.
// ---------------------------------------------------------------------------
type Row = { ours: string; theirs: string; win: "ours" | "theirs" | "same" };
const ROWS: Row[] = [
  { ours: "export async function normalize(rows) {", theirs: "export async function normalize(rows) {", win: "same" },
  { ours: "  const clean = rows.filter(isRecord);", theirs: "  const clean = rows.filter(Boolean);", win: "ours" },
  { ours: "  const out = [];", theirs: "  const out = [];", win: "same" },
  { ours: "  for (const r of clean) {", theirs: "  for await (const r of stream(clean)) {", win: "theirs" },
  { ours: "    const typed = coerce(r, schema);", theirs: "    const typed = coerce(r, schema);", win: "same" },
  { ours: "    if (!typed) continue;", theirs: "    if (!typed) throw new ParseError(r);", win: "theirs" },
  { ours: "    out.push(typed);", theirs: "    out.push(typed);", win: "same" },
  { ours: "  }", theirs: "  }", win: "same" },
  { ours: "  return out;", theirs: "  return dedupe(out, \"id\");", win: "theirs" },
  { ours: "}", theirs: "}", win: "same" },
];
const CONFLICTS = ROWS.flatMap((r, i) => (r.win === "same" ? [] : [i]));

const C = {
  carbon: "#0F1226",
  ledger: "#1A1E3A",
  copy: "#7D8CFF",
  form: "#E6E2D6",
  green: "#B9D8B0",
  stamp: "#E0473A",
};
const FORM = new THREE.Color(C.form);
const GREEN = new THREE.Color(C.green);
const STAMP = new THREE.Color(C.stamp);
const COPY = new THREE.Color(C.copy);
const HOT = new THREE.Color(C.stamp).multiplyScalar(4);

const PANE_W = 4.4;
const PANE_H = 4.2;
const LINE_X = -PANE_W / 2 + 0.25;
const rowY = (i: number) => 1.4 - i * 0.33;
const PANE_GEO = new THREE.PlaneGeometry(PANE_W, PANE_H);
const HEADER_GEO = new THREE.PlaneGeometry(PANE_W, 0.42);
const EDGE_GEO = new THREE.EdgesGeometry(PANE_GEO);

// Phase boundaries on the 0..1 progress value.
const APPROACH = [0, 0.25] as const;
const COLLIDE = [0.25, 0.45] as const;
const RESOLVE = [0.45, 0.78] as const;
const COMMIT = [0.78, 1] as const;

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const ease = (v: number) => {
  const t = clamp01(v);
  return t * t * (3 - 2 * t);
};
const phase = (p: number, [a, b]: readonly [number, number]) => clamp01((p - a) / (b - a));

// Sparks: deterministic per-particle ballistic paths so scrubbing works both ways.
const SPARKS = 260;
const sparkSeeds = Array.from({ length: SPARKS }, (_, i) => {
  const r = (n: number) => {
    const x = Math.sin(i * 127.1 + n * 311.7) * 43758.5453;
    return x - Math.floor(x);
  };
  return {
    row: CONFLICTS[i % CONFLICTS.length],
    vx: (r(1) - 0.5) * 5,
    vy: r(2) * 3 - 0.6,
    vz: (r(3) - 0.2) * 3,
    delay: r(4) * 0.35,
  };
});

type TextMesh = THREE.Mesh & { fillOpacity: number; color: THREE.Color | string | number };
type Shared = { target: number; auto: boolean; progress: number };

// ---------------------------------------------------------------------------
function Rig({ scroll }: { scroll?: MotionValue<number> }) {
  const shared = useRef<Shared>({ target: 0, auto: true, progress: 0 });
  const canvas = useThree((st) => st.gl.domElement);

  // Wheel on the canvas scrubs progress; first touch cancels the autoplay.
  // Skipped when page scroll drives the scene, so the wheel still scrolls the page.
  useEffect(() => {
    if (scroll) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const s = shared.current;
      s.auto = false;
      s.target = clamp01(s.target + e.deltaY * 0.0006);
    };
    canvas.addEventListener("wheel", onWheel, { passive: false });
    return () => canvas.removeEventListener("wheel", onWheel);
  }, [canvas, scroll]);

  const panes = useRef<(THREE.Group | null)[]>([]);
  const paneMats = useRef<(THREE.MeshBasicMaterial | null)[]>([]);
  const headerMats = useRef<(THREE.MeshBasicMaterial | null)[]>([]);
  const edgeMats = useRef<(THREE.LineBasicMaterial | null)[]>([]);
  const labels = useRef<(TextMesh | null)[]>([]);
  const lines = useRef<(TextMesh | null)[]>([]);
  const markers = useRef<(TextMesh | null)[]>([]);
  const centerMat = useRef<THREE.MeshBasicMaterial>(null);
  const centerEdge = useRef<THREE.LineBasicMaterial>(null);
  const headline = useRef<TextMesh>(null);
  const stamp = useRef<THREE.Group>(null);
  const stampText = useRef<TextMesh>(null);
  const stampEdge = useRef<THREE.LineBasicMaterial>(null);
  const sparkGeo = useRef<THREE.BufferGeometry>(null);
  const tmp = useRef({ v: new THREE.Vector3(), q: new THREE.Quaternion(), id: new THREE.Quaternion(), c: new THREE.Color() });

  useFrame((state, dt) => {
    const s = shared.current;
    const t = state.clock.elapsedTime;
    // With a scroll source, the approach plays on its own and scroll does the rest.
    if (scroll) s.target = Math.max(Math.min(APPROACH[1], (t - 0.6) / 11), scroll.get());
    else if (s.auto) s.target = clamp01((t - 0.6) / 11);
    s.progress = THREE.MathUtils.damp(s.progress, s.target, 4, dt);
    const p = s.progress;
    const { v, q, id, c } = tmp.current;

    // Camera parallax.
    const cam = state.camera;
    cam.position.x = THREE.MathUtils.damp(cam.position.x, state.pointer.x * 0.7, 3, dt);
    cam.position.y = THREE.MathUtils.damp(cam.position.y, state.pointer.y * 0.45, 3, dt);
    cam.lookAt(0, 0, 0);

    const a = ease(phase(p, APPROACH));
    const col = phase(p, COLLIDE);
    const res = phase(p, RESOLVE);
    const com = phase(p, COMMIT);
    const bump = Math.sin(Math.PI * col);
    const shake = bump * 0.07;
    const frameOpacity = 1 - ease(res * 2.2);

    // Panes.
    for (let k = 0; k < 2; k++) {
      const side = k === 0 ? -1 : 1;
      const g = panes.current[k];
      if (!g) continue;
      g.position.set(
        side * (THREE.MathUtils.lerp(10, 2.3, a) - 0.18 * bump + ease(res) * 1.2) + Math.sin(t * 70 + k) * shake,
        Math.cos(t * 55 + k * 2) * shake * 0.6,
        THREE.MathUtils.lerp(-5, 0, a) - ease(res) * 1.5,
      );
      g.rotation.set(Math.sin(t * 40) * shake * 0.3, -side * THREE.MathUtils.lerp(0.8, 0.12, a), side * (1 - a) * 0.15);
      g.updateMatrixWorld();
      const pm = paneMats.current[k];
      if (pm) pm.opacity = 0.1 * frameOpacity + bump * 0.06;
      const hm = headerMats.current[k];
      if (hm) hm.opacity = 0.45 * frameOpacity;
      const em = edgeMats.current[k];
      if (em) em.opacity = frameOpacity * (0.7 + bump * 0.3);
      const lb = labels.current[k];
      if (lb) lb.fillOpacity = frameOpacity;
    }

    // Code lines: 2 per row (ours, theirs).
    ROWS.forEach((row, i) => {
      for (let k = 0; k < 2; k++) {
        const line = lines.current[i * 2 + k];
        const pane = panes.current[k];
        if (!line || !pane) continue;
        const side = k === 0 ? -1 : 1;
        const mine = k === 0 ? "ours" : "theirs";
        const isConflict = row.win !== "same";
        const winner = row.win === mine || (row.win === "same" && k === 0);
        const dup = row.win === "same" && k === 1;

        v.set(LINE_X, rowY(i), 0.02);
        pane.localToWorld(v);
        pane.getWorldQuaternion(q);
        const ti = ease((res - i * 0.04 - k * 0.025) / 0.5);

        let opacity = 1;
        c.copy(FORM);
        if (isConflict && col > 0 && res === 0) c.lerp(k === 0 ? COPY : STAMP, bump * 0.9);

        if (winner || dup) {
          const sx = LINE_X, sy = rowY(i), sz = 0.4;
          line.position.set(
            THREE.MathUtils.lerp(v.x, sx, ti),
            THREE.MathUtils.lerp(v.y, sy, ti),
            THREE.MathUtils.lerp(v.z, sz, ti) + Math.sin(Math.PI * ti) * 1.6,
          );
          line.quaternion.copy(q).slerp(id, ti);
          line.rotateZ(Math.sin(Math.PI * ti) * 0.35 * side);
          if (winner) c.lerp(GREEN, ti * (isConflict ? 1 : 0.55));
          if (dup) opacity = 1 - ease((ti - 0.75) / 0.25);
        } else {
          // Loser: knocked out of the deal.
          line.position.set(v.x + side * 3 * ti, v.y - 3.5 * ti * ti, v.z - 1.2 * ti);
          line.quaternion.copy(q);
          line.rotateZ(side * ti * 1.4);
          c.lerp(STAMP, ti);
          opacity = 1 - ti;
        }

        // Commit: merged stack collapses into the headline.
        if (com > 0) {
          const ck = ease((com - i * 0.02) / 0.4);
          line.position.y = THREE.MathUtils.lerp(line.position.y, 0, ck);
          line.position.x = THREE.MathUtils.lerp(line.position.x, -1.4, ck);
          line.scale.set(1 - ck * 0.6, 1 - ck * 0.95, 1);
          opacity *= 1 - ck;
        } else {
          line.scale.setScalar(1);
        }
        line.fillOpacity = opacity;
        line.visible = opacity > 0.01;
        line.color = c.getHex();
      }
    });

    // Conflict markers burst at the seam.
    CONFLICTS.forEach((row, j) => {
      for (let m = 0; m < 3; m++) {
        const mk = markers.current[j * 3 + m];
        if (!mk) continue;
        const lt = clamp01((col - 0.15 - j * 0.08) / 0.55);
        const flash = Math.sin(Math.PI * lt);
        const dir = m - 1;
        mk.position.set(dir * lt * 1.4, rowY(row) + dir * 0.12 + 0.05, 0.6 + flash * 0.5);
        mk.scale.setScalar(0.6 + flash * 0.7);
        mk.fillOpacity = flash * (1 - res);
        mk.visible = flash > 0.01;
      }
    });

    // Sparks.
    const geo = sparkGeo.current;
    if (geo) {
      const pos = geo.attributes.position as THREE.BufferAttribute;
      sparkSeeds.forEach((sd, i) => {
        const st = (col - 0.12 - sd.delay) * 3.5;
        if (st <= 0 || st > 1 || res > 0) {
          pos.setXYZ(i, 0, 0, -200);
          return;
        }
        pos.setXYZ(i, sd.vx * st, rowY(sd.row) + sd.vy * st - 2.4 * st * st, 0.5 + sd.vz * st);
      });
      pos.needsUpdate = true;
    }

    // Merged pane frame.
    const centerO = ease((res - 0.25) / 0.5) * (1 - ease(com * 2));
    if (centerMat.current) centerMat.current.opacity = 0.1 * centerO;
    if (centerEdge.current) centerEdge.current.opacity = centerO;

    // Headline + stamp.
    const h = headline.current;
    if (h) {
      const ho = ease((com - 0.3) / 0.35);
      h.fillOpacity = ho;
      h.scale.setScalar(0.85 + ho * 0.15);
      h.visible = ho > 0.01;
    }
    const sg = stamp.current;
    if (sg) {
      const so = clamp01((com - 0.72) / 0.12);
      const punch = 1 + (1 - ease(so)) * 1.6;
      sg.scale.setScalar(punch);
      sg.visible = so > 0.01;
      if (stampText.current) stampText.current.fillOpacity = so;
      if (stampEdge.current) stampEdge.current.opacity = so;
    }
  });

  return (
    <>
      {(["HEAD", "feature/rewrite"] as const).map((label, k) => {
        const tint = k === 0 ? C.copy : C.stamp;
        return (
          <group key={label} ref={(el) => void (panes.current[k] = el)}>
            <mesh geometry={PANE_GEO}>
              <meshBasicMaterial ref={(el) => void (paneMats.current[k] = el)} color={tint} transparent depthWrite={false} side={THREE.DoubleSide} />
            </mesh>
            <lineSegments geometry={EDGE_GEO}>
              <lineBasicMaterial ref={(el) => void (edgeMats.current[k] = el)} color={new THREE.Color(tint).multiplyScalar(2.2)} transparent toneMapped={false} />
            </lineSegments>
            <mesh geometry={HEADER_GEO} position={[0, PANE_H / 2 - 0.21, 0.005]}>
              <meshBasicMaterial ref={(el) => void (headerMats.current[k] = el)} color={tint} transparent depthWrite={false} />
            </mesh>
            <Text font={HERO_FONT}
              ref={(el: TextMesh | null) => void (labels.current[k] = el)}
              position={[LINE_X, PANE_H / 2 - 0.21, 0.02]}
              fontSize={0.15}
              anchorX="left"
              anchorY="middle"
              letterSpacing={0.12}
              color={C.form}
            >
              {`${k === 0 ? "<<<<<<< " : ">>>>>>> "}${label}`}
            </Text>
          </group>
        );
      })}

      {ROWS.flatMap((row, i) =>
        [row.ours, row.theirs].map((code, k) => (
          <Text font={HERO_FONT}
            key={`${i}-${k}`}
            ref={(el: TextMesh | null) => void (lines.current[i * 2 + k] = el)}
            fontSize={0.14}
            anchorX="left"
            anchorY="middle"
            color={C.form}
          >
            {code}
          </Text>
        )),
      )}

      {CONFLICTS.flatMap((row, j) =>
        ["<<<<<<<", "=======", ">>>>>>>"].map((mark, m) => (
          <Text font={HERO_FONT}
            key={`${row}-${m}`}
            ref={(el: TextMesh | null) => void (markers.current[j * 3 + m] = el)}
            fontSize={0.16}
            anchorX="center"
            anchorY="middle"
            color={HOT}
            fontWeight="bold"
          >
            {mark}
          </Text>
        )),
      )}

      <points>
        <bufferGeometry ref={sparkGeo}>
          <bufferAttribute attach="attributes-position" args={[new Float32Array(SPARKS * 3), 3]} />
        </bufferGeometry>
        <pointsMaterial color={new THREE.Color(C.stamp).multiplyScalar(5)} size={0.05} sizeAttenuation toneMapped={false} />
      </points>

      <group position={[0, 0, 0.35]}>
        <mesh geometry={PANE_GEO}>
          <meshBasicMaterial ref={centerMat} color={C.green} transparent depthWrite={false} opacity={0} />
        </mesh>
        <lineSegments geometry={EDGE_GEO}>
          <lineBasicMaterial ref={centerEdge} color={new THREE.Color(C.green).multiplyScalar(1.8)} transparent opacity={0} toneMapped={false} />
        </lineSegments>
      </group>

      <Text font={HERO_FONT} ref={headline} position={[0, 0.15, 0.5]} fontSize={0.62} anchorX="center" anchorY="middle" color={C.form} letterSpacing={-0.02} fillOpacity={0}>
        Untangled, typed, shipped.
      </Text>
      <group ref={stamp} position={[2.55, -0.75, 0.6]} rotation={[0, 0, -0.1]}>
        <lineSegments>
          <edgesGeometry args={[new THREE.PlaneGeometry(3.3, 0.48)]} />
          <lineBasicMaterial ref={stampEdge} color={new THREE.Color(C.stamp).multiplyScalar(2.5)} transparent toneMapped={false} />
        </lineSegments>
        <Text font={HERO_FONT} ref={stampText} fontSize={0.15} anchorX="center" anchorY="middle" letterSpacing={0.06} color={new THREE.Color(C.stamp).multiplyScalar(1.8)}>
          a3f9c21 merge: resolve conflicts
        </Text>
      </group>
    </>
  );
}

// ---------------------------------------------------------------------------
export default function Scene({ progress }: { progress?: MotionValue<number> }) {
  return (
    <div className="absolute inset-0">
      <Canvas camera={{ position: [0, 0, 9], fov: 40 }} dpr={[1, 1.75]} gl={{ antialias: false }}>
        <color attach="background" args={[C.carbon]} />
        <fog attach="fog" args={[C.carbon, 9, 20]} />
        <Rig scroll={progress} />
        <EffectComposer multisampling={0}>
          <DepthOfField worldFocusDistance={8.6} worldFocusRange={4} bokehScale={3} />
          <Bloom mipmapBlur luminanceThreshold={0.75} intensity={1.1} radius={0.7} />
          <Vignette offset={0.25} darkness={0.75} />
        </EffectComposer>
      </Canvas>
    </div>
  );
}
