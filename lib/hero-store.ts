import { useSyncExternalStore } from "react";

import { HERO_VARIANTS, type HeroVariantId } from "@/lib/hero-variants";

// Which hero is showing, shared by the hero section and the header switcher.
// The pick happens on the client: the page is cached ("use cache"), so a
// server-side Math.random() would freeze one hero for every visitor until the
// next revalidate. The server snapshot is null and renders a scene-less shell.

let current: HeroVariantId | null = null;
const listeners = new Set<() => void>();

const pickRandom = (): HeroVariantId => {
  // Only the Normalizer has a still frame, so reduced-motion visitors start
  // there. They can still pick another hero from the header.
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return "normalizer";
  }
  return HERO_VARIANTS[Math.floor(Math.random() * HERO_VARIANTS.length)].id;
};

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

const getSnapshot = () => (current ??= pickRandom());
const getServerSnapshot = () => null;

export const setHeroVariant = (id: HeroVariantId) => {
  if (id === current) return;
  current = id;
  listeners.forEach((listener) => listener());
};

/** Swap to a different hero at random (never the one already showing). */
export const shuffleHeroVariant = () => {
  const pool = HERO_VARIANTS.filter((variant) => variant.id !== getSnapshot());
  setHeroVariant(pool[Math.floor(Math.random() * pool.length)].id);
};

export const useHeroVariant = () =>
  useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
