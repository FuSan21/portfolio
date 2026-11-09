"use client";

import { useState } from "react";

import { ProjectCard } from "@/components/sub/project-card";
import { SectionHeading } from "@/components/sub/section-heading";
import { PROJECTS } from "@/constants";

const INITIAL_COUNT = 6;

export const Projects = () => {
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? PROJECTS : PROJECTS.slice(0, INITIAL_COUNT);
  const hiddenCount = PROJECTS.length - INITIAL_COUNT;

  return (
    <section
      id="projects"
      className="mx-auto max-w-6xl scroll-mt-20 px-6 py-28 md:px-10"
    >
      <SectionHeading title="Projects" detail={`${PROJECTS.length} projects`} />

      <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2">
        {visible.map((project, i) => (
          <ProjectCard
            key={project.title}
            columnIndex={i % 2}
            src={project.image}
            title={project.title}
            description={project.description}
            demo={project.demo}
            source={project.source}
            tech={project.tech}
          />
        ))}
      </div>

      {hiddenCount > 0 && (
        <button
          type="button"
          onClick={() => setShowAll((value) => !value)}
          aria-expanded={showAll}
          className="mono-label mt-10 border px-5 py-3 text-form transition-colors hover:border-copy hover:text-copy"
        >
          {showAll
            ? "Show fewer projects"
            : `Show ${hiddenCount} more projects`}
        </button>
      )}
    </section>
  );
};
