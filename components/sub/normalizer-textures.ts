import { CanvasTexture, SRGBColorSpace } from "three";

// Every texture in the hero scene is drawn at runtime on a 2D canvas, so the
// scene ships no image assets. Fragment text is invented sample data, never
// real client records.

export type SceneFonts = {
  display: string;
  degraded: string;
  body: string;
  mono: string;
};

export type SheetContent = {
  title: string;
  description: string;
  tech: readonly string[];
};

export type SceneTextures = {
  atlas: CanvasTexture;
  sheets: { messy: CanvasTexture; clean: CanvasTexture }[];
};

export const ATLAS_COLS = 4;
export const ATLAS_ROWS = 4;
const CELL_W = 512;
const CELL_H = 256;

const SHEET_PX_W = 1024;
const SHEET_PX_H = 1316; // matches SHEET_WIDTH / SHEET_HEIGHT

const INK = "#0F1226";
const BLUE_INK = "#2E3FB8";
const FORM = "#E6E2D6";
const AGED = "#D6D1C2";
const GREENBAR = "#B9D8B0";

/** Small deterministic PRNG so the scene looks the same on every visit. */
export const seededRandom = (seed: number) => () => {
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

const makeCanvas = (width: number, height: number) => {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("2D canvas is unavailable");
  return { canvas, ctx };
};

const toTexture = (canvas: HTMLCanvasElement) => {
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
};

/** Paper outline with torn top and bottom edges, as a clip path. */
const tornRect = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  rand: () => number,
  roughness: number
) => {
  const steps = 18;
  ctx.beginPath();
  ctx.moveTo(0, rand() * roughness);
  for (let i = 1; i <= steps; i++) {
    ctx.lineTo((width / steps) * i, rand() * roughness);
  }
  ctx.lineTo(width, height - rand() * roughness);
  for (let i = steps - 1; i >= 0; i--) {
    ctx.lineTo((width / steps) * i, height - rand() * roughness);
  }
  ctx.closePath();
};

const digits = (rand: () => number, length: number) =>
  Array.from({ length }, () => Math.floor(rand() * 10)).join("");

type CellKind = "greenbar" | "markup" | "scan" | "rows";
const CELL_KINDS: CellKind[] = ["greenbar", "markup", "scan", "rows"];

const MARKUP_LINES = [
  [
    '<Owner id="A17">',
    "  <Name>J. Doe</Name>",
    "  <State>TX</State>",
    "</Owner>",
  ],
  ['{ "premium": 125000,', '  "status": "pend",', '  "reason": null }'],
  ['<Party role="ben">', "  <Pct>50</Pct>", "</Party>"],
  ['{ "case": 4417,', '  "missing": ["sig"] }'],
];

const SCAN_LABELS = ["Signature", "Date of birth", "Beneficiary", "Owner name"];

const drawCell = (
  ctx: CanvasRenderingContext2D,
  kind: CellKind,
  variant: number,
  fonts: SceneFonts,
  rand: () => number
) => {
  const pad = 10;
  const w = CELL_W - pad * 2;
  const h = CELL_H - pad * 2;
  ctx.save();
  ctx.translate(pad, pad);
  tornRect(ctx, w, h, rand, kind === "scan" ? 22 : 10);
  ctx.clip();

  ctx.fillStyle = kind === "scan" ? AGED : FORM;
  ctx.fillRect(0, 0, w, h);

  if (kind === "greenbar") {
    for (let y = 0; y < h; y += 56) {
      ctx.fillStyle = GREENBAR;
      ctx.fillRect(0, y, w, 28);
    }
    ctx.fillStyle = INK;
    ctx.font = `20px ${fonts.mono}`;
    for (let line = 0; line < 8; line++) {
      const record = `${digits(rand, 7)} ANN ${"QPF"[Math.floor(rand() * 3)]} ${digits(rand, 9)}`;
      ctx.fillText(record, 36, 22 + line * 28);
    }
    // Tractor-feed holes, punched through so the shader can discard them.
    ctx.globalCompositeOperation = "destination-out";
    for (let y = 14; y < h; y += 28) {
      ctx.beginPath();
      ctx.arc(14, y, 6, 0, Math.PI * 2);
      ctx.arc(w - 14, y, 6, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalCompositeOperation = "source-over";
  }

  if (kind === "markup") {
    const lines = MARKUP_LINES[variant % MARKUP_LINES.length];
    ctx.font = `24px ${fonts.mono}`;
    lines.forEach((line, i) => {
      ctx.fillStyle = i === 0 ? BLUE_INK : INK;
      ctx.fillText(line, 24, 52 + i * 40);
    });
  }

  if (kind === "scan") {
    ctx.rotate((rand() - 0.5) * 0.08);
    ctx.fillStyle = INK;
    ctx.font = `34px ${fonts.degraded}`;
    ctx.fillText(SCAN_LABELS[variant % SCAN_LABELS.length], 28, 70);
    ctx.fillRect(28, 112, w * 0.7, 2);
    ctx.strokeStyle = INK;
    ctx.lineWidth = 2;
    ctx.strokeRect(28, 150, 28, 28);
    ctx.strokeRect(150, 150, 28, 28);
    // Scanner speckle.
    for (let i = 0; i < 900; i++) {
      ctx.fillStyle = `rgba(15,18,38,${rand() * 0.35})`;
      ctx.fillRect(rand() * w, rand() * h, 1.5, 1.5);
    }
  }

  if (kind === "rows") {
    ctx.font = `22px ${fonts.mono}`;
    ctx.fillStyle = BLUE_INK;
    ctx.fillText("id,state,amount,status", 24, 46);
    ctx.fillStyle = INK;
    for (let line = 1; line < 6; line++) {
      const row = `${digits(rand, 3)},TX,${digits(rand, 6)},${["ok", "pend", "nigo"][Math.floor(rand() * 3)]}`;
      ctx.fillText(row, 24, 46 + line * 34);
    }
  }

  ctx.restore();
};

const buildAtlas = (fonts: SceneFonts) => {
  const { canvas, ctx } = makeCanvas(CELL_W * ATLAS_COLS, CELL_H * ATLAS_ROWS);
  const rand = seededRandom(7);
  for (let row = 0; row < ATLAS_ROWS; row++) {
    for (let col = 0; col < ATLAS_COLS; col++) {
      ctx.save();
      ctx.translate(col * CELL_W, row * CELL_H);
      drawCell(ctx, CELL_KINDS[col], row, fonts, rand);
      ctx.restore();
    }
  }
  return toTexture(canvas);
};

const wrapLines = (
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxLines: number
) => {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (ctx.measureText(next).width > maxWidth && current) {
      lines.push(current);
      current = word;
      if (lines.length === maxLines) break;
    } else {
      current = next;
    }
  }
  if (lines.length < maxLines && current) lines.push(current);
  if (lines.length === maxLines && words.join(" ") !== lines.join(" ")) {
    lines[maxLines - 1] = `${lines[maxLines - 1].replace(/\W*\S*$/, "")}…`;
  }
  return lines;
};

/** Holes along both edges, shared by both faces so the seam lines up. */
const punchTractorHoles = (ctx: CanvasRenderingContext2D) => {
  ctx.globalCompositeOperation = "destination-out";
  for (let y = 30; y < SHEET_PX_H; y += 52) {
    ctx.beginPath();
    ctx.arc(30, y, 11, 0, Math.PI * 2);
    ctx.arc(SHEET_PX_W - 30, y, 11, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalCompositeOperation = "source-over";
};

const buildMessySheet = (
  content: SheetContent,
  fonts: SceneFonts,
  seed: number
) => {
  const { canvas, ctx } = makeCanvas(SHEET_PX_W, SHEET_PX_H);
  const rand = seededRandom(seed);
  ctx.fillStyle = AGED;
  ctx.fillRect(0, 0, SHEET_PX_W, SHEET_PX_H);

  ctx.save();
  ctx.translate(SHEET_PX_W / 2, SHEET_PX_H / 2);
  ctx.rotate(-0.035);
  ctx.translate(-SHEET_PX_W / 2, -SHEET_PX_H / 2);
  for (let y = -40; y < SHEET_PX_H + 40; y += 104) {
    ctx.fillStyle = GREENBAR;
    ctx.fillRect(-40, y, SHEET_PX_W + 80, 52);
  }

  // The same words the clean side prints, misregistered in degraded type.
  ctx.font = `46px ${fonts.degraded}`;
  const words = `${content.title} ${content.description}`.split(/\s+/);
  let x = 80;
  let y = 120;
  for (const word of words) {
    const width = ctx.measureText(word).width;
    if (x + width > SHEET_PX_W - 80) {
      x = 80 + rand() * 30;
      y += 58 + rand() * 14;
    }
    if (y > SHEET_PX_H - 80) break;
    const jitter = (rand() - 0.5) * 8;
    ctx.fillStyle = "rgba(46,63,184,0.45)";
    ctx.fillText(word, x + 4, y + jitter + 3);
    ctx.fillStyle = INK;
    ctx.fillText(word, x, y + jitter);
    x += width + 18;
  }
  ctx.restore();

  for (let i = 0; i < 5; i++) {
    const cx = rand() * SHEET_PX_W;
    const cy = rand() * SHEET_PX_H;
    const r = 60 + rand() * 120;
    const gradient = ctx.createRadialGradient(cx, cy, r * 0.2, cx, cy, r);
    gradient.addColorStop(0, "rgba(15,18,38,0.14)");
    gradient.addColorStop(1, "rgba(15,18,38,0)");
    ctx.fillStyle = gradient;
    ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
  }

  punchTractorHoles(ctx);
  return toTexture(canvas);
};

const buildCleanSheet = (
  content: SheetContent,
  fonts: SceneFonts,
  index: number,
  total: number
) => {
  const { canvas, ctx } = makeCanvas(SHEET_PX_W, SHEET_PX_H);
  const left = 96;
  const width = SHEET_PX_W - left * 2;
  ctx.fillStyle = FORM;
  ctx.fillRect(0, 0, SHEET_PX_W, SHEET_PX_H);

  ctx.fillStyle = INK;
  ctx.fillRect(left, 80, width, 72);
  ctx.fillStyle = FORM;
  ctx.font = `26px ${fonts.mono}`;
  ctx.fillText(`PROJECT ${index + 1} OF ${total}`, left + 28, 126);
  const techLabel = content.tech.slice(0, 2).join(" · ").toUpperCase();
  ctx.fillText(
    techLabel,
    left + width - 28 - ctx.measureText(techLabel).width,
    126
  );

  ctx.fillStyle = INK;
  ctx.font = `84px ${fonts.display}`;
  const titleLines = wrapLines(ctx, content.title, width, 3);
  titleLines.forEach((line, i) => ctx.fillText(line, left, 270 + i * 92));

  const ruleY = 270 + titleLines.length * 92 - 30;
  ctx.fillRect(left, ruleY, width, 3);

  ctx.font = `34px ${fonts.body}`;
  ctx.fillStyle = "rgba(15,18,38,0.82)";
  wrapLines(ctx, content.description, width, 13).forEach((line, i) =>
    ctx.fillText(line, left, ruleY + 80 + i * 50)
  );

  ctx.fillStyle = BLUE_INK;
  ctx.font = `26px ${fonts.mono}`;
  ctx.fillText(`${content.tech.length} TECHNOLOGIES`, left, SHEET_PX_H - 90);

  punchTractorHoles(ctx);
  return toTexture(canvas);
};

export const buildSceneTextures = async (
  sheets: readonly SheetContent[],
  projectTotal: number,
  fonts: SceneFonts
): Promise<SceneTextures> => {
  // Canvas text silently falls back to a system font if the face isn't
  // loaded yet, so wait for every family the textures use. Load only the
  // first family of each stack: next/font adds a "<name> Fallback" face
  // built from local() system fonts (Arial, Times New Roman) that Android
  // doesn't ship, and loading the whole stack rejects with NetworkError when
  // that face fails. A failed load still draws, just in a system font.
  await Promise.all(
    Object.values(fonts).map((stack) =>
      document.fonts
        .load(`40px ${stack.split(",")[0].trim()}`)
        .catch(() => [])
    )
  );
  return {
    atlas: buildAtlas(fonts),
    sheets: sheets.map((content, i) => ({
      messy: buildMessySheet(content, fonts, 101 + i),
      clean: buildCleanSheet(content, fonts, i, projectTotal),
    })),
  };
};

export const disposeSceneTextures = (textures: SceneTextures) => {
  textures.atlas.dispose();
  textures.sheets.forEach(({ messy, clean }) => {
    messy.dispose();
    clean.dispose();
  });
};
