// Shared scroll timeline for the hero "pass". Both the 3D scene and the HTML
// headline read the same pinned-section progress (0 → 1), so a headline word
// clears exactly while its sheet of paper is between the rollers.

export const SHEET_COUNT = 3;

/** Scene units. Sheets travel from +SHEET_TRAVEL to -SHEET_TRAVEL; the rollers sit at y = 0. */
export const SHEET_TRAVEL = 5.6;
export const SHEET_HEIGHT = 3.6;
export const SHEET_WIDTH = 2.8;

const SHEET_START = 0.1;
const SHEET_STAGGER = 0.26;
const SHEET_DURATION = 0.3;

/** Progress at which the "normalized" stamp starts to land (the last word clears at ~0.82). */
export const STAMP_AT = 0.84;

/** Progress the still frame uses when motion is reduced: the last sheet mid-pass. */
export const STILL_PROGRESS = 0.75;

export const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

/** How far sheet `index` is along its trip, 0 (above frame) → 1 (below frame). */
export const sheetTravel = (progress: number, index: number) =>
  clamp01((progress - SHEET_START - index * SHEET_STAGGER) / SHEET_DURATION);

/** Centre y of sheet `index` in scene units. */
export const sheetY = (progress: number, index: number) =>
  SHEET_TRAVEL - sheetTravel(progress, index) * SHEET_TRAVEL * 2;

/** Fraction of sheet `index` that has already come out under the rollers. */
export const sheetCrossing = (progress: number, index: number) =>
  clamp01((SHEET_HEIGHT / 2 - sheetY(progress, index)) / SHEET_HEIGHT);

/**
 * Redaction grades from most degraded to clean, as CSS font-family values.
 * Each entry pairs with a `--font-redaction-*` variable from app/fonts.ts.
 */
export const REDACTION_GRADES = [
  "var(--font-redaction-100)",
  "var(--font-redaction-70)",
  "var(--font-redaction-50)",
  "var(--font-redaction-35)",
  "var(--font-redaction-20)",
  "var(--font-redaction-10)",
  "var(--font-redaction)",
] as const;

/** Grade a headline word should render in, given how far its sheet has crossed. */
export const gradeFor = (progress: number, index: number) => {
  const step = Math.floor(
    sheetCrossing(progress, index) * REDACTION_GRADES.length
  );
  return REDACTION_GRADES[Math.min(step, REDACTION_GRADES.length - 1)];
};
