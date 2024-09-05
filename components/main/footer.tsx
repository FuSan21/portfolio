import Link from "next/link";
import Image from "next/image";
import { USED_TECH } from "@/constants";

export const Footer = () => {
  return (
    <div className="w-full h-full bg-transparent text-gray-200 shadow-lg md:p-[15px]">
      <div className="w-full flex flex-col items-center justify-center m-auto">
        <div className="flex md:flex-row flex-col justify-between items-center space-y-4 md:space-y-0 my-auto w-full md:w-3/4 ">
          <p className="mb-[20px] text-[20px]">
            &copy; Fuad Hasan {new Date().getFullYear()} Inc. All rights
            reserved.
          </p>
          <div className="flex flex-row space-x-2">
            <p className="mb-[20px] text-[20px] text-white">Made with </p>
            {USED_TECH.map((skill) => (
              <div key={skill.name} className="w-6">
                <Image
                  src={`/skills/${skill.image}`}
                  width={skill.size}
                  height={skill.size}
                  alt={skill.name}
                  title={skill.name}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
