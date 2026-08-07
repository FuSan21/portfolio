"use client";

import dynamic from "next/dynamic";

// The star field is decorative and pulls in three.js + r3f, so it is loaded
// after hydration rather than shipped in the initial bundle. The positioned
// wrapper stays here so the layout is identical before the scene arrives.
const StarScene = dynamic(
  () => import("@/components/sub/star-scene").then((mod) => mod.StarScene),
  { ssr: false }
);

export const StarsCanvas = () => (
  <div className="w-full h-auto fixed inset-0 -z-10">
    <StarScene />
  </div>
);
