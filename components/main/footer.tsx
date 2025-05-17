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
              <div key={skill.name} className="w-6 relative group">
                <Image
                  src={`/skills/${skill.image}`}
                  width={skill.size}
                  height={skill.size}
                  alt={skill.name}
                  draggable={false}
                  className="cursor-pointer select-none"
                />
                <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded-sm py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                  {skill.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
