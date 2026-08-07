"use client";

import { useInView } from "react-intersection-observer";

type LazyBackgroundVideoProps = {
  src: string;
  className?: string;
};

/**
 * Decorative autoplaying background video that is not fetched until it is
 * near the viewport.
 *
 * `preload="none"` alone does not defer an autoplaying video: `autoplay`
 * takes precedence, so the browser downloads it regardless. Withholding the
 * `src` until the element scrolls into range is what actually defers it.
 */
export const LazyBackgroundVideo = ({
  src,
  className,
}: LazyBackgroundVideoProps) => {
  const { ref, inView } = useInView({
    triggerOnce: true,
    rootMargin: "300px",
  });

  return (
    <video
      ref={ref}
      src={inView ? src : undefined}
      className={className}
      autoPlay
      loop
      muted
      playsInline
      preload="none"
    />
  );
};
