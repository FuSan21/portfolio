"use client";

import { useState } from "react";
import { ProjectCard } from "@/components/sub/project-card";
import { PROJECTS } from "@/constants";
import { motion } from "framer-motion";
import { staggerContainer } from "@/lib/motion";
import { useMediaQuery } from "@/lib/use-media-query";

export const Projects = () => {
  const [currentPage, setCurrentPage] = useState(0);
  const projectsPerPage = 6;
  const totalPages = Math.ceil(PROJECTS.length / projectsPerPage);

  const handleNextPage = () => {
    setCurrentPage((prevPage) => {
      const newPage = Math.min(prevPage + 1, totalPages - 1);
      setTimeout(() => {
        document
          .getElementById("projects")
          ?.scrollIntoView({ behavior: "smooth" });
      }, 0);
      return newPage;
    });
  };

  const handlePrevPage = () => {
    setCurrentPage((prevPage) => {
      const newPage = Math.max(prevPage - 1, 0);
      setTimeout(() => {
        document
          .getElementById("projects")
          ?.scrollIntoView({ behavior: "smooth" });
      }, 0);
      return newPage;
    });
  };

  const startIndex = currentPage * projectsPerPage;
  const endIndex = startIndex + projectsPerPage;
  const currentProjects = PROJECTS.slice(startIndex, endIndex);

  // Mirrors the grid below (grid-cols-1 md:grid-cols-2 lg:grid-cols-3) so the
  // stagger delay matches a card's actual column. Defaults to the lg layout
  // during SSR, then settles to the real breakpoint after hydration.
  const isLargeScreen = useMediaQuery("(min-width: 1024px)", true);
  const isMediumScreen = useMediaQuery("(min-width: 768px)", false);
  const columnsPerRow = isLargeScreen ? 3 : isMediumScreen ? 2 : 1;

  return (
    <motion.section
      variants={staggerContainer(0.1, 0.2)}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.2 }}
      className={"flex flex-col items-center justify-center py-20"}
    >
      <h1
        className="text-[40px] font-semibold text-transparent bg-clip-text bg-linear-to-r from-purple-500 to-cyan-500 py-20"
        id="projects"
      >
        My Projects
      </h1>
      <div className="h-full w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 px-10">
        {currentProjects.map((project, i) => {
          const columnIndex = i % columnsPerRow;
          return (
            <ProjectCard
              key={project.title}
              columnIndex={columnIndex}
              src={project.image}
              title={project.title}
              description={project.description}
              demo={project.demo}
              source={project.source}
              tech={project.tech}
            />
          );
        })}
      </div>
      {totalPages > 1 && (
        <div className="flex justify-center mt-10">
          <button
            className={`px-4 py-2 rounded-md mr-2 ${
              currentPage === 0 ? "bg-gray-500" : "button-primary text-white"
            }`}
            onClick={handlePrevPage}
            disabled={currentPage === 0}
          >
            Previous
          </button>
          <button
            className={`px-4 py-2 rounded-md ${
              currentPage === totalPages - 1
                ? "bg-gray-500"
                : "button-primary text-white"
            }`}
            onClick={handleNextPage}
            disabled={currentPage === totalPages - 1}
          >
            Next
          </button>
        </div>
      )}
    </motion.section>
  );
};
