"use client";

import { ProjectCard } from "@/components/sub/project-card";
import { PROJECTS } from "@/constants";
import { motion } from "framer-motion";
import { staggerContainer } from "@/lib/motion";

export const Projects = () => {
  return (
    <motion.section
      variants={staggerContainer()}
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
        {PROJECTS.map((project, i) => (
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
    </motion.section>
  );
};
