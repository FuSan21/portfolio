export type Vec3 = [number, number, number];

export const ROOT_Y = 3.7;
export const WELL_Y = -4.9;

type HeapNode = { type: string; word?: string; pos: Vec3 };

// Index 0 is the GC root bar. Worded blocks carry the headline that should
// survive compaction; 17-19 start orphaned so the first tick shows a cycle
// being collected even though its members still reference each other.
export const NODES: HeapNode[] = [
  { type: "ROOT", pos: [0, ROOT_Y, 0] },
  { type: "{User}", word: "Fuad", pos: [-3.3, 2.2, 0] }, // 1
  { type: '"str"', word: "Hasan", pos: [-1.1, 2.2, 0] }, // 2
  { type: "Map", word: "builds", pos: [1.1, 2.2, 0] }, // 3
  { type: "Closure", word: "systems", pos: [3.3, 2.2, 0] }, // 4
  { type: "[]", pos: [-4.4, 0.8, 0] }, // 5
  { type: "Promise", pos: [-2.2, 0.8, 0] }, // 6
  { type: "{Session}", pos: [0, 0.8, 0] }, // 7
  { type: "Set", pos: [2.2, 0.8, 0] }, // 8
  { type: '"str"', pos: [4.4, 0.8, 0] }, // 9
  { type: "Buffer", pos: [-4.4, -0.6, 0] }, // 10
  { type: "{Node}", pos: [-2.0, -0.6, 0] }, // 11
  { type: "{Node}", pos: [0.2, -0.6, 0] }, // 12
  { type: "Closure", pos: [3.3, -0.6, 0] }, // 13
  { type: "WeakRef", pos: [-3.3, -2.0, 0] }, // 14
  { type: "{Node}", pos: [-0.9, -2.0, 0] }, // 15
  { type: "[]", pos: [4.4, -2.0, 0] }, // 16
  { type: "Timer", pos: [6.6, 0.2, 0] }, // 17
  { type: "{Temp}", pos: [6.8, -1.3, 0] }, // 18
  { type: '"str"', pos: [-6.6, -1.0, 0] }, // 19
];

const ROOT_REFS: [number, number][] = [
  [1, -3.3],
  [2, -1.1],
  [3, 1.1],
  [4, 3.3],
];
const REFS: [number, number][] = [
  [1, 5], [1, 6], [2, 6], [2, 7], [3, 7], [3, 8], [4, 8], [4, 9],
  [5, 10], [6, 11], [7, 12], [10, 14],
  // cycle A: 11 -> 12 -> 15 -> 11
  [11, 12], [12, 15], [15, 11], [15, 14],
  // cycle B: 9 -> 13 -> 16 -> 9, also entered from 8
  [9, 13], [13, 16], [16, 9], [8, 13],
  // orphaned cycle + orphan pointing into the live heap
  [17, 18], [18, 17], [19, 10],
];

const dist = (a: Vec3, b: Vec3) => Math.hypot(a[0] - b[0], a[1] - b[1]);

export type Edge = { from: number; to: number; anchor: Vec3; rest: number };

export const EDGES: Edge[] = [
  ...ROOT_REFS.map(([to, x]): Edge => {
    const anchor: Vec3 = [x, 0, 0];
    return { from: 0, to, anchor, rest: dist([x, ROOT_Y, 0], NODES[to].pos) * 0.97 };
  }),
  ...REFS.map(([from, to]): Edge => ({
    from,
    to,
    anchor: [0, 0, 0],
    rest: Math.max(0.6, dist(NODES[from].pos, NODES[to].pos) * 0.97),
  })),
];

/** Mark phase: BFS depth of every node reachable from the root. */
export const reach = (cut: ReadonlySet<number>, dead: ReadonlySet<number>) => {
  const depth = new Map<number, number>([[0, 0]]);
  const queue = [0];
  while (queue.length) {
    const n = queue.shift()!;
    EDGES.forEach((e, i) => {
      if (e.from !== n || cut.has(i) || dead.has(e.to) || depth.has(e.to)) return;
      depth.set(e.to, depth.get(n)! + 1);
      queue.push(e.to);
    });
  }
  return depth;
};

type P = { x: number; y: number };

/** Intersection of swipe p1-p2 with edge q1-q2; returns the param along the edge or null. */
export const segHit = (p1: P, p2: P, q1: P, q2: P): number | null => {
  const r = { x: p2.x - p1.x, y: p2.y - p1.y };
  const s = { x: q2.x - q1.x, y: q2.y - q1.y };
  const den = r.x * s.y - r.y * s.x;
  if (Math.abs(den) < 1e-6) return null;
  const qp = { x: q1.x - p1.x, y: q1.y - p1.y };
  const t = (qp.x * s.y - qp.y * s.x) / den;
  const u = (qp.x * r.y - qp.y * r.x) / den;
  return t >= 0 && t <= 1 && u >= 0 && u <= 1 ? u : null;
};
