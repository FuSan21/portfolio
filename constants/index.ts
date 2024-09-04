import { FaFacebook, FaMailBulk } from "react-icons/fa";
import { RxDiscordLogo, RxGithubLogo, RxLinkedinLogo } from "react-icons/rx";
import { BsTwitterX } from "react-icons/bs";
import { TbFileCv } from "react-icons/tb";

export const SERVICES = [
  {
    title: "Web Developer",
    icon: "web.png",
  },
  {
    title: "Backend Developer",
    icon: "backend.png",
  },
  {
    title: "Frontend Developer",
    icon: "frontend.png",
  },
  {
    title: "Android Developer Kotlin",
    icon: "mobile.png",
  },
] as const;

export const EXPERIENCES = [
  {
    title: "Self-Employed",
    company_name: "Wordpress Content Creator/Developer",
    icon: "tekinouchi.png",
    iconBg: "#E6DEDD",
    date: "Feb 2019 - Jul 2023",
    points: [
      "Delivered high-quality, insightful, informative, and entertaining written content.",
      "Set up the hosting environment in **AWS EC2, Lightsail** and custom **cpanel hostings**.",
      "Implemented automated scraping using **Selenium** python library and published content using **wordpress REST API.**",
    ],
  },
  {
    title: "Frontend Web Developer",
    company_name: "Fiver",
    icon: "fiver.png",
    iconBg: "#383E56",
    date: "Feb 2023 - Jul 2023",
    points: [
      "Specialized in crafting custom WordPress dashboards to match client requirements using **ACF, UiPress**.",
      "Worked on designing tailored widgets in a custom dashboard using **HTML, CSS, JS and Wordpress Hooks**.",
      "Skilled in optimizing dashboard usability and efficiency.",
      "Troubleshot and **fixed bugs** and issues in the backend.",
    ],
  },
  {
    title: "Full Stack Web Developer",
    company_name: "Tekinouchi",
    icon: "tekinouchi.png",
    iconBg: "#E6DEDD",
    date: "May 2023 - Present",
    points: [
      "Maintained strong skill set in various technologies to update, optimize and rectify issues with corporate website.",
      "Maintained  version control systems such as **Git** in order to keep track of changes made to the source code.",
      "Provided technical support and troubleshooting services when needed.",
      "Designed creative user interfaces for websites with a focus on usability",
      "Developed, tested and debugged web applications using **HTML5, CSS3, JS and Laravel**",
      "Modified existing WordPress plugin or theme to add functionality.",
      "Configured databases such as **MySQL** in order to store data securely",
      "Integrated **third-party APIs** into web applications for enhanced functionality",
    ],
  },
] as const;

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
      "A comprehensive web application designed to streamline and automate the financial and operational processes of a Nursing Home.",
    image: "/projects/clinique.webp",
    demo: "https://github.com/FuSan21/clinique-account-management",
    source: "",
  },
  {
    title: "Kahoot Portal",
    description:
      "This project is a multiplayer quiz app. Quiz host can create quizzes and players can join the quiz using a link. It handles players in realtime and show answer accuracy and final score after question timer and quiz completion respectively.",
    image: "/projects/kahoot-portal.webp",
    demo: "https://demo2.fusan.live",
    source: "https://github.com/FuSan21/kahoot-portal",
  },
  {
    title: "Vehicle Accessories Inventory Shop",
    description:
      "A complete Store Website where admin can manage products, orders, and users. Users can buy products and track their orders. Has filtering, searching, and sorting.",
    image: "/projects/vehicleparts.webp",
    demo: "https://demo1.fusan.live",
    source: "https://github.com/FuSan21/store-Management-Website",
  },
  {
    title: "3d Space Portfolio",
    description:
      "This project is an enhanced version of the sanidhyy/space-portfolio, incorporating advanced features and improved responsiveness for smaller screens. It utilizes Three.js for sophisticated 3D rendering and Framer Motion for dynamic animations.",
    image: "/projects/portfolio.webp",
    demo: "https://www.fusan.live",
    source: "https://github.com/FuSan21/portfolio]",
  },
  {
    title: "Pocket Karaoke",
    description:
      "PocketKaraoke is a Kotlin karaoke app for Android written in MVP architecture. You can sing along popular songs and get scored based on your singing.",
    image: "/projects/pocketkaraoke.webp",
    demo: "",
    source: "https://github.com/FuSan21/PocketKaraoke",
  },
  {
    title: "Furnicraft BD",
    description:
      "A static company portfolio website hosted via cloudflare page. It's a responsive website with a clean UI.",
    image: "/projects/furni.webp",
    demo: "https://www.furnicraftbd.com",
    source: "",
  },
  {
    title: "Federated Metaverse Dynamic Authentication",
    description:
      "A Custom made Dynamic authentication Scheme for the Federated Metaverse to authenticate users across different metaverse servers.",
    image: "/projects/Federated-Metaverse.webp",
    demo: "https://github.com/FuSan21/federated-metaverse-authentication-mSAML-PKA",
    source:
      "https://github.com/FuSan21/federated-metaverse-authentication-mSAML-PKA",
  },
  {
    title: "Friend Activity Grid Theme for Discord",
    description:
      "A theme for Discord that makes the friend activity grid visible on width of 1200px and below. It shows the friend activity below friend list in a gridbox.",
    image: "/projects/discord-friend-activity-grid.webp",
    demo: "https://github.com/FuSan21/FriendActivityGrid/",
    source: "https://github.com/FuSan21/FriendActivityGrid/",
  },
] as const;

export const NAV_LINKS = [
  {
    title: "About",
    link: "#about-me",
  },
  {
    title: "Skills",
    link: "#skills",
  },
  {
    title: "Experiences",
    link: "#experiences",
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
    link: "https://github.com/FuSan21",
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
