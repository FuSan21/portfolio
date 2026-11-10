"use client";

import {
  motion,
  useInView,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";
import dynamic from "next/dynamic";
import { useRef, type ComponentType } from "react";

import {
  HEADLINE_WORDS,
  HeroIntro,
} from "@/components/sub/hero-intro";
import type { HeroVariant } from "@/lib/hero-variants";

type SceneProps = { progress?: MotionValue<number> };

// Each scene is its own lazy chunk, so a visit only downloads the hero it
// shows. All of them need WebGL, hence ssr: false.
const SCENES: Record<
  Exclude<HeroVariant["id"], "normalizer">,
  ComponentType<SceneProps>
> = {
  compile: dynamic(() => import("@/components/heroes/compile/scene"), {
    ssr: false,
  }),
  "merge-conflict": dynamic(
    () => import("@/components/heroes/merge-conflict/scene"),
    { ssr: false }
  ),
  "rules-pachinko": dynamic(
    () => import("@/components/heroes/rules-pachinko/scene"),
    { ssr: false }
  ),
  "event-loop": dynamic(() => import("@/components/heroes/event-loop/scene"), {
    ssr: false,
  }),
  "chaos-services": dynamic(
    () => import("@/components/heroes/chaos-services/scene"),
    { ssr: false }
  ),
  "garbage-collector": dynamic(
    () => import("@/components/heroes/garbage-collector/scene"),
    { ssr: false }
  ),
};

/** Interaction cue, bottom right. Scroll-driven heroes fade it once scrolling starts. */
const Hint = ({
  text,
  progress,
  fades,
}: {
  text: string;
  progress: MotionValue<number>;
  fades: boolean;
}) => {
  // Function form, not ranges: see the ViewTimeline note in hero-normalizer.tsx.
  const opacity = useTransform(progress, (p) =>
    fades ? 1 - Math.min(1, p / 0.05) : 1
  );
  return (
    <motion.p
      aria-hidden
      style={{ opacity }}
      className="mono-label pointer-events-none absolute bottom-6 right-6 z-10 hidden text-form/50 md:right-12 md:block"
    >
      {text}
    </motion.p>
  );
};

/**
 * A scene hero: full-viewport canvas under the navbar with the shared intro on
 * top. With `variant` null (server render, before the client picks) it renders
 * the intro alone, so the first paint has the real text.
 */
export const SceneHero = ({
  variant,
}: {
  variant: Exclude<HeroVariant, { id: "normalizer" }> | null;
}) => {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });
  // Unmount the canvas once the hero is well out of view.
  const nearViewport = useInView(sectionRef, { margin: "200px 0px" });
  const pinned = variant?.pinned ?? false;
  const Scene = variant ? SCENES[variant.id] : null;
  const progress = pinned ? scrollYProgress : undefined;

  return (
    <section
      id="about-me"
      ref={sectionRef}
      className={pinned ? "relative h-[240vh]" : "relative h-svh"}
    >
      <div className="sticky top-0 h-svh overflow-hidden">
        <div className="absolute inset-x-0 bottom-0 top-14">
          {Scene && nearViewport && <Scene progress={progress} />}
        </div>

        {/* Scenes fill the frame edge to edge, so shade the corner the intro
            sits in rather than darkening the whole canvas. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 hidden md:block"
          style={{
            background:
              "radial-gradient(ellipse 65% 70% at 0% 100%, var(--color-carbon) 45%, transparent 100%)",
          }}
        />

        <HeroIntro
          headline={
            // The scene is the centrepiece here, so the headline drops to a
            // size that leaves it room. The server shell (variant null) uses
            // the same size, since most picks land on it.
            <h1
              className={
                variant?.drawsHeadline
                  ? "sr-only"
                  : "mt-3 font-display text-[clamp(2.5rem,4.2vw,3.5rem)] leading-none text-form"
              }
            >
              {HEADLINE_WORDS.join(" ")}
            </h1>
          }
        />

        {variant && (
          <Hint text={variant.hint} progress={scrollYProgress} fades={pinned} />
        )}
      </div>
    </section>
  );
};
