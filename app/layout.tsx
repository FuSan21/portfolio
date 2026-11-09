import type { Metadata, Viewport } from "next";
import type { PropsWithChildren } from "react";

import { fontVariables } from "@/app/fonts";
import { Footer } from "@/components/main/footer";
import { Navbar } from "@/components/main/navbar";
import { MotionProvider } from "@/components/sub/motion-provider";
import { siteConfig } from "@/config";
import { cn } from "@/lib/utils";

import "./globals.css";

export const viewport: Viewport = {
  themeColor: "#0F1226",
};

export const metadata: Metadata = siteConfig;

export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={cn(fontVariables, "antialiased")}
    >
      <body className="overflow-y-scroll overflow-x-hidden">
        <MotionProvider>
          <Navbar />
          {children}
          <Footer />
        </MotionProvider>
      </body>
    </html>
  );
}
