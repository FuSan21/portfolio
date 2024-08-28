import Image from "next/image";
import Link from "next/link";

import { NAV_LINKS, SOCIALS } from "@/constants";

export const Navbar = () => {
  return (
    <div className="w-full h-[65px] fixed top-0 shadow-lg shadow-[#2A0E61]/50 bg-[#03001427] backdrop-blur-md z-50 px-0 md:px-10">
      <div className="w-full h-full flex flex-wrap md:flex-nowrap items-center justify-between m-auto px-[10px] order-1">
        <Link
          href="#about-me"
          className="h-auto w-auto flex flex-row items-center"
        >
          <Image
            src="/logo.png"
            alt="Logo"
            width={70}
            height={70}
            draggable={false}
            className="cursor-pointer hover:animate-slowspin"
          />
          <div className="font-bold ml-[10px] text-gray-300">Fuad Hasan</div>
        </Link>

        <div className="w-[500px] h-full flex flex-row items-center justify-between order-3 basis-full md:order-2 md:basis-auto">
          <div className="flex items-center justify-between w-full h-auto border-[rgba(112,66,248,0.38)] bg-[rgba(3,0,20,0.37)] mr-[15px] px-[20px] py-[10px] rounded-full text-gray-200 text-sm md:text-base">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.title}
                href={link.link}
                className="cursor-pointer hover:text-[rgb(112,66,248)] transition"
              >
                {link.title}
              </Link>
            ))}
          </div>
        </div>

        <div className="flex flex-row gap-5 order-2 md:order-3">
          {SOCIALS.map(({ link, name, icon: Icon }) => (
            <Link
              href={link}
              target="_blank"
              rel="noreferrer noopener"
              key={name}
            >
              <Icon className="h-6 w-6 text-white" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};
