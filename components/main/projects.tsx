"use client";

import { useState } from "react";
import { ProjectCard } from "@/components/sub/project-card";
import { PROJECTS } from "@/constants";
import { motion } from "framer-motion";
import { staggerContainer } from "@/lib/motion";

export const Projects = () => {
  const [currentPage, setCurrentPage] = useState(0);
  const projectsPerPage = 6;
  const totalPages = Math.ceil(PROJECTS.length / projectsPerPage);

  const handleNextPage = () => {
    document.getElementById("projects")?.scrollIntoView({ behavior: "smooth" });
    setCurrentPage((prevPage) => Math.min(prevPage + 1, totalPages - 1));
  };

  const handlePrevPage = () => {
    document.getElementById("projects")?.scrollIntoView({ behavior: "smooth" });
    setCurrentPage((prevPage) => Math.max(prevPage - 1, 0));
  };

  const startIndex = currentPage * projectsPerPage;
  const endIndex = startIndex + projectsPerPage;
  const currentProjects = PROJECTS.slice(startIndex, endIndex);

  return (
    <motion.section
      key={currentPage}
      variants={staggerContainer(0.1, 0.2)}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.2 }}
      className={"flex flex-col items-center justify-center py-20"}
    >
      <h1
        className="text-[40px] font-semibold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-cyan-500 py-20"
        id="projects"
      >
        My Projects
      </h1>
      <div className="h-full w-full flex-col md:grid md:grid-cols-3 gap-10 px-10">
        {currentProjects.map((project, i) => (
          <ProjectCard
            index={i}
            key={project.title}
            src={project.image}
            title={project.title}
            description={project.description}
            demo={project.demo}
            source={project.source}
          />
        ))}
      </div>
      {totalPages > 1 && (
        <div className="flex justify-center mt-10">
          <button
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md mr-2"
            onClick={handlePrevPage}
            disabled={currentPage === 0}
          >
            Previous
          </button>
          <button
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md"
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
