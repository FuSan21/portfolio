import { FaFacebook, FaMailBulk } from "react-icons/fa";
import {
  RxDiscordLogo,
  RxGithubLogo,
  RxLinkedinLogo,
} from "react-icons/rx";
import { BsTwitterX } from "react-icons/bs";
import { TbFileCv } from "react-icons/tb";

export const SKILL_DATA = [
  {
    skill_name: "Python",
    image: "python.png",
    width: 80,
    height: 80,
  },
  {
    skill_name: "Java",
    image: "java.png",
    width: 80,
    height: 80,
  },
  {
    skill_name: "Kotlin",
    image: "kotlin.png",
    width: 80,
    height: 80,
  },
  {
    skill_name: "PHP",
    image: "php.png",
    width: 90,
    height: 90,
  },
  {
    skill_name: "C++",
    image: "cpp.png",
    width: 80,
    height: 80,
  },
  {
    skill_name: "JavaScript",
    image: "js.png",
    width: 65,
    height: 65,
  },
  {
    skill_name: "TypeScript",
    image: "ts.png",
    width: 65,
    height: 65,
  },
  {
    skill_name: "Node.js",
    image: "node.png",
    width: 80,
    height: 80,
  },
  {
    skill_name: "Express.js",
    image: "express.png",
    width: 80,
    height: 80,
  },
] as const;

export const SOCIALS = [
  {
    name: "Discord",
    icon: RxDiscordLogo,
    link: "https://discordapp.com/users/867995866219286618",
  },
  {
    name: "Facebook",
    icon: FaFacebook,
    link: "https://www.facebook.com/fuad.hasan21",
  },
  {
    name: "Twitter",
    icon: BsTwitterX,
    link: "https://x.com/FuSan2102",
  },
] as const;

export const FRONTEND_SKILL = [
  {
    skill_name: "HTML",
    image: "html.png",
    width: 80,
    height: 80,
  },
  {
    skill_name: "CSS",
    image: "css.png",
    width: 80,
    height: 80,
  },
  {
    skill_name: "Tailwind CSS",
    image: "tailwind.png",
    width: 80,
    height: 80,
  },
  {
    skill_name: "Material UI",
    image: "mui.png",
    width: 80,
    height: 80,
  },
  {
    skill_name: "React",
    image: "react.png",
    width: 80,
    height: 80,
  },
  {
    skill_name: "Three.js",
    image: "three.svg",
    width: 80,
    height: 80,
  },
  {
    skill_name: "Framer Motion",
    image: "framer.png",
    width: 80,
    height: 80,
  },
] as const;

export const BACKEND_SKILL = [
  {
    skill_name: "MySQL",
    image: "mysql.png",
    width: 70,
    height: 70,
  },
  {
    skill_name: "MongoDB",
    image: "mongodb.png",
    width: 40,
    height: 40,
  },
  {
    skill_name: "Firebase",
    image: "firebase.png",
    width: 55,
    height: 55,
  },
  {
    skill_name: "Cloudflare",
    image: "cloudflare.png",
    width: 70,
    height: 70,
  },
  {
    skill_name: "AWS",
    image: "aws.svg",
    width: 70,
    height: 70,
  },
  {
    skill_name: "Git",
    image: "git.png",
    width: 80,
    height: 80,
  },
  {
    skill_name: "Linux",
    image: "linux.png",
    width: 80,
    height: 80,
  },
] as const;

export const FULLSTACK_SKILL = [
  {
    skill_name: "Laravel",
    image: "laravel.svg",
    width: 70,
    height: 70,
  },
  {
    skill_name: "Next.js",
    image: "next.png",
    width: 70,
    height: 70,
  },
  {
    skill_name: "FastAPI",
    image: "fastapi.svg",
    width: 50,
    height: 50,
  },
  {
    skill_name: "Django",
    image: "django.png",
    width: 50,
    height: 50,
  },
] as const;

export const OTHER_SKILL = [
  {
    skill_name: "Docker",
    image: "docker.png",
    width: 60,
    height: 60,
  },
  {
    skill_name: "Github Actions",
    image: "github-actions.svg",
    width: 60,
    height: 60,
  },
] as const;

export const PROJECTS = [
  {
    title: "Clinique Accounts Management Web App",
    description:
      'A comprehensive web application designed to streamline and automate the financial and operational processes of a Nursing Home.',
    image: "/projects/clinique.webp",
    demo: "https://example.com",
    source: "https://example.com",
  },
  {
    title: "Vehicle Accessories Inventory Shop",
    description:
      'A complete Store Website where admin can manage products, orders, and users. Users can buy products and track their orders. Has filtering, searching, and sorting.',
    image: "/projects/vehicleparts.webp",
    demo: "https://example.com",
    source: "https://example.com",
  },
  {
    title: "Pocket Karaoke",
    description:
      'PocketKaraoke is a Kotlin karaoke app for Android written in MVP architecture. You can sing along popular songs and get scored based on your singing.',
    image: "/projects/pocketkaraoke.webp",
    demo: "https://example.com",
    source: "https://example.com",
  },
  {
    title: "Furnicraft BD",
    description:
      'A static company portfolio website hosted via cloudflare page. It\'s a responsive website with a clean UI.',
    image: "/projects/furni.webp",
    demo: "https://example.com",
    source: "https://example.com",
  },
  {
    title: "Federated Metaverse Dynamic Authentication",
    description:
      'A Custom made Dynamic authentication Scheme for the Federated Metaverse to authenticate users across different metaverse servers.',
    image: "/projects/Federated-Metaverse.webp",
    demo: "https://example.com",
    source: "https://example.com",
  },
  {
    title: "Friend Activity Grid Theme for Discord",
    description:
      'A theme for Discord that makes the friend activity grid visible on width of 1200px and below. It shows the friend activity below friend list in a gridbox.',
    image: "/projects/discord-friend-activity-grid.webp",
    demo: "https://example.com",
    source: "https://example.com",
  },
] as const;

export const NAV_LINKS = [
  {
    title: "About me",
    link: "#about-me",
  },
  {
    title: "Skills",
    link: "#skills",
  },
  {
    title: "Projects",
    link: "#projects",
  },
  {
    title: "Contact",
    link: "#contact-us",
  },
] as const;

export const PROFESSIONAL_PROFILES = [
  {
    profile_name: "CV",
    icon: TbFileCv,
    link: "./CV/MdFuadHasan.pdf",
  },
  {
    profile_name: "Email",
    icon: FaMailBulk,
    link: "mailto:fuad.antor@gmail.com",
  },
  {
    profile_name: "LinkedIn",
    icon: RxLinkedinLogo,
    link: "https://www.linkedin.com/in/fusan",
  },
  {
    profile_name: "Github",
    icon: RxGithubLogo,
    link: "https://github.com/FuSan21"
  },
] as const;

export const USED_TECH = [
  {
    skill_name: "Next.js",
    image: "next.png",
    width: 70,
    height: 70,
  },
  {
    skill_name: "React",
    image: "react.png",
    width: 70,
    height: 70,
  },
  {
    skill_name: "TypeScript",
    image: "ts.png",
    width: 70,
    height: 70,
  },
  {
    skill_name: "Tailwind CSS",
    image: "tailwind.png",
    width: 70,
    height: 70,
  },
  {
    skill_name: "Three.js",
    image: "three.svg",
    width: 70,
    height: 70,
  },
  {
    skill_name: "Framer Motion",
    image: "framer.png",
    width: 70,
    height: 70,
  },
] as const;