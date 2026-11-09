"use client";

import { motion } from "framer-motion";
import Image from "next/image";

import { rise } from "@/lib/motion";

type ProjectCardProps = {
  columnIndex: number;
  src: string;
  title: string;
  description: string;
  demo: string;
  source: string;
  tech: ReadonlyArray<{ readonly name: string; readonly icon: string }>;
};

// Each card is a "normalized" record: a schema strip across the top, then the
// screenshot and the description.
export const ProjectCard = ({
  columnIndex,
  src,
  title,
  description,
  demo,
  source,
  tech,
}: ProjectCardProps) => {
  const availability = [demo && "Live", source && "Source"]
    .filter(Boolean)
    .join(" · ");

  return (
    <motion.article
      variants={rise(0.08 * columnIndex)}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.25 }}
      className="flex h-full flex-col border bg-ledger transition-colors hover:border-copy/60"
    >
      <div className="mono-label flex justify-between gap-4 border-b px-4 py-2 text-form/55">
        <span className="truncate">
          {tech
            .slice(0, 3)
            .map((item) => item.name)
            .join(" · ")}
          {tech.length > 3 && ` +${tech.length - 3}`}
        </span>
        <span className="shrink-0">{availability || "Private"}</span>
      </div>

      <Image
        src={src}
        alt={`Screenshot of ${title}`}
        width={1498}
        height={842}
        className="w-full border-b object-contain"
        draggable={false}
      />

      <div className="flex grow flex-col p-6">
        <h3 className="font-display text-3xl text-form">{title}</h3>
        <p className="mt-3 grow leading-relaxed text-form/75">{description}</p>

        <ul className="mt-6 flex flex-wrap gap-3" aria-label="Technologies">
          {tech.map((item) => (
            <li key={item.name} title={item.name}>
              <Image
                src={`/skills/${item.icon}`}
                alt={item.name}
                width={20}
                height={20}
                className="h-5 w-5 object-contain"
                draggable={false}
              />
            </li>
          ))}
        </ul>

        {(demo || source) && (
          <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 border-t pt-4">
            {demo && (
              <a
                href={demo}
                target="_blank"
                rel="noreferrer noopener"
                className="mono-label text-copy underline-offset-4 hover:underline"
              >
                Open live site ↗
              </a>
            )}
            {source && (
              <a
                href={source}
                target="_blank"
                rel="noreferrer noopener"
                className="mono-label text-copy underline-offset-4 hover:underline"
              >
                View source ↗
              </a>
            )}
          </div>
        )}
      </div>
    </motion.article>
  );
};
