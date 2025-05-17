import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

import type { JSX } from "react";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function parseStringWithBold(text: string): (string | JSX.Element)[] {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong
          key={index}
          className="bg-linear-to-r from-[#00cea8] from-[1.9%] to-[#bf61ff] to-[97.5%] text-transparent bg-clip-text"
        >
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
}
