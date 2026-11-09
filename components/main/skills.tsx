"use client";

import Image from "next/image";
import { useState } from "react";

import { SectionHeading } from "@/components/sub/section-heading";
import {
  BASE_LANGUAGE,
  CLOUD_SERVICES,
  DATABASE,
  FRONTEND_SKILL,
  FULLSTACK_SKILL,
  OTHER_SKILL,
  PROJECTS,
} from "@/constants";

const FIELDS = [
  ["languages", BASE_LANGUAGE],
  ["frontend", FRONTEND_SKILL],
  ["frameworks", FULLSTACK_SKILL],
  ["databases", DATABASE],
  ["cloud", CLOUD_SERVICES],
  ["tooling", OTHER_SKILL],
] as const;

const SKILL_COUNT = FIELDS.reduce((sum, [, skills]) => sum + skills.length, 0);

const key = (name: string) => name.toLowerCase();

// For every technology, which others shipped alongside it in PROJECTS, and in
// how many projects it appears at all.
const { pairs, projectCounts } = (() => {
  const pairs = new Map<string, Map<string, number>>();
  const projectCounts = new Map<string, number>();
  for (const project of PROJECTS) {
    const names = project.tech.map((item) => item.name);
    for (const name of names) {
      projectCounts.set(key(name), (projectCounts.get(key(name)) ?? 0) + 1);
      const partners = pairs.get(key(name)) ?? new Map<string, number>();
      for (const other of names) {
        if (other !== name) partners.set(other, (partners.get(other) ?? 0) + 1);
      }
      pairs.set(key(name), partners);
    }
  }
  return { pairs, projectCounts };
})();

const describe = (name: string) => {
  const count = projectCounts.get(key(name)) ?? 0;
  if (count === 0) return `${name}: used outside the projects listed here.`;
  const partners = [...(pairs.get(key(name)) ?? new Map<string, number>())]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([partner]) => partner);
  const projects = `${count} listed project${count === 1 ? "" : "s"}`;
  return partners.length
    ? `${name}: in ${projects}, most often with ${partners.join(", ")}.`
    : `${name}: in ${projects}.`;
};

export const Skills = () => {
  const [active, setActive] = useState<string | null>(null);
  const related = active ? pairs.get(key(active)) : undefined;

  return (
    <section
      id="skills"
      className="mx-auto max-w-6xl scroll-mt-20 px-6 py-28 md:px-10"
    >
      <SectionHeading
        title="Skills"
        detail={`${SKILL_COUNT} entries · ${FIELDS.length} fields`}
      />

      <p
        aria-live="polite"
        className="mono-label mt-8 min-h-[2.2rem] text-copy normal-case"
      >
        {active
          ? describe(active)
          : "Point at a skill to see what it shipped with in the projects above."}
      </p>

      <dl className="mt-6 divide-y divide-form/12 border-y">
        {FIELDS.map(([field, skills]) => (
          <div
            key={field}
            className="grid gap-3 py-5 md:grid-cols-[11rem_1fr] md:gap-6"
          >
            <dt className="mono-label pt-2 text-copy">{field}:</dt>
            <dd className="flex flex-wrap gap-2">
              {skills.map((skill) => {
                const name = skill.skill_name;
                const isActive = active === name;
                const isRelated = related?.has(name) ?? false;
                const dimmed = active !== null && !isActive && !isRelated;
                return (
                  <button
                    key={name}
                    type="button"
                    aria-pressed={isActive}
                    onMouseEnter={() => setActive(name)}
                    onMouseLeave={() => setActive(null)}
                    onFocus={() => setActive(name)}
                    onBlur={() => setActive(null)}
                    className={`flex items-center gap-2 border px-3 py-1.5 text-sm transition ${
                      isActive
                        ? "border-copy bg-copy/10 text-form"
                        : isRelated
                          ? "border-form/50 text-form"
                          : "text-form/80"
                    } ${dimmed ? "opacity-35" : ""}`}
                  >
                    <Image
                      src={`/skills/${skill.image}`}
                      alt=""
                      width={18}
                      height={18}
                      className="h-[18px] w-[18px] object-contain"
                      draggable={false}
                    />
                    {name}
                  </button>
                );
              })}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
};
