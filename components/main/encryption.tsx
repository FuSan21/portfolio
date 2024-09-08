"use client";

import { motion } from "framer-motion";
import Image from "next/image";

import { fadeIn, staggerContainer } from "@/lib/motion";

export const Encryption = () => {
  return (
    <motion.section
      className="flex flex-row relative items-center justify-center min-h-screen w-full h-full -z-20"
      variants={staggerContainer()}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.25 }}
    >
      <div className="absolute w-auto h-auto top-0 z-[5]">
        <motion.div
          variants={fadeIn("up", "spring", 0.5, 1.25)}
          className="text-[40px] font-medium text-center text-gray-200"
        >
          Performance{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-cyan-500">
            &
          </span>{" "}
          security.
        </motion.div>
      </div>

      <motion.div
        variants={fadeIn("up", "spring", 1, 1.25)}
        className="flex flex-col items-center justify-center translate-y-[-50px] absolute z-[20] w-auto h-auto"
      >
        <div className="flex flex-col items-center group cursor-pointer w-auto h-auto">
          <Image
            src="/lock-top.png"
            alt="Lock top"
            width={50}
            height={50}
            className="translate-y-5 transition-all duration-200 group-hover:translate-y-11 w-[50px] h-[50px]"
          />
          <Image
            src="/lock-main.png"
            alt="Lock main"
            width={70}
            height={70}
            className="z-10 w-[70px] h-[70px]"
          />
        </div>

        <div className="Welcome-box px-[15px] py-[4px] z-[20] border my-[20px] border-[#7042F88B] opacity-[0.9]">
          <h1 className="Welcome-text text-[12px]">Encryption</h1>
        </div>
      </motion.div>

      <div className="absolute z-[20] bottom-[10px] px-[5px]">
        <div className="cursive text-[20px] font-medium text-center text-gray-300">
          Secure your data with end-to-end encryption.
        </div>
      </div>

      <div className="w-full flex items-start justify-center absolute">
        <video
          loop
          muted
          autoPlay
          playsInline
          preload="false"
          className="w-full h-full md:h-auto object-cover md:object-fill min-w-full min-h-screen"
        >
          <source src="/videos/encryption-bg.webm" type="video/webm" />
        </video>
      </div>
    </motion.section>
  );
};
