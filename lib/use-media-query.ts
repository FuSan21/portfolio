"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * Subscribes to a media query without breaking SSR.
 *
 * `serverFallback` is what the server renders; React re-renders with the real
 * match after hydration, so reading `window` here never causes a mismatch.
 */
export function useMediaQuery(query: string, serverFallback: boolean): boolean {
  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      const mediaQuery = window.matchMedia(query);
      mediaQuery.addEventListener("change", onStoreChange);
      return () => mediaQuery.removeEventListener("change", onStoreChange);
    },
    [query]
  );

  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => serverFallback
  );
}
