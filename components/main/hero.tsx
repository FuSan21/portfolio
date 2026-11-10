"use client";

import { NormalizerHero } from "@/components/sub/hero-normalizer";
import { SceneHero } from "@/components/sub/hero-scene";
import { useHeroVariant } from "@/lib/hero-store";
import { HERO_VARIANTS } from "@/lib/hero-variants";

// Renders whichever hero the store picked (random per visit, switchable from
// the header). Keyed by variant so switching remounts cleanly: scroll
// listeners, canvases and timers belong to one hero at a time.
export const Hero = () => {
  const id = useHeroVariant();
  const variant = HERO_VARIANTS.find((item) => item.id === id) ?? null;

  if (variant?.id === "normalizer") {
    return <NormalizerHero key={variant.id} hint={variant.hint} />;
  }
  return <SceneHero key={variant?.id ?? "shell"} variant={variant} />;
};
