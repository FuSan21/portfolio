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
    skill_name: "JavaScript",
    image: "js.png",
    width: 65,
    height: 65,
  },
  {
    skill_name: "Tailwind CSS",
    image: "tailwind.png",
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
    skill_name: "Redux",
    image: "redux.png",
    width: 80,
    height: 80,
  },
  {
    skill_name: "React Query",
    image: "reactquery.png",
    width: 80,
    height: 80,
  },
  {
    skill_name: "TypeScript",
    image: "ts.png",
    width: 80,
    height: 80,
  },
  {
    skill_name: "Next.js 14",
    image: "next.png",
    width: 80,
    height: 80,
  },
  {
    skill_name: "Framer Motion",
    image: "framer.png",
    width: 80,
    height: 80,
  },
  {
    skill_name: "Stripe",
    image: "stripe.png",
    width: 80,
    height: 80,
  },
  {
    skill_name: "Node.js",
    image: "node.png",
    width: 80,
    height: 80,
  },
  {
    skill_name: "MongoDB",
    image: "mongodb.png",
    width: 40,
    height: 40,
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
    skill_name: "JavaScript",
    image: "js.png",
    width: 65,
    height: 65,
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
    skill_name: "Redux",
    image: "redux.png",
    width: 80,
    height: 80,
  },
  {
    skill_name: "React Query",
    image: "reactquery.png",
    width: 80,
    height: 80,
  },
  {
    skill_name: "TypeScript",
    image: "ts.png",
    width: 80,
    height: 80,
  },
  {
    skill_name: "Next.js 14",
    image: "next.png",
    width: 80,
    height: 80,
  },
] as const;

export const BACKEND_SKILL = [
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
    skill_name: "PostgreSQL",
    image: "postgresql.png",
    width: 70,
    height: 70,
  },
  {
    skill_name: "MySQL",
    image: "mysql.png",
    width: 70,
    height: 70,
  },
  {
    skill_name: "Prisma",
    image: "prisma.png",
    width: 70,
    height: 70,
  },
  {
    skill_name: "Graphql",
    image: "graphql.png",
    width: 80,
    height: 80,
  },
] as const;

export const FULLSTACK_SKILL = [
  {
    skill_name: "React Native",
    image: "reactnative.png",
    width: 70,
    height: 70,
  },
  {
    skill_name: "Tauri",
    image: "tauri.png",
    width: 70,
    height: 70,
  },
  {
    skill_name: "Docker",
    image: "docker.png",
    width: 70,
    height: 70,
  },

  {
    skill_name: "Figma",
    image: "figma.png",
    width: 50,
    height: 50,
  },
] as const;

export const OTHER_SKILL = [
  {
    skill_name: "Go",
    image: "go.png",
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

export const FOOTER_DATA = [
  {
    title: "Community",
    data: [
      {
        name: "GitHub",
        icon: RxGithubLogo,
        link: "https://github.com/FuSan21",
      },
      {
        name: "Discord",
        icon: RxDiscordLogo,
        link: "https://discordapp.com/users/867995866219286618",
      },
    ],
  },
  {
    title: "Social Media",
    data: [
      {
        name: "Twitter",
        icon: BsTwitterX,
        link: "https://x.com/FuSan2102",
      },
      {
        name: "Linkedin",
        icon: RxLinkedinLogo,
        link: "https://www.linkedin.com/in/fusan",
      },
    ],
  },
  {
    title: "About",
    data: [
      {
        name: "Learning about me",
        icon: null,
        link: "https://www.fusan.live",
      },
      {
        name: "Contact Me",
        icon: null,
        link: "mailto:fuad.antor@gmail.com",
      },
    ],
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