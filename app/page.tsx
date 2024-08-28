import { Encryption } from "@/components/main/encryption";
import { Hero } from "@/components/main/hero";
import { Projects } from "@/components/main/projects";
import { Skills } from "@/components/main/skills";
import { Experience } from "@/components/main/experience";
import { Contact } from "@/components/main/contact-us";
import { Toaster } from "sonner";

export default function Home() {
  return (
    <main className="h-full w-full">
      <Toaster />
      <div className="flex flex-col gap-20">
        <Hero />
        <Skills />
        <Encryption />
        <Experience />
        <Projects />
        <Contact />
      </div>
    </main>
  );
}
