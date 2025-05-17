"use client";

import Tilt from "react-parallax-tilt";
import { motion } from "framer-motion";
import Image from "next/image";

import { HeroContent } from "@/components/sub/hero-content";
import { SERVICES } from "@/constants";
import { fadeIn, staggerContainer } from "@/lib/motion";

type ServiceCardProps = {
  index: number;
  title: string;
  icon: string;
};

// Service Card
const ServiceCard = ({ index, title, icon }: ServiceCardProps) => {
  return (
    <Tilt
      tiltMaxAngleX={45}
      tiltMaxAngleY={45}
      scale={1}
      transitionSpeed={450}
      className="md:w-[250px] w-full"
    >
      <motion.div
        variants={fadeIn("right", "spring", 0.5 * index, 0.75)}
        className="w-full bg-linear-to-r from-[#00cea8] from-[1.9%] to-[#bf61ff] to-[97.5%] p-px rounded-[20px] shadow-card"
      >
        <div className="bg-[#151030] rounded-[20px] py-5 px-12 min-h-[280px] flex justify-evenly items-center flex-col select-none">
          <Image
            src={`/services/${icon}`}
            alt={title}
            width={64}
            height={64}
            className="w-16 h-16 object-contain"
            draggable={false}
          />
          <h2 className="text-white text-[20px] font-bold text-center">
            {title}
          </h2>
        </div>
      </motion.div>
    </Tilt>
  );
};

export const Hero = () => {
  return (
    <section className="relative flex flex-col h-full w-full">
      <div className="relative flex flex-col h-full w-full">
        <video
          autoPlay
          muted
          loop
          className="rotate-180 absolute top-[-340px] left-0 w-full h-full object-cover -z-20 opacity-[0.7]"
        >
          <source src="/videos/blackhole.webm" type="video/webm" />
        </video>

        <HeroContent />
      </div>
      <motion.div
        className="mt-20 flex flex-row flex-wrap gap-10 justify-center items-center"
        variants={staggerContainer()}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.25 }}
      >
        {SERVICES.map((service, i) => (
          <ServiceCard key={service.title} index={i} {...service} />
        ))}
      </motion.div>
    </section>
  );
};
