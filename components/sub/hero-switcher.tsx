"use client";

import { useEffect, useId, useRef, useState } from "react";

import {
  setHeroVariant,
  shuffleHeroVariant,
  useHeroVariant,
} from "@/lib/hero-store";
import { HERO_VARIANTS } from "@/lib/hero-variants";
import { cn } from "@/lib/utils";

const pad = (n: number) => String(n).padStart(2, "0");

// Switching swaps the hero at the top of the page, so take the visitor there.
const scrollToHero = () => {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
};

/** Header control listing every hero; a disclosure, not an ARIA menu. */
export const HeroSwitcher = () => {
  const current = useHeroVariant();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listId = useId();
  const index = HERO_VARIANTS.findIndex((variant) => variant.id === current);

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpen(false);
      triggerRef.current?.focus();
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const choose = (apply: () => void) => {
    apply();
    setOpen(false);
    scrollToHero();
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((value) => !value)}
        className="mono-label flex items-center gap-2 border border-form/20 px-2.5 py-1.5 text-form/80 transition-colors hover:border-form/50 hover:text-form"
      >
        <span className="text-copy">Hero</span>
        {index >= 0 && (
          <>
            <span className="hidden sm:inline">
              {HERO_VARIANTS[index].label}
            </span>
            <span className="text-form/40">
              {pad(index + 1)}/{pad(HERO_VARIANTS.length)}
            </span>
          </>
        )}
        <svg
          aria-hidden
          viewBox="0 0 10 6"
          className={cn("h-1.5 w-2.5 transition-transform", open && "rotate-180")}
        >
          <path d="M1 1l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      </button>

      {open && (
        <div
          id={listId}
          className="absolute right-0 top-full mt-2 w-60 border border-form/15 bg-ledger shadow-2xl shadow-black/40"
        >
          <ul className="py-1">
            {HERO_VARIANTS.map((variant, i) => {
              const active = variant.id === current;
              return (
                <li key={variant.id}>
                  <button
                    type="button"
                    aria-current={active || undefined}
                    onClick={() => choose(() => setHeroVariant(variant.id))}
                    className={cn(
                      "mono-label flex w-full items-center justify-between gap-4 px-3 py-2 text-left transition-colors hover:bg-carbon/60 hover:text-form",
                      active ? "text-form" : "text-form/60"
                    )}
                  >
                    <span>
                      <span
                        aria-hidden
                        className={cn("mr-2 text-copy", !active && "invisible")}
                      >
                        ▸
                      </span>
                      {variant.label}
                    </span>
                    <span className="text-form/30">{pad(i + 1)}</span>
                  </button>
                </li>
              );
            })}
          </ul>
          <button
            type="button"
            onClick={() => choose(shuffleHeroVariant)}
            className="mono-label w-full border-t border-form/10 px-3 py-2 text-left text-copy transition-colors hover:bg-carbon/60"
          >
            Shuffle ↻
          </button>
        </div>
      )}
    </div>
  );
};
