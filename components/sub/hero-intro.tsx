import type { ReactNode } from "react";

import { PROFESSIONAL_PROFILES } from "@/constants";

export const HEADLINE_WORDS = ["Untangled,", "typed,", "shipped."] as const;

export const HEADLINE_CLASS =
  "font-display text-[clamp(3.25rem,8.5vw,7.25rem)] leading-[0.92] text-form";

// The intro every hero shares, pinned to the bottom of the viewport over the
// scene. Only the links take pointer events, so clicks and drags elsewhere
// reach interactive scenes underneath.
export const HeroIntro = ({ headline }: { headline: ReactNode }) => (
  <div className="pointer-events-none relative z-10 flex h-full flex-col justify-end">
    <div className="mx-auto w-full max-w-6xl bg-linear-to-t from-carbon via-carbon/90 to-transparent px-6 pb-10 pt-28 md:bg-none md:px-10 md:pb-16 md:pt-0">
      <div className="max-w-2xl">
        <p className="mono-label text-form/60">Fuad Hasan</p>
        {headline}
        <p className="mono-label mt-6 text-copy">Full stack · AI · Team lead</p>
        <p className="mt-4 max-w-md text-base text-form/75 md:text-lg">
          Application engineer and team lead at All Generation Tech. I build
          rules engines, integrations and internal tools for the processes
          nobody wants to touch.
        </p>
        <ul className="pointer-events-auto mt-6 flex w-fit flex-wrap gap-x-6 gap-y-2">
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
);
