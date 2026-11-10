import { CanvasTexture, Color, SRGBColorSpace } from "three";

// Invented sample source. Not real client code or data.
const SOURCE = `type Rule = { field: string; op: "eq" | "gt"; value: number };

export function normalize(rows: Row[], rules: Rule[]) {
  const out: Record<string, number>[] = [];
  for (const row of rows) {
    const clean = trimKeys(row);
    if (!rules.every((r) => check(clean, r))) {
      continue;
    }
    out.push({ ...clean, score: weigh(clean, 0.75) });
  }
  return out.sort((a, b) => b.score - a.score);
}

function check(row: Row, rule: Rule): boolean {
  const v = Number(row[rule.field] ?? 0);
  switch (rule.op) {
    case "eq":
      return v === rule.value;
    case "gt":
      return v > rule.value;
  }
  return false;
}

function weigh(row: Row, bias = 1): number {
  const keys = Object.keys(row).length;
  return Math.round(keys * bias * 100) / 100;
}`;

export const STAGES = ["Source", "Lex", "Parse", "Codegen", "Emit"] as const;
export const STAGE_COUNT = STAGES.length;

const KEYWORDS = new Set(
  "type export function const for of if continue return switch case boolean string number false true".split(" ")
);
const NOISE = "{}()[];:=<>+-*/.,?!&|\"'abcdefgxyz0123456789_$#@%";

type Kind = "keyword" | "type" | "ident" | "string" | "number" | "punct";
const KIND_COLOR: Record<Kind, Color> = {
  keyword: new Color("#7D8CFF"),
  type: new Color("#B8C0FF"),
  ident: new Color("#E6E2D6"),
  string: new Color("#B9D8B0"),
  number: new Color("#E0473A"),
  punct: new Color("#E6E2D6").multiplyScalar(0.42),
};
const FORM = new Color("#E6E2D6");
const COPY = new Color("#7D8CFF");
const DIM = new Color("#E6E2D6").multiplyScalar(0.3);

export const CHAR_W = 0.13;
const LINE_H = 0.26;
const NOISE_COUNT = 1500;
const ATLAS_COLS = 16;
const CELL = 64;

const seeded = (seed: number) => () => {
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

type Token = { text: string; kind: Kind; line: number; col: number };

const kindOf = (text: string): Kind => {
  if (KEYWORDS.has(text)) return "keyword";
  if (text.startsWith('"')) return "string";
  if (/^\d/.test(text)) return "number";
  if (/^[A-Z]/.test(text)) return "type";
  if (/^[\w$]/.test(text)) return "ident";
  return "punct";
};

const tokenize = (lines: string[]) => {
  const tokens: Token[] = [];
  const re = /"[^"]*"|\d+(?:\.\d+)?|[A-Za-z_$][\w$]*|=>|===|\?\?|\.\.\.|[^\s\w]/g;
  lines.forEach((line, i) => {
    for (const m of line.matchAll(re)) {
      tokens.push({ text: m[0], kind: kindOf(m[0]), line: i, col: m.index });
    }
  });
  return tokens;
};

export type CompileBuild = {
  count: number;
  codeCount: number;
  tokenCount: number;
  nodeCount: number;
  lineCount: number;
  atlas: CanvasTexture;
  atlasRows: number;
  cells: Float32Array; // per glyph atlas cell (col, row-from-bottom)
  order: Float32Array; // 0..1 stagger delay
  pos: Float32Array[]; // per stage, xyz
  rot: Float32Array[]; // per stage, z rotation
  scale: Float32Array[]; // per stage
  color: Float32Array[]; // per stage, rgb (linear)
  edges: Float32Array; // AST edges as line segment pairs
};

const cssFont = (variable: string, fallback: string) => {
  const read = (el: Element) =>
    getComputedStyle(el).getPropertyValue(variable).trim();
  const value = read(document.documentElement) || read(document.body);
  return value ? `${value}, ${fallback}` : fallback;
};

/** Points sampled from the headline drawn on a 2D canvas, in world units. */
const sampleHeadline = (display: string, count: number, rand: () => number) => {
  const W = 1400;
  const H = 560;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("2D canvas is unavailable");
  const lines = ["Untangled,", "typed, shipped."];
  let size = 230;
  ctx.font = `${size}px ${display}`;
  const widest = Math.max(...lines.map((l) => ctx.measureText(l).width));
  size = Math.min(size, (size * (W - 60)) / widest);
  ctx.font = `${size}px ${display}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#fff";
  ctx.fillText(lines[0], W / 2, H * 0.3);
  ctx.fillText(lines[1], W / 2, H * 0.72);
  const data = ctx.getImageData(0, 0, W, H).data;
  const filled: [number, number][] = [];
  for (let y = 0; y < H; y += 3) {
    for (let x = 0; x < W; x += 3) {
      if (data[(y * W + x) * 4 + 3] > 140) filled.push([x, y]);
    }
  }
  for (let i = filled.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [filled[i], filled[j]] = [filled[j], filled[i]];
  }
  const k = 12.5 / W;
  return Array.from({ length: count }, (_, i) => {
    const [x, y] = filled[i % Math.max(1, filled.length)] ?? [W / 2, H / 2];
    return [(x - W / 2) * k, -(y - H / 2) * k, (rand() - 0.5) * 0.08] as const;
  }).sort((a, b) => a[0] - b[0]);
};

export const buildCompile = async (): Promise<CompileBuild> => {
  const mono = cssFont("--font-martian", '"Martian Mono", ui-monospace, monospace');
  const display = cssFont("--font-redaction", "Georgia, serif");
  await Promise.all([
    document.fonts.load(`44px ${mono}`),
    document.fonts.load(`200px ${display}`),
  ]).catch(() => undefined);
  await document.fonts.ready;

  const rand = seeded(1312);
  const lines = SOURCE.split("\n");
  const tokens = tokenize(lines);

  // Glyphs: every non-space character of the source, then compiler "noise".
  const glyphs: { ch: string; token: number; k: number; kind: Kind }[] = [];
  tokens.forEach((t, ti) =>
    [...t.text].forEach((ch, k) => glyphs.push({ ch, token: ti, k, kind: t.kind }))
  );
  const codeCount = glyphs.length;
  for (let i = 0; i < NOISE_COUNT; i++) {
    glyphs.push({ ch: NOISE[Math.floor(rand() * NOISE.length)], token: -1, k: 0, kind: "punct" });
  }
  const count = glyphs.length;

  // Atlas
  const chars = [...new Set(glyphs.map((g) => g.ch))];
  const atlasRows = Math.ceil(chars.length / ATLAS_COLS);
  const atlasCanvas = document.createElement("canvas");
  atlasCanvas.width = ATLAS_COLS * CELL;
  atlasCanvas.height = atlasRows * CELL;
  const actx = atlasCanvas.getContext("2d");
  if (!actx) throw new Error("2D canvas is unavailable");
  actx.font = `500 42px ${mono}`;
  actx.textAlign = "center";
  actx.textBaseline = "middle";
  actx.fillStyle = "#fff";
  chars.forEach((ch, i) =>
    actx.fillText(ch, (i % ATLAS_COLS) * CELL + CELL / 2, Math.floor(i / ATLAS_COLS) * CELL + CELL / 2 + 2)
  );
  const atlas = new CanvasTexture(atlasCanvas);
  atlas.colorSpace = SRGBColorSpace;
  atlas.anisotropy = 4;
  const cellOf = new Map(chars.map((ch, i) => [ch, i]));

  const cells = new Float32Array(count * 2);
  const order = new Float32Array(count);
  const pos = Array.from({ length: STAGE_COUNT }, () => new Float32Array(count * 3));
  const rot = Array.from({ length: STAGE_COUNT }, () => new Float32Array(count));
  const scale = Array.from({ length: STAGE_COUNT }, () => new Float32Array(count));
  const color = Array.from({ length: STAGE_COUNT }, () => new Float32Array(count * 3));
  const setPos = (s: number, i: number, x: number, y: number, z: number) => {
    pos[s][i * 3] = x;
    pos[s][i * 3 + 1] = y;
    pos[s][i * 3 + 2] = z;
  };
  const setColor = (s: number, i: number, c: Color) => c.toArray(color[s], i * 3);

  // Token centres for LEX: a loose cloud of words.
  const lexCentre = tokens.map(() => {
    const r = 4.2 * Math.cbrt(rand());
    const th = rand() * Math.PI * 2;
    const ph = Math.acos(2 * rand() - 1);
    return [r * Math.sin(ph) * Math.cos(th) * 1.35, r * Math.cos(ph) * 0.8, r * Math.sin(ph) * Math.sin(th)];
  });

  // PARSE: an indentation-based tree, one node per source line.
  const lineTokens = lines.map((_, i) => tokens.filter((t) => t.line === i));
  const indent = lines.map((l) => l.length - l.trimStart().length);
  const parent: number[] = lines.map(() => -1); // -1 = program root
  const children: number[][] = [[]]; // index 0 is root, line i is node i + 1
  lines.forEach(() => children.push([]));
  lines.forEach((l, i) => {
    if (!lineTokens[i].length) return;
    const closes = /^[}\])]/.test(l.trim());
    for (let j = i - 1; j >= 0; j--) {
      if (!lineTokens[j].length) continue;
      if (closes ? indent[j] === indent[i] : indent[j] < indent[i]) {
        parent[i] = j;
        break;
      }
    }
    children[parent[i] + 1].push(i + 1);
  });
  const nodePos: number[][] = children.map(() => [0, 0, 0]);
  let leaf = 0;
  const leaves: number[] = [];
  const place = (n: number, depth: number): number => {
    const kids = children[n];
    const x = kids.length
      ? kids.map((c) => place(c, depth + 1)).reduce((a, b) => a + b, 0) / kids.length
      : (leaves.push(n), leaf++);
    nodePos[n] = [x, 3.6 - depth * 1.2, ((depth % 2) * 2 - 1) * 0.9 + Math.sin(x * 1.7) * 0.7];
    return x;
  };
  place(0, 0);
  const spacing = Math.min(0.95, 11.5 / Math.max(1, leaf - 1));
  nodePos.forEach((p) => (p[0] = (p[0] - (leaf - 1) / 2) * spacing));
  const edges: number[] = [];
  const parseCentre = tokens.map((t) => {
    const node = nodePos[t.line + 1];
    const siblings = lineTokens[t.line];
    const j = siblings.indexOf(t);
    const m = siblings.length;
    const a = (j / m) * Math.PI * 2;
    const R = 0.25 + m * 0.045;
    const c = [node[0] + Math.cos(a) * R, node[1] - 0.2 - j * 0.025, node[2] + Math.sin(a) * R];
    edges.push(...node, ...c);
    return c;
  });
  lines.forEach((_, i) => {
    if (lineTokens[i].length) edges.push(...nodePos[parent[i] + 1], ...nodePos[i + 1]);
  });

  // CODEGEN: two neat columns, split before \`function check\`.
  const split = lines.findIndex((l) => l.startsWith("function check"));
  const colW = (a: number, b: number) =>
    Math.max(...lines.slice(a, b).map((l) => l.length)) * CHAR_W;
  const w0 = colW(0, split);
  const w1 = colW(split, lines.length);
  const gap = 0.9;
  const rows = Math.max(split, lines.length - split);
  const codegen = (line: number, col: number) => {
    const right = line >= split;
    const row = right ? line - split : line;
    const x0 = -(w0 + gap + w1) / 2 + (right ? w0 + gap : 0);
    return [x0 + col * CHAR_W, ((rows - 1) / 2 - row) * LINE_H, 0];
  };

  const headline = sampleHeadline(display, count, rand);
  const emitOrder = glyphs
    .map((g, i) => {
      const key =
        g.token >= 0
          ? codegen(tokens[g.token].line, tokens[g.token].col + g.k)[0]
          : (rand() - 0.5) * 13;
      return [i, key] as const;
    })
    .sort((a, b) => a[1] - b[1]);

  glyphs.forEach((g, i) => {
    const cell = cellOf.get(g.ch) ?? 0;
    cells[i * 2] = cell % ATLAS_COLS;
    cells[i * 2 + 1] = atlasRows - 1 - Math.floor(cell / ATLAS_COLS);

    // SOURCE: everything adrift
    const r = 6.2 * Math.cbrt(rand());
    const th = rand() * Math.PI * 2;
    const ph = Math.acos(2 * rand() - 1);
    setPos(0, i, r * Math.sin(ph) * Math.cos(th) * 1.3, r * Math.cos(ph) * 0.75, r * Math.sin(ph) * Math.sin(th) * 0.8);
    rot[0][i] = (rand() - 0.5) * Math.PI * 2;
    scale[0][i] = g.token >= 0 ? 0.24 : 0.12 + rand() * 0.1;
    setColor(0, i, g.token >= 0 ? FORM.clone().multiplyScalar(0.62) : DIM);

    if (g.token >= 0) {
      const t = tokens[g.token];
      const off = (g.k - (t.text.length - 1) / 2) * CHAR_W;
      const lc = lexCentre[g.token];
      const pc = parseCentre[g.token];
      setPos(1, i, lc[0] + off, lc[1], lc[2]);
      setPos(2, i, pc[0] + off, pc[1], pc[2]);
      const cg = codegen(t.line, t.col + g.k);
      setPos(3, i, cg[0], cg[1], cg[2]);
      for (let s = 1; s <= 3; s++) {
        scale[s][i] = 0.24;
        setColor(s, i, KIND_COLOR[g.kind]);
      }
      order[i] = (t.line + g.k * 0.02) / lines.length;
    } else {
      // Noise is discarded by the lexer: flung outward and shrunk away.
      const p = pos[0];
      for (let s = 1; s <= 3; s++) {
        setPos(s, i, p[i * 3] * 2.2, p[i * 3 + 1] * 2.2, p[i * 3 + 2] * 2.2 - 4);
        scale[s][i] = 0;
        setColor(s, i, DIM);
      }
      order[i] = rand();
    }
    scale[4][i] = 0.1;
    setColor(4, i, g.kind === "keyword" || (g.token < 0 && rand() < 0.22) ? COPY : FORM);
  });
  emitOrder.forEach(([i], n) => setPos(4, i, ...headline[n]));

  return {
    count,
    codeCount,
    tokenCount: tokens.length,
    nodeCount: lineTokens.filter((t) => t.length).length + 1,
    lineCount: lines.length,
    atlas,
    atlasRows,
    cells,
    order,
    pos,
    rot,
    scale,
    color,
    edges: new Float32Array(edges),
  };
};
