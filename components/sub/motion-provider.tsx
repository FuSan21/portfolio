"use client";

import { MotionConfig } from "framer-motion";
import type { PropsWithChildren } from "react";

// Lets framer-motion drop transform animations for visitors who ask for
// reduced motion, so individual components don't each have to check.
export const MotionProvider = ({ children }: PropsWithChildren) => (
  <MotionConfig reducedMotion="user">{children}</MotionConfig>
);
