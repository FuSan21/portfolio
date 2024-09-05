import { SkillDataProvider } from "@/components/sub/skill-data-provider";
import { SkillText } from "@/components/sub/skill-text";

import {
  DATABASE,
  CLOUD_SERVICES,
  FRONTEND_SKILL,
  FULLSTACK_SKILL,
  OTHER_SKILL,
  BASE_LANGUAGE,
} from "@/constants";

export const Skills = () => {
  const SKILLS = [
    BASE_LANGUAGE,
    FRONTEND_SKILL,
    FULLSTACK_SKILL,
    CLOUD_SERVICES,
    DATABASE,
    OTHER_SKILL,
  ];

  return (
    <section
      id="skills"
      style={{ transform: "scale(0.9)" }}
      className="flex flex-col items-center justify-center gap-3 h-full relative overflow-hidden py-20"
    >
      <SkillText />

      {SKILLS.map((skillCategory, categoryIndex) => (
        <div
          key={categoryIndex}
          className="flex flex-row justify-around flex-wrap mt-4 gap-5 items-center"
        >
          {skillCategory.map((skill, i) => (
            <SkillDataProvider
              key={skill.skill_name}
              src={skill.image}
              name={skill.skill_name}
              width={skill.size}
              height={skill.size}
              index={i}
            />
          ))}
        </div>
      ))}

      <div className="w-full h-full absolute">
        <div className="w-full h-full z-[-10] opacity-30 absolute flex items-center justify-center bg-cover">
          <video
            className="w-full h-auto"
            preload="false"
            playsInline
            loop
            muted
            autoPlay
          >
            <source src="/videos/skills-bg.webm" type="video/webm" />
          </video>
        </div>
      </div>
    </section>
  );
};
