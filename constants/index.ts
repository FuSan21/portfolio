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

export const EXPERIENCES = {
  education: [
    {
      title: "B.Sc. in Computer Science and Engineering",
      name: "Brac University",
      icon: "bracu.webp",
      iconBg: "#E6DEDD",
      date: "Jan 2020 - Jan 2024",
      points: [
        "CGPA: **3.82**",
        "Thesis: **Dynamic Authentication Protocols for Advanced Security in Federated Metaverse Systems**",
      ],
    },
  ],
  job: [
    {
      title: "Associate Software Engineer",
      name: "All Generation Tech",
      icon: "agt.png",
      iconBg: "#E6DEDD",
      date: "March 2024 - Present",
      points: [
        "Developing and maintaining applications using **Unqork Low Code/No Code platform** to deliver business solutions efficiently.",
        "Collaborating with cross-functional teams to design, implement, and optimize workflows and user interfaces.",
        "Customizing and configuring **Unqork components** to meet specific client requirements.",
        "Troubleshooting and resolving issues in applications built on the **Unqork platform**.",
        "Ensuring the performance, security, and scalability of applications in a fast-paced development environment.",
      ],
    },
    {
      title: "Full Stack Web Developer",
      name: "Tekinouchi",
      icon: "tekinouchi.png",
      iconBg: "#E6DEDD",
      date: "Jan 2023 - Present",
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
    {
      title: "Frontend Web Developer",
      name: "Fiver",
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
      title: "Self-Employed",
      name: "Wordpress Content Creator/Developer",
      icon: "tekinouchi.png",
      iconBg: "#E6DEDD",
      date: "Feb 2019 - Jul 2023",
      points: [
        "Delivered high-quality, insightful, informative, and entertaining written content.",
        "Set up the hosting environment in **AWS EC2, Lightsail** and custom **cpanel hostings**.",
        "Implemented automated scraping using **Selenium** python library and published content using **wordpress REST API.**",
      ],
    },
  ],
} as const;

export const BASE_LANGUAGE = [
  {
    skill_name: "Python",
    image: "python.png",
    size: 80,
  },
  {
    skill_name: "Java",
    image: "java.png",
    size: 80,
  },
  {
    skill_name: "Kotlin",
    image: "kotlin.png",
    size: 80,
  },
  {
    skill_name: "PHP",
    image: "php.png",
    size: 90,
  },
  {
    skill_name: "C++",
    image: "cpp.png",
    size: 80,
  },
  {
    skill_name: "JavaScript",
    image: "js.png",
    size: 65,
  },
  {
    skill_name: "TypeScript",
    image: "ts.png",
    size: 65,
  },
  {
    skill_name: "SQL",
    image: "sql.png",
    size: 90,
  },
  {
    skill_name: "Bash",
    image: "bash.png",
    size: 90,
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
    size: 80,
  },
  {
    skill_name: "CSS",
    image: "css.png",
    size: 80,
  },
  {
    skill_name: "Tailwind CSS",
    image: "tailwind.png",
    size: 80,
  },
  {
    skill_name: "Material UI",
    image: "mui.png",
    size: 80,
  },
  {
    skill_name: "Flowbite",
    image: "flowbite.png",
    size: 80,
  },
  {
    skill_name: "Three.js",
    image: "three.svg",
    size: 80,
  },
  {
    skill_name: "Framer Motion",
    image: "framer.png",
    size: 80,
  },
] as const;

export const DATABASE = [
  {
    skill_name: "MySQL",
    image: "mysql.png",
    size: 70,
  },
  {
    skill_name: "MongoDB",
    image: "mongodb.png",
    size: 40,
  },
  {
    skill_name: "PostgreSQL",
    image: "postgresql.png",
    size: 55,
  },
  {
    skill_name: "Firebase",
    image: "firebase.png",
    size: 55,
  },
] as const;

export const CLOUD_SERVICES = [
  {
    skill_name: "Cloudflare",
    image: "cloudflare.png",
    size: 70,
  },
  {
    skill_name: "AWS",
    image: "aws.svg",
    size: 70,
  },
  {
    skill_name: "Vercel",
    image: "vercel.png",
    size: 60,
  },
  {
    skill_name: "Supabase",
    image: "supabase.png",
    size: 60,
  },
  {
    skill_name: "Git",
    image: "git.png",
    size: 80,
  },
  {
    skill_name: "Linux",
    image: "linux.png",
    size: 80,
  },
] as const;

export const FULLSTACK_SKILL = [
  {
    skill_name: "Laravel",
    image: "laravel.svg",
    size: 70,
  },
  {
    skill_name: "Next.js",
    image: "next.png",
    size: 70,
  },
  {
    skill_name: "FastAPI",
    image: "fastapi.svg",
    size: 50,
  },
  {
    skill_name: "Django",
    image: "django.png",
    size: 50,
  },
  {
    skill_name: "Node.js",
    image: "node.png",
    size: 80,
  },
  {
    skill_name: "Express.js",
    image: "express.png",
    size: 80,
  },
  {
    skill_name: "React",
    image: "react.png",
    size: 80,
  },
] as const;

export const OTHER_SKILL = [
  {
    skill_name: "Docker",
    image: "docker.png",
    size: 60,
  },
  {
    skill_name: "Github Actions",
    image: "github-actions.svg",
    size: 60,
  },
] as const;

export const PROJECTS = [
  {
    title: "Beyond The Fall",
    description:
      "An interactive storytelling website for a nature-inspired book or experience, featuring an immersive UI with 3D elements. The site uses Wordpress as admin panel and REST api as backend. It offers a book showcase, timeline of events, journey selection interface, community engagement section, and integrated e-commerce functionality to purchase related merchandise.",
    image: "/projects/beyond-the-fall.png",
    demo: "https://beyond-the-fall.fusan.me",
    tech: [
      {
        name: "Next.js",
        icon: "next.png",
      },
      {
        name: "React",
        icon: "react.png",
      },
      {
        name: "TypeScript",
        icon: "ts.png",
      },
      {
        name: "Tailwind CSS",
        icon: "tailwind.png",
      },
      {
        name: "Framer Motion",
        icon: "framer.png",
      },
      {
        name: "Three.js",
        icon: "three.svg",
      },
      {
        name: "WordPress API",
        icon: "wordpress.png",
      },
      {
        name: "HTML",
        icon: "html.png",
      },
      {
        name: "CSS",
        icon: "css.png",
      },
    ],
  },
  {
    title: "Clinique Accounts Management Web App",
    description:
      "A comprehensive web application designed to streamline and automate the financial and operational processes of a Nursing Home.",
    image: "/projects/clinique.webp",
    demo: "https://github.com/FuSan21/clinique-account-management",
    source: "",
    tech: [
      {
        name: "Node.js",
        icon: "node.png",
      },
      {
        name: "Express.js",
        icon: "express.png",
      },
      {
        name: "MySQL",
        icon: "mysql.png",
      },
      {
        name: "JavaScript",
        icon: "js.png",
      },
      {
        name: "HTML",
        icon: "html.png",
      },
      {
        name: "CSS",
        icon: "css.png",
      },
    ],
  },
  {
    title: "Kahoot Portal",
    description:
      "This project is a multiplayer quiz app. Quiz host can create quizzes and players can join the quiz using a link. It handles players in realtime and show answer accuracy and final score after question timer and quiz completion respectively.",
    image: "/projects/kahoot-portal.webp",
    demo: "https://demo2.fusan.me",
    source: "https://github.com/FuSan21/kahoot-portal",
    tech: [
      {
        name: "Next.js",
        icon: "next.png",
      },
      {
        name: "Node.js",
        icon: "node.png",
      },
      {
        name: "React",
        icon: "react.png",
      },
      {
        name: "TypeScript",
        icon: "ts.png",
      },
      {
        name: "Tailwind CSS",
        icon: "tailwind.png",
      },
      {
        name: "PostgreSQL",
        icon: "postgresql.png",
      },
      {
        name: "Supabase",
        icon: "supabase.png",
      },
      {
        name: "HTML",
        icon: "html.png",
      },
      {
        name: "CSS",
        icon: "css.png",
      },
      {
        name: "Vercel",
        icon: "vercel.png",
      },
    ],
  },
  {
    title: "Vehicle Accessories Inventory Shop",
    description:
      "A complete Store Website where admin can manage products, orders, and users. Users can buy products and track their orders. Has filtering, searching, and sorting.",
    image: "/projects/vehicleparts.webp",
    demo: "https://demo1.fusan.me",
    source: "https://github.com/FuSan21/store-Management-Website",
    tech: [
      {
        name: "Laravel",
        icon: "laravel.svg",
      },
      {
        name: "Tailwind CSS",
        icon: "tailwind.png",
      },
      {
        name: "PostgreSQL",
        icon: "postgresql.png",
      },
      {
        name: "JavaScript",
        icon: "js.png",
      },
      {
        name: "HTML",
        icon: "html.png",
      },
      {
        name: "CSS",
        icon: "css.png",
      },
      {
        name: "Vercel",
        icon: "vercel.png",
      },
    ],
  },
  {
    title: "Jira Standup Stats Generator",
    description:
      "Userscript that helps teams conduct more efficient Jira standup meetings by providing an organized view of tickets by assignee. Also include script to communicate with thirdparty website to update the data remotely from jira.",
    image: "/projects/jira-standup-stats-generator.png",
    demo: "https://github.com/FuSan21/jira-standup-stats-generator",
    source: "https://github.com/FuSan21/jira-standup-stats-generator",
    tech: [
      {
        name: "Userscript",
        icon: "userscript.png",
      },
      {
        name: "JavaScript",
        icon: "js.png",
      },
      { name: "HTML", icon: "html.png" },
      { name: "CSS", icon: "css.png" },
      { name: "Jira API", icon: "jira.png" },
    ],
  },
  {
    title: "3d Space Portfolio",
    description:
      "This project is an enhanced version of the sanidhyy/space-portfolio, incorporating advanced features and improved responsiveness for smaller screens. It utilizes Three.js for sophisticated 3D rendering and Framer Motion for dynamic animations.",
    image: "/projects/portfolio.webp",
    demo: "https://www.fusan.me",
    source: "https://github.com/FuSan21/portfolio",
    tech: [
      {
        name: "Next.js",
        icon: "next.png",
      },
      {
        name: "React",
        icon: "react.png",
      },
      {
        name: "Three.js",
        icon: "three.svg",
      },
      {
        name: "Framer Motion",
        icon: "framer.png",
      },
      {
        name: "JavaScript",
        icon: "js.png",
      },
      {
        name: "HTML",
        icon: "html.png",
      },
      {
        name: "CSS",
        icon: "css.png",
      },
      {
        name: "Vercel",
        icon: "vercel.png",
      },
    ],
  },
  {
    title: "Pocket Karaoke",
    description:
      "PocketKaraoke is a Kotlin karaoke app for Android written in MVP architecture. You can sing along popular songs and get scored based on your singing.",
    image: "/projects/pocketkaraoke.webp",
    demo: "",
    source: "https://github.com/FuSan21/PocketKaraoke",
    tech: [
      {
        name: "Kotlin",
        icon: "kotlin.png",
      },
      {
        name: "Firebase",
        icon: "firebase.png",
      },
    ],
  },
  {
    title: "Furnicraft BD",
    description:
      "A static company portfolio website hosted via cloudflare page. It's a responsive website with a clean UI.",
    image: "/projects/furni.webp",
    demo: "https://www.furnicraftbd.com",
    source: "",
    tech: [
      {
        name: "HTML",
        icon: "html.png",
      },
      {
        name: "CSS",
        icon: "css.png",
      },
      {
        name: "JavaScript",
        icon: "js.png",
      },
      {
        name: "Cloudflare",
        icon: "cloudflare.png",
      },
    ],
  },
  {
    title: "Federated Metaverse Dynamic Authentication",
    description:
      "A Custom made Dynamic authentication Scheme for the Federated Metaverse to authenticate users across different metaverse servers.",
    image: "/projects/Federated-Metaverse.webp",
    demo: "https://github.com/FuSan21/federated-metaverse-authentication-mSAML-PKA",
    source:
      "https://github.com/FuSan21/federated-metaverse-authentication-mSAML-PKA",
    tech: [
      {
        name: "FastAPI",
        icon: "fastapi.svg",
      },
      {
        name: "Python",
        icon: "python.png",
      },
    ],
  },
  {
    title: "Friend Activity Grid Theme for Discord",
    description:
      "A theme for Discord that makes the friend activity grid visible on width of 1200px and below. It shows the friend activity below friend list in a gridbox.",
    image: "/projects/discord-friend-activity-grid.webp",
    demo: "https://github.com/FuSan21/FriendActivityGrid/",
    source: "https://github.com/FuSan21/FriendActivityGrid/",
    tech: [
      {
        name: "CSS",
        icon: "css.png",
      },
    ],
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
    name: "Next.js",
    image: "next.png",
    size: 70,
  },
  {
    name: "React",
    image: "react.png",
    size: 70,
  },
  {
    name: "TypeScript",
    image: "ts.png",
    size: 70,
  },
  {
    name: "Tailwind CSS",
    image: "tailwind.png",
    size: 70,
  },
  {
    name: "Three.js",
    image: "three.svg",
    size: 70,
  },
  {
    name: "Framer Motion",
    image: "framer.png",
    size: 70,
  },
] as const;
