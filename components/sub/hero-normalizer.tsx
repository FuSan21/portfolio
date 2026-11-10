"use client";

import {
  motion,
  useInView,
  useMotionValue,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";
import dynamic from "next/dynamic";
import { useRef } from "react";

import { atkinson, martian, redaction, redaction100 } from "@/app/fonts";
import {
  HEADLINE_CLASS,
  HEADLINE_WORDS,
  HeroIntro,
} from "@/components/sub/hero-intro";
import { PROJECTS } from "@/constants";
import {
  clamp01,
  gradeFor,
  REDACTION_GRADES,
  STAMP_AT,
  STILL_PROGRESS,
} from "@/lib/normalizer-timeline";
import { useMediaQuery } from "@/lib/use-media-query";

// three.js + r3f is the heaviest thing on the page. Keep it out of the
// initial bundle; WebGL cannot render on the server anyway, hence ssr: false.
const NormalizerScene = dynamic(
  () =>
    import("@/components/sub/normalizer-scene").then(
      (mod) => mod.NormalizerScene
    ),
  { ssr: false }
);

// The first projects are the sheets that come out of the rollers clean.
const SHEETS = PROJECTS.slice(0, 3).map((project) => ({
  title: project.title,
  description: project.description,
  tech: project.tech.map((item) => item.name),
}));

const SCENE_FONTS = {
  display: redaction.style.fontFamily,
  degraded: redaction100.style.fontFamily,
  body: atkinson.style.fontFamily,
  mono: martian.style.fontFamily,
};

const Word = ({
  word,
  index,
  progress,
}: {
  word: string;
  index: number;
  progress: MotionValue<number>;
}) => {
  const fontFamily = useTransform(progress, (p) => gradeFor(p, index));
  return <motion.span style={{ fontFamily }}>{word}</motion.span>;
};

// Scroll-linked values use the function form of useTransform on purpose. The
// range form lets framer-motion hand opacity to a native ViewTimeline, which
// ignores useScroll's offsets: it spans the section's whole time in view, so
// the stamp landed late and vanished again once that timeline ended.
const stampIn = (p: number) => clamp01((p - STAMP_AT) / 0.03);

const Headline = ({ progress }: { progress: MotionValue<number> }) => {
  const opacity = useTransform(progress, stampIn);
  const scale = useTransform(progress, (p) => 1.8 - 0.8 * stampIn(p));

  return (
    <div className="relative mt-4">
      <h1 className={HEADLINE_CLASS}>
        {HEADLINE_WORDS.map((word, i) => (
          <span key={word}>
            <Word word={word} index={i} progress={progress} />
            {i < HEADLINE_WORDS.length - 1 && " "}
          </span>
        ))}
      </h1>
      <motion.p
        aria-hidden
        style={{ opacity, scale }}
        className="absolute right-0 -top-6 rotate-[-8deg] border-[3px] border-stamp px-3 py-1 mono-label text-sm font-bold text-stamp md:-top-10"
      >
        Normalized
      </motion.p>
    </div>
  );
};

export const NormalizerHero = ({ hint }: { hint: string }) => {
  const sectionRef = useRef<HTMLElement>(null);
  const reduceMotion = useMediaQuery("(prefers-reduced-motion: reduce)", false);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });
  const settled = useMotionValue(1);
  const still = useMotionValue(STILL_PROGRESS);
  const cue = useTransform(scrollYProgress, (p) => 1 - clamp01(p / 0.05));
  // Unmount the canvas once the pinned section is well out of view.
  const nearViewport = useInView(sectionRef, { margin: "200px 0px" });

  return (
    <section
      id="about-me"
      ref={sectionRef}
      className="relative h-[320vh] motion-reduce:h-svh"
    >
      <div className="sticky top-0 h-svh overflow-hidden">
        <div className="absolute inset-0" aria-hidden>
          {nearViewport && (
            <NormalizerScene
              progress={reduceMotion ? still : scrollYProgress}
              sheets={SHEETS}
              projectTotal={PROJECTS.length}
              fonts={SCENE_FONTS}
            />
          )}
        </div>

        <HeroIntro
          headline={
            // Remount on preference change so the words re-subscribe.
            <Headline
              key={reduceMotion ? "still" : "scroll"}
              progress={reduceMotion ? settled : scrollYProgress}
            />
          }
        />

        <motion.p
          aria-hidden
          style={{ opacity: cue }}
          className="mono-label absolute bottom-6 right-6 hidden text-form/50 md:right-12 md:block motion-reduce:hidden"
        >
          {hint}
        </motion.p>

        {/* Renders the middle Redaction grades once so the browser fetches
            them before the first scroll instead of mid-transition. */}
        <span
          aria-hidden
          className="pointer-events-none absolute -left-full opacity-0"
        >
          {REDACTION_GRADES.slice(1, -1).map((family) => (
            <span key={family} style={{ fontFamily: family }}>
              a
            </span>
          ))}
        </span>
      </div>
    </section>
  );
};
