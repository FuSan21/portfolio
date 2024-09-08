"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useInView } from "react-intersection-observer";
import { skillContainerVariant, skillIconVariant } from "@/lib/motion";

type SkillDataProviderProps = {
  src: string;
  name: string;
  width: number;
  height: number;
};

export const SkillDataProvider = ({
  src,
  name,
  width,
  height,
}: SkillDataProviderProps) => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 1,
  });

  return (
    <motion.div
      ref={ref}
      variants={skillContainerVariant()}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      className="flex flex-col items-center"
    >
      <motion.div variants={skillIconVariant()} whileHover="hover">
        <Image
          src={`/skills/${src}`}
          width={80}
          height={80}
          alt={name}
          title={name}
          className="h-20 w-20"
        />
      </motion.div>
      <p className="text-center text-white font-bold mt-2">{name}</p>
    </motion.div>
  );
};
