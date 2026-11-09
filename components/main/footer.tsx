import { cacheLife } from "next/cache";
import { USED_TECH } from "@/constants";

export const Footer = async () => {
  "use cache";
  // The copyright year is the one non-deterministic value in the server tree.
  // Caching it satisfies Cache Components' prerender check, and a daily
  // lifetime lets the year roll over instead of sticking for a whole month.
  cacheLife("days");

  return (
    <footer className="border-t">
      <div className="mono-label mx-auto flex max-w-6xl flex-col gap-3 px-6 py-8 text-form/55 md:flex-row md:justify-between md:px-10">
        <p>&copy; {new Date().getFullYear()} Fuad Hasan</p>
        <p>Built with {USED_TECH.map((tech) => tech.name).join(" · ")}</p>
      </div>
    </footer>
  );
};
