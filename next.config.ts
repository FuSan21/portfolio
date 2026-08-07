import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Stable top-level flag in Next 16 (not experimental). Enables the "use cache"
  // directive and makes Partial Prerendering the default rendering model.
  cacheComponents: true,

  reactCompiler: true,

  experimental: {
    // Large barrel exports that Next does not optimize by default.
    // react-icons and @heroicons/react are already on the built-in list.
    optimizePackageImports: ["@react-three/drei", "framer-motion"],

    // Runs React Compiler natively inside Turbopack instead of round-tripping
    // through Babel.
    turbopackRustReactCompiler: true,
  },
};

export default nextConfig;
