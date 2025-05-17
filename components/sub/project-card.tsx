import { memo, useRef, useState, useEffect } from "react";
import Image from "next/image";
import { motion, useInView } from "framer-motion";
import { fadeIn } from "@/lib/motion";

type ProjectCardProps = {
  columnIndex: number;
  columnsInRow: number;
  src: string;
  title: string;
  description: string;
  demo: string;
  source: string;
  tech: ReadonlyArray<{ readonly name: string; readonly icon: string }>;
};

export const ProjectCard = memo(
  ({
    columnIndex,
    src,
    title,
    description,
    demo,
    source,
    tech,
  }: ProjectCardProps) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, amount: 0.5 });
    const [isTouchDevice, setIsTouchDevice] = useState(false);

    useEffect(() => {
      setIsTouchDevice(window.matchMedia("(hover: none)").matches);
    }, []);

    return (
      <motion.div
        ref={ref}
        variants={fadeIn("right", "spring", 0.5 * columnIndex, 0.75)}
        initial="hidden"
        animate={isInView ? "show" : "hidden"}
        {...(!isTouchDevice && { whileHover: { scale: [null, 1.1, 1.05] } })}
        {...(isTouchDevice && { whileTap: { scale: 0.95 } })}
        className="relative overflow-hidden rounded-lg shadow-lg border border-[#2A0E61] flex flex-col h-full"
      >
        <Image
          src={src}
          alt={title}
          width={1498}
          height={842}
          className="w-full object-contain"
          draggable={false}
        />

        <div className="relative p-4 flex flex-col grow">
          <h1 className="text-2xl font-semibold text-white">{title}</h1>
          <p className="mt-2 text-gray-300 grow">{description}</p>
          <div className="flex justify-between items-center mt-4">
            <div className="flex flex-col space-y-4 lg:flex-row lg:space-x-4 lg:space-y-0">
              {demo && (
                <a
                  href={demo}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="flex items-center justify-center p-2.5 button-primary text-center text-white cursor-pointer rounded-lg"
                >
                  <span>Demo</span>
                </a>
              )}
              {source && (
                <a
                  href={source}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="flex items-center justify-center p-2.5 button-primary text-center text-white cursor-pointer rounded-lg"
                >
                  <span>Source</span>
                </a>
              )}
            </div>
            <div className="flex flex-wrap gap-2 justify-end">
              {tech.map((item, i) => (
                <div key={i} className="px-2 py-1 rounded-md relative group">
                  <Image
                    src={`/skills/${item.icon}`}
                    alt={item.name}
                    width={20}
                    height={20}
                    className="cursor-pointer select-none h-5 w-5"
                    draggable={false}
                  />
                  <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded-sm py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                    {item.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    );
  }
);

ProjectCard.displayName = "ProjectCard";
