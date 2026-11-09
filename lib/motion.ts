import type { Variants } from "framer-motion";

/** Short upward fade for content entering the viewport. */
export const rise = (delay = 0): Variants => ({
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "tween", ease: "easeOut", duration: 0.5, delay },
  },
});
