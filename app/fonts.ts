import { Atkinson_Hyperlegible_Next, Martian_Mono } from "next/font/google";
import localFont from "next/font/local";

// Redaction ships as separate families per degradation grade (OFL 1.1, see
// app/fonts/redaction/OFL.txt). The hero headline steps through them from
// 100 (most degraded) to the clean cut, so every grade needs its own variable.
// Only the two ends are preloaded; the hero renders a hidden sample of the
// middle grades so the browser fetches them before the first scroll.
export const redaction = localFont({
  src: "./fonts/redaction/Redaction-Regular.woff2",
  variable: "--font-redaction",
  display: "swap",
});
export const redaction10 = localFont({
  src: "./fonts/redaction/Redaction10-Regular.woff2",
  variable: "--font-redaction-10",
  preload: false,
});
export const redaction20 = localFont({
  src: "./fonts/redaction/Redaction20-Regular.woff2",
  variable: "--font-redaction-20",
  preload: false,
});
export const redaction35 = localFont({
  src: "./fonts/redaction/Redaction35-Regular.woff2",
  variable: "--font-redaction-35",
  preload: false,
});
export const redaction50 = localFont({
  src: "./fonts/redaction/Redaction50-Regular.woff2",
  variable: "--font-redaction-50",
  preload: false,
});
export const redaction70 = localFont({
  src: "./fonts/redaction/Redaction70-Regular.woff2",
  variable: "--font-redaction-70",
  preload: false,
});
export const redaction100 = localFont({
  src: "./fonts/redaction/Redaction100-Regular.woff2",
  variable: "--font-redaction-100",
  display: "swap",
});

export const atkinson = Atkinson_Hyperlegible_Next({
  subsets: ["latin"],
  variable: "--font-atkinson",
  display: "swap",
});

export const martian = Martian_Mono({
  subsets: ["latin"],
  axes: ["wdth"],
  variable: "--font-martian",
  display: "swap",
});

export const fontVariables = [
  redaction,
  redaction10,
  redaction20,
  redaction35,
  redaction50,
  redaction70,
  redaction100,
  atkinson,
  martian,
]
  .map((font) => font.variable)
  .join(" ");
