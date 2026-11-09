import { Hero } from "@/components/main/hero";
import { Projects } from "@/components/main/projects";
import { Skills } from "@/components/main/skills";
import { Experience } from "@/components/main/experience";
import { Contact } from "@/components/main/contact-us";
import { Toaster } from "sonner";
import { cacheLife } from "next/cache";

export default async function Home() {
  "use cache";
  // Explicit lifetime: without a cacheLife call the implicit `default` profile
  // would revalidate this page every 15 minutes. Nothing here changes between
  // builds, so use the longest profile available.
  cacheLife("max");

  return (
    <main className="w-full">
      <Toaster theme="dark" />
      <Hero />
      <Experience />
      <Projects />
      <Skills />
      <Contact />
    </main>
  );
}
