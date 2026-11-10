// Every hero the home page can open with. One is picked at random per visit
// (lib/hero-store.ts) and the header switcher lists them in this order.
//
// `pinned` heroes are scrubbed by page scroll, so their section is taller than
// the viewport. `drawsHeadline` heroes render the headline inside the scene,
// so the HTML <h1> stays for screen readers only.

export const HERO_VARIANTS = [
  {
    id: "normalizer",
    label: "The Normalizer",
    hint: "Scroll to feed the rollers ↓",
    pinned: true,
    drawsHeadline: false,
  },
  {
    id: "compile",
    label: "Compiler",
    hint: "Scroll to compile · move to scatter",
    pinned: true,
    drawsHeadline: true,
  },
  {
    id: "merge-conflict",
    label: "Merge conflict",
    hint: "Scroll to resolve ↓",
    pinned: true,
    drawsHeadline: true,
  },
  {
    id: "rules-pachinko",
    label: "Rules engine",
    hint: "Click to drop an application",
    pinned: false,
    drawsHeadline: false,
  },
  {
    id: "event-loop",
    label: "Event loop",
    hint: "Click = setTimeout · any key = Promise",
    pinned: false,
    drawsHeadline: false,
  },
  {
    id: "chaos-services",
    label: "Service mesh",
    hint: "Click a service to break it",
    pinned: false,
    drawsHeadline: false,
  },
  {
    id: "garbage-collector",
    label: "Garbage collector",
    hint: "Drag across a reference to cut it",
    pinned: false,
    drawsHeadline: false,
  },
] as const;

export type HeroVariant = (typeof HERO_VARIANTS)[number];
export type HeroVariantId = HeroVariant["id"];
