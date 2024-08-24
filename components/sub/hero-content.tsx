"use client";

import { SparklesIcon } from "@heroicons/react/24/solid";
import { motion } from "framer-motion";
import Image from "next/image";
import { PROFESSIONAL_PROFILES } from "@/constants";


import {
  slideInFromLeft,
  slideInFromRight,
  slideInFromTop,
} from "@/lib/motion";

export const HeroContent = () => {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      className="flex flex-row items-center justify-center px-20 mt-40 w-full z-[20]"
    >
      <div className="h-full w-full flex flex-col gap-5 justify-center m-auto text-start">
        <motion.div
          variants={slideInFromTop}
          className="Welcome-box py-[8px] px-[7px] border border-[#7042f88b] opacity-[0.9]]"
        >
          <SparklesIcon className="text-[#b49bff] mr-[10px] h-5 w-5" />
          <h1 className="Welcome-text text-[20px] font-semibold">
            Fuad Hasan
          </h1>
        </motion.div>

        <motion.div
          variants={slideInFromLeft(0.5)}
          className="flex flex-col gap-6 mt-6 text-6xl text-bold text-white max-w-[600px] w-auto h-auto"
        >
          <span>
            Engineering{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-cyan-500">
              the Future
            </span>{" "}
            with Passion and Innovation 🛠️🔮
          </span>
        </motion.div>

        <motion.p
          variants={slideInFromLeft(0.8)}
          className="text-lg text-gray-400 my-5 max-w-[600px]"
        >
          I graduated from BRAC University with a degree in Computer Science
          and Engineering, and I’m now a Freelance Web Developer. I have a
          deep passion for full stack development and am driven by a desire
          to collaborate on projects that push the limits of technology.
        </motion.p>
        <div className="flex space-x-4">
          {PROFESSIONAL_PROFILES.map((link, index) => (
            <motion.a
              variants={slideInFromLeft(1 + index * 0.6)}
              key={link.profile_name}
              href={link.link}
              target="_blank"
              rel="noreferrer noopener"
              className="flex items-center p-2.5 button-primary text-center text-white cursor-pointer rounded-lg max-w-[200px]"
            >
              <link.icon className="h-6 w-6 mr-2" />
              <span>{link.profile_name}</span>
            </motion.a>
          ))}
        </div>
      </div>

      <motion.div
        variants={slideInFromRight(0.8)}
        className="w-full h-full flex justify-center items-center"
      >
        <Image
          src="/hero-bg.svg"
          alt="work icons"
          height={650}
          width={650}
          draggable={false}
          className="select-none"
        />
      </motion.div>
    </motion.div>
  );
};
