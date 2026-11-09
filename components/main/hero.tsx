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
import { PROFESSIONAL_PROFILES, PROJECTS } from "@/constants";
import {
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

const WORDS = ["Untangled,", "typed,", "shipped."] as const;

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

const Headline = ({ progress }: { progress: MotionValue<number> }) => {
  const opacity = useTransform(progress, [STAMP_AT, STAMP_AT + 0.03], [0, 1]);
  const scale = useTransform(progress, [STAMP_AT, STAMP_AT + 0.03], [1.8, 1]);

  return (
    <div className="relative mt-4">
      <h1 className="font-display text-[clamp(3.25rem,8.5vw,7.25rem)] leading-[0.92] text-form">
        {WORDS.map((word, i) => (
          <span key={word}>
            <Word word={word} index={i} progress={progress} />
            {i < WORDS.length - 1 && " "}
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

export const Hero = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const reduceMotion = useMediaQuery("(prefers-reduced-motion: reduce)", false);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });
  const settled = useMotionValue(1);
  const still = useMotionValue(STILL_PROGRESS);
  const cue = useTransform(scrollYProgress, [0, 0.05], [1, 0]);
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

        <div className="pointer-events-none relative z-10 flex h-full flex-col justify-end">
          <div className="mx-auto w-full max-w-6xl bg-linear-to-t from-carbon via-carbon/90 to-transparent px-6 pb-10 pt-28 md:bg-none md:px-10 md:pb-16 md:pt-0">
            <div className="pointer-events-auto max-w-2xl">
              <p className="mono-label text-form/60">Fuad Hasan</p>
              {/* Remount on preference change so the words re-subscribe. */}
              <Headline
                key={reduceMotion ? "still" : "scroll"}
                progress={reduceMotion ? settled : scrollYProgress}
              />
              <p className="mono-label mt-6 text-copy">
                Full stack · AI · Team lead
              </p>
              <p className="mt-4 max-w-md text-base text-form/75 md:text-lg">
                Application engineer and team lead at All Generation Tech. I
                build rules engines, integrations and internal tools for the
                processes nobody wants to touch.
              </p>
              <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2">
                {PROFESSIONAL_PROFILES.map((profile) => {
                  const external = profile.link.startsWith("http");
                  return (
                    <li key={profile.profile_name}>
                      <a
                        href={profile.link}
                        {...(external && {
                          target: "_blank",
                          rel: "noreferrer noopener",
                        })}
                        className="mono-label text-form underline decoration-form/30 underline-offset-4 transition-colors hover:decoration-copy"
                      >
                        {profile.profile_name}
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>

        <motion.p
          aria-hidden
          style={{ opacity: cue }}
          className="mono-label absolute bottom-6 right-6 hidden text-form/50 md:right-12 md:block motion-reduce:hidden"
        >
          Scroll to feed the rollers ↓
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
