import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { fadeIn } from "@/lib/motion";

type ProjectCardProps = {
  index: number;
  src: string;
  title: string;
  description: string;
  demo: string;
  source: string;
};

export const ProjectCard = ({
  index,
  src,
  title,
  description,
  demo,
  source,
}: ProjectCardProps) => {
  return (
    <motion.div
      variants={fadeIn("right", "spring", 0.5 * index, 0.75)}
      className="relative overflow-hidden rounded-lg shadow-lg border border-[#2A0E61] flex flex-col"
    >
      <Image
        src={src}
        alt={title}
        width={1000}
        height={1000}
        className="object-fill w-[445px] h-[250px]"
      />

      <div className="relative p-4 flex flex-col flex-grow">
        <h1 className="text-2xl font-semibold text-white">{title}</h1>
        <p className="mt-2 text-gray-300">{description}</p>

        <div className="flex-grow"></div>

        <div className="flex space-x-4">
          {demo && (
            <a
              href={demo}
              target="_blank"
              rel="noreferrer noopener"
              className="flex items-center p-2.5 button-primary text-center text-white cursor-pointer rounded-lg max-w-[200px]"
            >
              <span>{"Demo"}</span>
            </a>
          )}
          {source && (
            <a
              href={source}
              target="_blank"
              rel="noreferrer noopener"
              className="flex items-center p-2.5 button-primary text-center text-white cursor-pointer rounded-lg max-w-[200px]"
            >
              <span>{"Source"}</span>
            </a>
          )}
        </div>
      </div>
    </motion.div>
  );
};
