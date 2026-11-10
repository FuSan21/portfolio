"use client";

import { Canvas, useFrame, type RootState } from "@react-three/fiber";
import type { MotionValue } from "framer-motion";
import { useEffect, useMemo, useRef, useState, type RefObject } from "react";
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Group,
  InstancedBufferAttribute,
  InstancedMesh,
  LineBasicMaterial,
  LineSegments,
  Plane,
  PlaneGeometry,
  ShaderMaterial,
  Vector3,
} from "three";
import { buildCompile, STAGES, STAGE_COUNT, type CompileBuild } from "./layouts";

const LAST = STAGE_COUNT - 1;

type Control = { p: number; target: number; auto: boolean; hover: boolean; scroll: MotionValue<number> | null };
type Hud = {
  stage: RefObject<HTMLParagraphElement | null>;
  index: RefObject<HTMLParagraphElement | null>;
  caption: RefObject<HTMLParagraphElement | null>;
  bar: RefObject<HTMLDivElement | null>;
};

const vertex = /* glsl */ `
  attribute vec2 aCell;
  attribute vec3 aColor;
  uniform vec2 uGrid;
  varying vec2 vUv;
  varying vec3 vColor;
  void main() {
    vUv = (uv + aCell) / uGrid;
    vColor = aColor;
    gl_Position = projectionMatrix * modelViewMatrix * instanceMatrix * vec4(position, 1.0);
  }
`;
const fragment = /* glsl */ `
  uniform sampler2D uAtlas;
  varying vec2 vUv;
  varying vec3 vColor;
  void main() {
    float a = texture2D(uAtlas, vUv).a;
    if (a < 0.04) discard;
    gl_FragColor = vec4(vColor, a);
    #include <colorspace_fragment>
  }
`;

const createGlyphs = (b: CompileBuild) => {
  const geometry = new PlaneGeometry(1, 1);
  geometry.setAttribute("aCell", new InstancedBufferAttribute(b.cells, 2));
  geometry.setAttribute(
    "aColor",
    new InstancedBufferAttribute(new Float32Array(b.color[0]), 3)
  );
  const material = new ShaderMaterial({
    uniforms: { uAtlas: { value: b.atlas }, uGrid: { value: [16, b.atlasRows] } },
    vertexShader: vertex,
    fragmentShader: fragment,
    transparent: true,
    depthWrite: false,
  });
  const mesh = new InstancedMesh(geometry, material, b.count);
  mesh.frustumCulled = false;

  const lineGeo = new BufferGeometry();
  lineGeo.setAttribute("position", new BufferAttribute(b.edges, 3));
  const lineMat = new LineBasicMaterial({
    color: "#7D8CFF",
    transparent: true,
    opacity: 0,
    blending: AdditiveBlending,
    depthWrite: false,
  });
  const lines = new LineSegments(lineGeo, lineMat);
  lines.frustumCulled = false;

  return {
    mesh,
    lines,
    disp: new Float32Array(b.count * 2),
    plane: new Plane(new Vector3(0, 0, 1), 0),
    hit: new Vector3(),
    last: { stage: -1 },
    dispose: () => {
      geometry.dispose();
      material.dispose();
      lineGeo.dispose();
      lineMat.dispose();
    },
  };
};

const smooth = (x: number) => {
  const t = Math.min(1, Math.max(0, x));
  return t * t * (3 - 2 * t);
};

const captionFor = (b: CompileBuild, stage: number) =>
  [
    `rules.ts, disassembled: ${b.count.toLocaleString()} glyphs adrift`,
    `${b.codeCount} characters snap into ${b.tokenCount} tokens, the noise is dropped`,
    `tokens hang from ${b.nodeCount} AST nodes`,
    `the tree collapses into ${b.lineCount} aligned lines`,
    `output written: one headline`,
  ][stage];

type Objects = ReturnType<typeof createGlyphs>;

const tick = (
  state: RootState,
  dt: number,
  build: CompileBuild,
  objects: Objects,
  ctl: Control,
  hud: Hud,
  g: Group
) => {
  const s = ctl;
  const t = state.clock.elapsedTime;
  const auto = Math.min(LAST, Math.max(0, t * 0.42 - 0.5));
  // With a scroll source, Source → Lex plays on its own and scroll does the rest.
  if (s.scroll) s.target = Math.max(Math.min(1, auto), s.scroll.get() * LAST);
  else if (s.auto) s.target = auto;
  s.p += (s.target - s.p) * (1 - Math.exp(-dt * 3.5));
  const p = s.p;
  const a = Math.min(LAST - 1, Math.floor(p));
  const frac = p - a;
  const { mesh, lines, disp, plane, hit, last } = objects;
  const { camera, size, raycaster } = state;

  // Fit the two-column code / headline (~14 units wide) on any aspect.
  const aspect = size.width / Math.max(1, size.height);
  const fitZ = 7.4 / (Math.tan((20 * Math.PI) / 180) * aspect);
  camera.position.z += (Math.max(11, fitZ) - camera.position.z) * 0.1;

  const loose = Math.min(1, Math.max(0, 3 - p));
  g.rotation.y += (Math.sin(t * 0.22) * 0.55 * loose + state.pointer.x * 0.08 - g.rotation.y) * 0.05;
  g.rotation.x += (-state.pointer.y * 0.06 * loose + 0.12 * loose - g.rotation.x) * 0.05;
  g.updateMatrixWorld();

  let px = 1e9;
  let py = 1e9;
  if (s.hover) {
    raycaster.setFromCamera(state.pointer, camera);
    if (raycaster.ray.intersectPlane(plane, hit)) {
      g.worldToLocal(hit);
      px = hit.x;
      py = hit.y;
    }
  }

  const A = build.pos[a], B = build.pos[a + 1];
  const rA = build.rot[a], rB = build.rot[a + 1];
  const sA = build.scale[a], sB = build.scale[a + 1];
  const cA = build.color[a], cB = build.color[a + 1];
  const m = mesh.instanceMatrix.array as Float32Array;
  const colorAttr = mesh.geometry.getAttribute("aColor") as InstancedBufferAttribute;
  const col = colorAttr.array as Float32Array;
  const drift = 0.07 * Math.max(0, 1 - p) + 0.025 * Math.max(0, 1 - Math.abs(p - 2));
  const R = 1.1;

  for (let i = 0; i < build.count; i++) {
    const f = smooth((frac - 0.06 - build.order[i] * 0.38) / 0.5);
    const i3 = i * 3;
    let x = A[i3] + (B[i3] - A[i3]) * f;
    let y = A[i3 + 1] + (B[i3 + 1] - A[i3 + 1]) * f;
    const z = A[i3 + 2] + (B[i3 + 2] - A[i3 + 2]) * f;
    const r = rA[i] + (rB[i] - rA[i]) * f;
    const sc = sA[i] + (sB[i] - sA[i]) * f;
    for (let k = 0; k < 3; k++) col[i3 + k] = cA[i3 + k] + (cB[i3 + k] - cA[i3 + k]) * f;

    x += Math.sin(t * 0.7 + i * 1.7) * drift;
    y += Math.cos(t * 0.6 + i * 2.3) * drift;

    // Magnet: push away from the cursor, spring back.
    const dx = x - px, dy = y - py;
    const d = Math.sqrt(dx * dx + dy * dy) + 1e-4;
    const push = d < R ? (1 - d / R) ** 2 * 0.9 : 0;
    const i2 = i * 2;
    disp[i2] += ((dx / d) * push - disp[i2]) * 0.14;
    disp[i2 + 1] += ((dy / d) * push - disp[i2 + 1]) * 0.14;
    x += disp[i2];
    y += disp[i2 + 1];

    const c = Math.cos(r) * sc, sn = Math.sin(r) * sc;
    const o = i * 16;
    m[o] = c; m[o + 1] = sn; m[o + 2] = 0; m[o + 3] = 0;
    m[o + 4] = -sn; m[o + 5] = c; m[o + 6] = 0; m[o + 7] = 0;
    m[o + 8] = 0; m[o + 9] = 0; m[o + 10] = sc; m[o + 11] = 0;
    m[o + 12] = x; m[o + 13] = y; m[o + 14] = z; m[o + 15] = 1;
  }
  mesh.instanceMatrix.needsUpdate = true;
  colorAttr.needsUpdate = true;
  (lines.material as LineBasicMaterial).opacity =
    0.4 * Math.max(0, 1 - Math.abs(p - 2) * 1.8);

  // HUD
  const stage = Math.round(p);
  if (hud.bar.current) hud.bar.current.style.transform = `scaleX(${p / LAST})`;
  if (stage !== last.stage) {
    last.stage = stage;
    if (hud.stage.current) hud.stage.current.textContent = STAGES[stage];
    if (hud.index.current)
      hud.index.current.textContent = `tsc --stage ${String(stage + 1).padStart(2, "0")}/${String(STAGE_COUNT).padStart(2, "0")}`;
    if (hud.caption.current) hud.caption.current.textContent = captionFor(build, stage);
  }
};

const Glyphs = ({ build, ctl, hud }: { build: CompileBuild; ctl: RefObject<Control>; hud: Hud }) => {
  const objects = useMemo(() => createGlyphs(build), [build]);
  const group = useRef<Group>(null);

  useEffect(() => () => objects.dispose(), [objects]);

  useFrame((state, dt) => {
    if (group.current) tick(state, dt, build, objects, ctl.current, hud, group.current);
  });

  return (
    <group ref={group}>
      <primitive object={objects.lines} />
      <primitive object={objects.mesh} />
    </group>
  );
};

export default function CompileScene({ progress }: { progress?: MotionValue<number> }) {
  const container = useRef<HTMLDivElement>(null);
  const ctl = useRef<Control>({ p: 0, target: 0, auto: true, hover: false, scroll: progress ?? null });
  const stageRef = useRef<HTMLParagraphElement>(null);
  const indexRef = useRef<HTMLParagraphElement>(null);
  const captionRef = useRef<HTMLParagraphElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const [build, setBuild] = useState<CompileBuild | null>(null);

  useEffect(() => {
    let cancelled = false;
    let built: CompileBuild | null = null;
    buildCompile().then((b) => {
      if (cancelled) return b.atlas.dispose();
      built = b;
      setBuild(b);
    });
    return () => {
      cancelled = true;
      built?.atlas.dispose();
    };
  }, []);

  useEffect(() => {
    const el = container.current;
    // Page scroll drives the scene in the hero, so leave the wheel alone there.
    if (!el || progress) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const s = ctl.current;
      const delta = e.deltaY * (e.deltaMode === 1 ? 16 : 1);
      s.auto = false;
      s.target = Math.min(LAST, Math.max(0, s.target + delta * 0.0016));
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [progress]);

  return (
    <div
      ref={container}
      className="absolute inset-0"
      onPointerEnter={() => (ctl.current.hover = true)}
      onPointerLeave={() => (ctl.current.hover = false)}
    >
      <Canvas
        flat
        dpr={[1, 1.75]}
        camera={{ position: [0, 0, 11], fov: 40, near: 0.1, far: 80 }}
        gl={{ antialias: true, alpha: true }}
        onPointerMove={() => (ctl.current.hover = true)}
      >
        {build && <Glyphs build={build} ctl={ctl} hud={{ stage: stageRef, index: indexRef, caption: captionRef, bar: barRef }} />}
      </Canvas>
      <div className="pointer-events-none absolute left-6 top-6 w-72 md:left-10">
        <p ref={indexRef} className="mono-label text-copy">tsc --stage 01/05</p>
        <p ref={stageRef} className="font-display text-5xl text-form">Source</p>
        <p ref={captionRef} className="mono-label mt-2 text-form/60">loading glyph atlas</p>
        <div className="mt-4 h-px w-full bg-form/15">
          <div ref={barRef} className="h-px w-full origin-left scale-x-0 bg-stamp" />
        </div>
        <div className="mono-label mt-2 flex justify-between text-[10px] text-form/40">
          {STAGES.map((s) => (
            <span key={s}>{s}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
