"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import type { MotionValue } from "framer-motion";
import {
  Component,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type Ref,
} from "react";
import {
  DoubleSide,
  Euler,
  Object3D,
  Quaternion,
  Vector3,
  type CanvasTexture,
  type Group,
  type InstancedMesh,
  type Mesh,
  type ShaderMaterial,
} from "three";

import {
  ATLAS_COLS,
  ATLAS_ROWS,
  buildSceneTextures,
  disposeSceneTextures,
  seededRandom,
  type SceneFonts,
  type SceneTextures,
  type SheetContent,
} from "@/components/sub/normalizer-textures";
import {
  clamp01,
  SHEET_HEIGHT,
  SHEET_WIDTH,
  sheetTravel,
  sheetY,
} from "@/lib/normalizer-timeline";

// The hero's "pass": loose fragments get pulled into a pair of rollers while
// full sheets feed through them, crumpled and degraded above the rollers,
// flat and clean below. Everything is driven by scroll progress; the canvas
// only renders when that progress changes (frameloop="demand").

type SceneProps = {
  progress: MotionValue<number>;
  sheets: readonly SheetContent[];
  projectTotal: number;
  fonts: SceneFonts;
};

const ROLLER_LENGTH = 3.6;
const ROLLER_RADIUS = 0.3;
const FRAGMENT_INTAKE_Y = 0.45;
const FRAGMENT_TRIP = 0.22;

/* ---------------------------------- Rollers --------------------------------- */

const SprocketWheel = ({ y }: { y: number }) => (
  <group position-y={y}>
    <mesh>
      <cylinderGeometry args={[0.42, 0.42, 0.08, 32]} />
      <meshStandardMaterial color="#2A3060" metalness={0.6} roughness={0.35} />
    </mesh>
    {Array.from({ length: 12 }, (_, i) => {
      const angle = (i / 12) * Math.PI * 2;
      return (
        <mesh
          key={i}
          position={[Math.cos(angle) * 0.42, 0, Math.sin(angle) * 0.42]}
        >
          <boxGeometry args={[0.07, 0.06, 0.07]} />
          <meshStandardMaterial color="#E6E2D6" roughness={0.6} />
        </mesh>
      );
    })}
  </group>
);

const Roller = ({ z, spinRef }: { z: number; spinRef: Ref<Group> }) => (
  // Cylinders stand on Y; rotate onto X so the paper feeds downward between them.
  <group position-z={z} rotation-z={Math.PI / 2}>
    <group ref={spinRef}>
      <mesh>
        <cylinderGeometry
          args={[ROLLER_RADIUS, ROLLER_RADIUS, ROLLER_LENGTH, 48]}
        />
        <meshStandardMaterial
          color="#1A1E3A"
          metalness={0.55}
          roughness={0.4}
        />
      </mesh>
      <SprocketWheel y={ROLLER_LENGTH / 2 + 0.04} />
      <SprocketWheel y={-ROLLER_LENGTH / 2 - 0.04} />
    </group>
  </group>
);

const Rollers = ({ progress }: { progress: MotionValue<number> }) => {
  const front = useRef<Group>(null);
  const back = useRef<Group>(null);

  useFrame(() => {
    const angle = progress.get() * 28;
    if (front.current) front.current.rotation.y = angle;
    if (back.current) back.current.rotation.y = -angle;
  });

  return (
    <group>
      <Roller z={ROLLER_RADIUS + 0.03} spinRef={front} />
      <Roller z={-ROLLER_RADIUS - 0.03} spinRef={back} />
      {[-1, 1].map((side) => (
        <mesh key={side} position={[side * (ROLLER_LENGTH / 2 + 0.2), 0, 0]}>
          <boxGeometry args={[0.08, 1.3, 1.5]} />
          <meshStandardMaterial
            color="#151933"
            metalness={0.4}
            roughness={0.5}
          />
        </mesh>
      ))}
    </group>
  );
};

/* --------------------------------- Fragments -------------------------------- */

type Fragment = {
  start: Vector3;
  drift: Vector3;
  intake: Vector3;
  rotation: Quaternion;
  startsAt: number;
  scale: number;
};

const makeFragments = (count: number) => {
  const rand = seededRandom(count);
  const range = (min: number, max: number) => min + rand() * (max - min);
  const fragments: Fragment[] = [];
  const cells = new Float32Array(count * 2);
  for (let i = 0; i < count; i++) {
    fragments.push({
      start: new Vector3(range(-5, 3.5), range(1.1, 3.6), range(-5, 1)),
      drift: new Vector3(range(-0.6, 0.6), range(0.2, 0.9), range(-0.3, 0.3)),
      intake: new Vector3(range(-1.4, 1.4), FRAGMENT_INTAKE_Y, 0),
      rotation: new Quaternion().setFromEuler(
        new Euler(range(-1.2, 1.2), range(-1.2, 1.2), range(-Math.PI, Math.PI))
      ),
      startsAt: range(0, 0.62),
      scale: range(0.45, 1),
    });
    cells[i * 2] = Math.floor(rand() * ATLAS_COLS);
    cells[i * 2 + 1] = Math.floor(rand() * ATLAS_ROWS);
  }
  return { fragments, cells };
};

const fragmentVertex = /* glsl */ `
  attribute vec2 aCell;
  uniform vec2 uGrid;
  varying vec2 vUv;
  varying float vDepth;
  void main() {
    vUv = vec2(
      (uv.x + aCell.x) / uGrid.x,
      (uv.y + (uGrid.y - 1.0 - aCell.y)) / uGrid.y
    );
    vec4 mvPosition = modelViewMatrix * instanceMatrix * vec4(position, 1.0);
    vDepth = -mvPosition.z;
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const fragmentFragment = /* glsl */ `
  uniform sampler2D uAtlas;
  varying vec2 vUv;
  varying float vDepth;
  void main() {
    vec4 color = texture2D(uAtlas, vUv);
    if (color.a < 0.5) discard;
    // Fade distant scraps into the carbon background (linear #0F1226).
    float fade = clamp((vDepth - 7.0) / 7.0, 0.0, 0.75);
    gl_FragColor = vec4(mix(color.rgb * 0.85, vec3(0.0048, 0.006, 0.0194), fade), 1.0);
    #include <colorspace_fragment>
  }
`;

const dummy = new Object3D();
const scratchPosition = new Vector3();
const identity = new Quaternion();

const Fragments = ({
  progress,
  atlas,
  count,
}: {
  progress: MotionValue<number>;
  atlas: CanvasTexture;
  count: number;
}) => {
  const mesh = useRef<InstancedMesh>(null);
  const { fragments, cells } = useMemo(() => makeFragments(count), [count]);
  const uniforms = useMemo(
    () => ({
      uAtlas: { value: atlas },
      uGrid: { value: [ATLAS_COLS, ATLAS_ROWS] },
    }),
    [atlas]
  );

  useFrame(() => {
    if (!mesh.current) return;
    const p = progress.get();
    fragments.forEach((fragment, i) => {
      const trip = clamp01((p - fragment.startsAt) / FRAGMENT_TRIP);
      const pull = trip * trip * trip;
      scratchPosition
        .copy(fragment.drift)
        .multiplyScalar(p)
        .add(fragment.start)
        .lerp(fragment.intake, pull);
      dummy.position.copy(scratchPosition);
      dummy.quaternion.copy(fragment.rotation).slerp(identity, pull);
      dummy.scale.setScalar(trip >= 1 ? 0 : fragment.scale * (1 - 0.75 * pull));
      dummy.updateMatrix();
      mesh.current?.setMatrixAt(i, dummy.matrix);
    });
    mesh.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh
      ref={mesh}
      args={[undefined, undefined, count]}
      frustumCulled={false}
    >
      <planeGeometry args={[1, 0.5]}>
        <instancedBufferAttribute attach="attributes-aCell" args={[cells, 2]} />
      </planeGeometry>
      <shaderMaterial
        uniforms={uniforms}
        vertexShader={fragmentVertex}
        fragmentShader={fragmentFragment}
        side={DoubleSide}
      />
    </instancedMesh>
  );
};

/* ---------------------------------- Sheets ---------------------------------- */

const sheetVertex = /* glsl */ `
  uniform float uOffsetY;
  varying vec2 vUv;
  varying float vY;
  varying float vShade;
  void main() {
    vUv = uv;
    vec3 p = position;
    float y = p.y + uOffsetY;            // height relative to the rollers
    float crumple = smoothstep(0.0, 1.4, y);
    float n = sin(p.x * 3.1 + p.y * 2.3) * 0.5
            + sin(p.x * 5.7 - p.y * 4.1 + 1.3) * 0.3
            + sin(p.y * 7.9 + p.x * 1.7) * 0.2;
    p.z += n * 0.32 * crumple;
    p.x += sin(p.y * 2.0) * 0.1 * crumple;
    vY = y;
    vShade = n * crumple;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`;

const sheetFragment = /* glsl */ `
  uniform sampler2D uMessy;
  uniform sampler2D uClean;
  varying vec2 vUv;
  varying float vY;
  varying float vShade;
  void main() {
    vec4 color = vY > 0.0 ? texture2D(uMessy, vUv) : texture2D(uClean, vUv);
    if (color.a < 0.5) discard;
    color.rgb *= 0.86 + 0.14 * vShade;
    // Copy-blue seam where the paper leaves the rollers.
    float seam = 1.0 - smoothstep(0.0, 0.035, abs(vY));
    color.rgb = mix(color.rgb, vec3(0.2, 0.25, 1.0), seam * 0.7);
    gl_FragColor = vec4(color.rgb, 1.0);
    #include <colorspace_fragment>
  }
`;

const Sheet = ({
  index,
  progress,
  messy,
  clean,
}: {
  index: number;
  progress: MotionValue<number>;
  messy: CanvasTexture;
  clean: CanvasTexture;
}) => {
  const mesh = useRef<Mesh>(null);
  const material = useRef<ShaderMaterial>(null);
  const uniforms = useMemo(
    () => ({
      uMessy: { value: messy },
      uClean: { value: clean },
      uOffsetY: { value: 0 },
    }),
    [messy, clean]
  );

  useFrame(() => {
    if (!mesh.current || !material.current) return;
    const p = progress.get();
    const travel = sheetTravel(p, index);
    const y = sheetY(p, index);
    mesh.current.visible = travel > 0 && travel < 1;
    mesh.current.position.y = y;
    material.current.uniforms.uOffsetY.value = y;
  });

  return (
    <mesh ref={mesh} visible={false}>
      <planeGeometry args={[SHEET_WIDTH, SHEET_HEIGHT, 40, 52]} />
      <shaderMaterial
        ref={material}
        uniforms={uniforms}
        vertexShader={sheetVertex}
        fragmentShader={sheetFragment}
        side={DoubleSide}
      />
    </mesh>
  );
};

/* ----------------------------------- Rig ------------------------------------ */

const useSceneTextures = (
  sheets: readonly SheetContent[],
  projectTotal: number,
  fonts: SceneFonts
) => {
  const [textures, setTextures] = useState<SceneTextures | null>(null);
  const invalidate = useThree((state) => state.invalidate);

  useEffect(() => {
    let cancelled = false;
    let built: SceneTextures | null = null;
    buildSceneTextures(sheets, projectTotal, fonts)
      .then((result) => {
        if (cancelled) {
          disposeSceneTextures(result);
          return;
        }
        built = result;
        setTextures(result);
        invalidate();
      })
      // Without textures the rollers spin with no paper; at least say why.
      .catch((error) =>
        console.error("Normalizer: couldn't build the paper textures", error)
      );
    return () => {
      cancelled = true;
      if (built) disposeSceneTextures(built);
    };
  }, [sheets, projectTotal, fonts, invalidate]);

  return textures;
};

const Rig = ({ progress, sheets, projectTotal, fonts }: SceneProps) => {
  const invalidate = useThree((state) => state.invalidate);
  const camera = useThree((state) => state.camera);
  const { width, height } = useThree((state) => state.viewport);
  const textures = useSceneTextures(sheets, projectTotal, fonts);

  useEffect(() => {
    camera.lookAt(0, 0, 0);
    invalidate();
  }, [camera, invalidate]);

  useEffect(
    () => progress.on("change", () => invalidate()),
    [progress, invalidate]
  );

  // Landscape: machine sits right of the headline. Portrait: it sits above it.
  const wide = width / height > 1.1;
  const scale = wide ? 1 : Math.min(1, width / 4.6);
  const lowPower = !wide || (navigator.hardwareConcurrency ?? 8) <= 4;

  return (
    <>
      <ambientLight intensity={1.1} />
      <directionalLight position={[3, 6, 5]} intensity={2.2} />
      <pointLight position={[-3, 1.5, -3]} intensity={18} color="#7D8CFF" />
      <group
        position={wide ? [width * 0.22, 0, 0] : [0, height * 0.18, 0]}
        scale={scale}
      >
        <Rollers progress={progress} />
        {textures && (
          <>
            <Fragments
              progress={progress}
              atlas={textures.atlas}
              count={lowPower ? 36 : 70}
            />
            {textures.sheets.map(({ messy, clean }, i) => (
              <Sheet
                key={i}
                index={i}
                progress={progress}
                messy={messy}
                clean={clean}
              />
            ))}
          </>
        )}
      </group>
    </>
  );
};

/** Without WebGL the hero still reads fine as text, so fail quietly. */
class SceneErrorBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}

export const NormalizerScene = (props: SceneProps) => (
  <SceneErrorBoundary>
    <Canvas
      flat
      frameloop="demand"
      dpr={[1, 1.75]}
      camera={{ position: [0, 3.2, 8.6], fov: 40, near: 0.1, far: 60 }}
      gl={{ antialias: true, alpha: true }}
    >
      <Rig {...props} />
    </Canvas>
  </SceneErrorBoundary>
);
