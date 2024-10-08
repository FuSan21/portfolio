"use client";

import { SparklesIcon } from "@heroicons/react/24/solid";
import { motion } from "framer-motion";

import { slideIn } from "@/lib/motion";
import { cedarvilleCursive } from "@/app/fonts";

export const SkillText = () => {
  return (
    <div className="w-full h-auto flex flex-col items-center justify-center">
      <motion.div
        variants={slideIn("top", "tween", 0.5, 0.5)}
        className="Welcome-box py-[8px] px-[7px] border border-[#7042f88b] opacity-[0.9]]"
      >
        <SparklesIcon className="text-[#b49bff] mr-[10px] h-5 w-5" />
        <h1 className="Welcome-text text-[13px]">
          Open Source = Limitless Possibilities
        </h1>
      </motion.div>

      <motion.div
        variants={slideIn("left", "tween", 0.5, 0.5)}
        className="text-[30px] text-white font-medium mt-[10px] text-center mb-[15px]"
      >
        Making apps with modern technologies.
      </motion.div>

      <motion.div
        variants={slideIn("right", "tween", 0.5, 0.5)}
        className={`${cedarvilleCursive.className} text-[20px] text-gray-200 mb-10 mt-[10px] text-center`}
      >
        From Concepts to Code Blocks.
      </motion.div>
    </div>
  );
};
