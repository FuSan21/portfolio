"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import {
  VerticalTimeline,
  VerticalTimelineElement,
} from "react-vertical-timeline-component";

import { parseStringWithBold } from "@/lib/utils";
import { JOB_EXPERIENCES, EDUCATION_EXPERIENCES } from "@/constants";
import { textVariant } from "@/lib/motion";

import "react-vertical-timeline-component/style.min.css";
import { useInView } from "react-intersection-observer";

type ExperienceCardProps = {
  experience: (typeof JOB_EXPERIENCES | typeof EDUCATION_EXPERIENCES)[number];
  position?: "left" | "right";
};

// Experience Card
const ExperienceCard = ({ experience, position }: ExperienceCardProps) => {
  const { ref, inView } = useInView({ threshold: 0.5, triggerOnce: true });

  return (
    <VerticalTimelineElement
      contentStyle={{ background: "#1d1836", color: "#fff" }}
      contentArrowStyle={{ borderRight: "7px solid #232631" }}
      date={experience.date}
      iconStyle={{ background: experience.iconBg }}
      visible={inView}
      position={position}
      icon={
        <div className="flex justify-center items-center w-full h-full">
          <Image
            src={`/experiences/${experience.icon}`}
            width={80}
            height={80}
            alt={experience.name}
            className="w-[60%] h-[60%] object-contain"
            draggable={false}
          />
        </div>
      }
    >
      {/* Title */}
      <div ref={ref}>
        <h3 className="text-white text-[24px] font-bold">{experience.title}</h3>
        <p
          className="text-secondary text-[16px] font-semibold"
          style={{ margin: 0 }}
        >
          {experience.name}
        </p>

        {/* Experience Points */}
        {"points" in experience && (
          <ul className="mt-5 list-disc ml-5 space-y-2">
            {experience.points.map((point, i) => (
              <li
                key={`experience-point-${i}`}
                className="text-white-100 text-[14px] pl-1 tracking-wider"
              >
                {parseStringWithBold(point)}
              </li>
            ))}
          </ul>
        )}

        {/* cgpa */}
        {"cgpa" in experience && (
          <p className="text-white-100 text-[14px] pl-1 tracking-wider">
            CGPA: {parseStringWithBold(experience.cgpa)}
          </p>
        )}
      </div>
    </VerticalTimelineElement>
  );
};

// Experience
export const Experience = () => {
  return (
    <section
      className={"sm:px-16 px-6 sm:py-16 py-10 max-w-7xl mx-auto relative z-0"}
    >
      <span className="hash-span" id="experiences">
        &nbsp;
      </span>
      {/* Title */}
      <motion.div variants={textVariant()}>
        <p
          className={
            "sm:text-[18px] text-[14px] text-gray-400 font-black uppercase tracking-wider"
          }
        >
          What I have done so far
        </p>
        <h2 className="text-white font-black md:text-[60px] sm:text-[50px] xs:text-[40px] text-[30px]">
          Work Experience.
        </h2>
      </motion.div>

      {/* Experience Card */}
      <div className="empty-20 flex flex-col">
        <VerticalTimeline>
          {JOB_EXPERIENCES.map((experience, i) => (
            <ExperienceCard key={i} experience={experience} />
          ))}
        </VerticalTimeline>
      </div>

      <motion.div variants={textVariant()}>
        <h2 className="text-white font-black md:text-[60px] sm:text-[50px] xs:text-[40px] text-[30px]">
          Education Experience.
        </h2>
      </motion.div>

      {/* Experience Card */}
      <div className="empty-20 flex flex-col">
        <VerticalTimeline>
          {EDUCATION_EXPERIENCES.map((experience, i) => (
            <ExperienceCard key={i} experience={experience} position="right" />
          ))}
        </VerticalTimeline>
      </div>
    </section>
  );
};
