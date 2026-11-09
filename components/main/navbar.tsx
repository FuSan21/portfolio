import Link from "next/link";

import { NAV_LINKS, SOCIALS } from "@/constants";

export const Navbar = () => {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b bg-carbon/80 backdrop-blur-md">
      <nav className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-6 px-6 md:px-10">
        <Link href="#about-me" className="font-display text-xl text-form">
          Fuad Hasan
        </Link>

        <ul className="hidden items-center gap-7 md:flex">
          {NAV_LINKS.map((link) => (
            <li key={link.title}>
              <Link
                href={link.link}
                className="mono-label text-form/65 transition-colors hover:text-form"
              >
                {link.title}
              </Link>
            </li>
          ))}
        </ul>

        <ul className="flex items-center gap-4">
          {SOCIALS.map(({ link, name, icon: Icon }) => (
            <li key={name}>
              <Link
                href={link}
                target="_blank"
                rel="noreferrer noopener"
                aria-label={name}
                className="text-form/65 transition-colors hover:text-form"
              >
                <Icon className="h-5 w-5" />
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
};
