# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
bun install       # bun.lock is committed
bun run dev       # dev server
bun run build     # production build
bun run start     # serve the production build
bun run lint      # eslint (flat config, next/core-web-vitals)
```

No test framework — `bun run build` plus `bun run lint` are the full verification story. `tsc` is not wired to a script; type errors surface via `next build`.

Gotchas that will cost you time if you change them:

- **The Bun runtime is opt-in and must stay in sync in two places:** the `bun run --bun next ...` scripts in `package.json` and `bunVersion` in `vercel.json`. Change one without the other and Vercel builds on a different runtime than you tested. Pin the minor (`"1.4.x"`) rather than `"1.x"` — 1.4 is an explicit opt-in on Vercel, so `"1.x"` can still resolve to 1.3.
- **History, so this isn't re-litigated:** on Bun 1.3 the runtime built fine locally but *failed on Vercel* with `Failed to load external module next/dist/compiled/next-server/app-page-turbo.runtime.prod.js: TypeError: Expected CommonJS module to have a function wrapper`, then `Failed to collect page data for /_not-found`. Bun 1.4 (the Zig→Rust rewrite, 2026-08-20) fixed it in practice, and Bun's release notes claim `bun --bun next build` works on Next 16.3 with Turbopack and the React Compiler. The root-cause bug ([oven-sh/bun#25370](https://github.com/oven-sh/bun/issues/25370), cached failed module resolution) is still **open**, so if this breaks again that is the first place to look. Note the two Next.js reports ([#86866](https://github.com/vercel/next.js/issues/86866), [#87417](https://github.com/vercel/next.js/issues/87417)) read `CLOSED` but neither was fixed — one was a bot auto-closure for a missing repro, the other was punted upstream to Bun. Local success proves nothing here; verify runtime changes on a branch so Vercel's preview deploy catches the failure instead of `main`.
- `trustedDependencies` in `package.json` must keep both `@tailwindcss/oxide` and `sharp`. Bun blocks lifecycle scripts by default, and declaring the field *replaces* its built-in trusted list instead of extending it — dropping either silently breaks Tailwind's native binary or image optimization.
- ESLint is pinned to 9.x. `eslint-config-next` claims `eslint: >=9.0.0`, but its transitive `eslint-plugin-react` caps at `^9.7` and crashes under 10.

## Architecture

Single-page Next.js App Router site (Next 16.3, React 19, Tailwind v4, TypeScript strict) with Cache Components and React Compiler enabled. One route: `app/page.tsx` stacks all sections in order (Hero → Experience → Projects → Skills → Contact). `app/layout.tsx` wraps them with `Navbar`, `Footer`, and `MotionProvider` (framer-motion `MotionConfig reducedMotion="user"`). Config lives in `next.config.ts`.

**Design direction ("The Normalizer"):** messy paper goes through a pair of rollers and comes out as clean records. The Normalizer hero is a pinned 320vh section whose scroll progress drives both the 3D scene and the headline. Each headline word steps through the Redaction grades (100 → clean) while its sheet is between the rollers. `lib/normalizer-timeline.ts` is the single timeline both sides read, so retime there, not in the components.

**The hero rotates.** `lib/hero-variants.ts` lists seven heroes: the Normalizer plus six programmer-themed scenes (compiler, merge conflict, rules-engine pachinko, event loop, service mesh, garbage collector). `lib/hero-store.ts` picks one at random on the client per visit and the header's `HeroSwitcher` changes it. The pick must stay client-side: the page is `"use cache"`, so a server-side random would freeze one hero for everyone until revalidate. The server renders a scene-less shell (variant `null`). Reduced-motion visitors start on the Normalizer, the only hero with a still frame. `components/main/hero.tsx` dispatches to `components/sub/hero-normalizer.tsx` or `components/sub/hero-scene.tsx`; all share the intro in `components/sub/hero-intro.tsx`. Scenes live in `components/heroes/<id>/scene.tsx`. `pinned` heroes (compiler, merge conflict) take page-scroll progress as a `progress` prop and must not capture the wheel in that mode, or visitors can't scroll past the hero.

**Content lives in `constants/index.ts`, not in components.** That ~770-line file is the single source of truth for every section's data (`EXPERIENCES`, `CERTIFICATIONS`, the skill groups, `PROJECTS`, `NAV_LINKS`, `SOCIALS`, `PROFESSIONAL_PROFILES`, `USED_TECH`). Adding a project or job is a data edit there, not a component change. The first three `PROJECTS` are also the sheets printed in the hero scene. The skills section derives "used with" pairs from `PROJECTS[].tech` names, so keep those names identical to `skill_name`. Most exports end in `as const` and component prop types derive from them (e.g. `experience.tsx` types its row as `(typeof EXPERIENCES)[keyof typeof EXPERIENCES][number]`), so widening a literal type can ripple into components.

**Icon paths are conventions, not full paths.** Constants store bare filenames; the consuming component prefixes the public directory:

- skills / project tech icons → `/skills/${icon}` (`skills.tsx`, `project-card.tsx`)
- `PROJECTS[].image` is the exception — a full path like `/projects/foo.png`
- `EXPERIENCES[].icon` / `iconBg` (`/experiences/`) are currently unused by the ledger layout

Add the asset to the matching `public/` subfolder when adding a constant entry.

**Component split:** `components/main/` holds full page sections (each rendered once from `page.tsx` or `layout.tsx`); `components/sub/` holds the pieces they compose. Import via the `@/*` alias. Sections are server components by default; anything using framer-motion, r3f, hooks, or browser APIs needs `"use client"`. `experience.tsx` stays a server component by using native `<details>` for expand/collapse.

**Animation:** use the variant factories in `lib/motion.ts` (`rise`) rather than inline variants. A variant only animates if the element also sets `initial` plus `animate`/`whileInView`. Keep motion sparse: the hero pass is the one big effect.

**Scroll-linked opacity: use the function form of `useTransform`.** `useTransform(scrollYProgress, [a, b], [0, 1])` on `opacity` gets handed to a native `ViewTimeline` that ignores `useScroll`'s `offset` (it spans the section's whole time in view) and snaps back once that timeline ends. That made the "Normalized" stamp land late and vanish. Write `useTransform(progress, (p) => ...)` instead.

**Rich text:** `parseStringWithBold` in `lib/utils.tsx` turns `**bold**` inside constant strings into a semibold `<strong>` — that's why `EXPERIENCES[].points` contain asterisks. `lib/utils.tsx` is `.tsx` because it returns JSX; `cn()` lives there too.

### Keep heavy assets lazy

`three` / `@react-three/fiber` (plus drei, rapier, postprocessing for the scene heroes) load via `next/dynamic` with `ssr: false` from `hero-normalizer.tsx` and `hero-scene.tsx`, one chunk per hero, so a visit only downloads the hero it shows. The Normalizer scene itself is `components/sub/normalizer-scene.tsx`. Don't pull them into a static import graph. The Normalizer canvas uses `frameloop="demand"` and only re-renders when scroll progress changes; the scene heroes render every frame while mounted. Every hero canvas unmounts once the hero is scrolled well past. All scene textures are drawn at runtime on 2D canvases (`normalizer-textures.ts`), so the scene ships no image or model assets. Fragment text there is invented sample data, never real client records; the same goes for the code and labels in `components/heroes/`.

drei `<Text>` (troika) must get `font={HERO_FONT}` from `components/heroes/shared.ts`, a self-hosted Martian Mono WOFF in `public/fonts/`. Without it troika fetches a default font from a CDN at runtime. Troika reads TTF/OTF/WOFF only, not WOFF2, so it can't reuse the `next/font` files. With `@react-three/rapier`, never touch a rigid body after it unmounts (check `isValid()`): a freed handle panics the wasm world and every later step throws.

## Cache Components

`cacheComponents: true` is a stable top-level key in Next 16 (not `experimental.`). Everything is dynamic by default; caching is opt-in via `"use cache"`.

**Always pair `"use cache"` with an explicit `cacheLife`** — without one you silently get the `default` profile, which revalidates every 15 minutes. `app/page.tsx` uses `max`; `components/main/footer.tsx` uses `days` because it renders `new Date().getFullYear()`, and an uncached timestamp during prerender is a hard build error (`blocking-prerender-current-time`) that `instant = false` cannot suppress.

The footer sits in the layout, so its `days` lifetime caps the whole route — `/` reports 1d revalidate even though the page asks for `max`, because a route's revalidate is the minimum across its tree. Anything new that reads the clock, randomness, `cookies()`, or `headers()` needs `"use cache"` or a `<Suspense>` boundary, or the build fails.

## Contact form

`components/main/contact-us.tsx` sends via EmailJS entirely client-side (no API route). It reads four `NEXT_PUBLIC_` vars from `.env.local`: `NEXT_PUBLIC_SERVICE_ID`, `NEXT_PUBLIC_TEMPLATE_ID`, `NEXT_PUBLIC_EMAILJS_KEY`, `NEXT_PUBLIC_EMAILJS_RECIEVER` (the misspelling is the real name). Validation is DOM-based: it toggles `.hidden` on `#name-error` / `#email-error` / `#message-error`, so those IDs must match the field names.

The form has no `noValidate` and the email field is `type="email"`, so a malformed email is caught by native browser validation before React's handler runs — the custom email error span only appears when the field is empty. Long-standing behavior, not a bug. On success the form clears and shows a "Received" stamp; on failure it keeps the visitor's text and shows an error toast.

## Styling

Tailwind v4 via `@tailwindcss/postcss` — there is no `tailwind.config.ts`. Tokens live in the `@theme` blocks in `app/globals.css`: colors `carbon` (#0F1226, page background and `themeColor`), `ledger` (#1A1E3A, surfaces), `copy` (#7D8CFF, links/focus), `form` (#E6E2D6, text and paper), `greenbar` (#B9D8B0, 3D paper only), `stamp` (#E0473A, reserved for the "Normalized"/"Received" stamps and the send button). Fonts: `font-display` (Redaction), `font-body` (Atkinson Hyperlegible Next), `font-mono` (Martian Mono), plus the `mono-label` utility for condensed uppercase captions. The site is dark-only.

Redaction is self-hosted from `app/fonts/redaction/` (SIL OFL 1.1, licence file alongside). `app/fonts.ts` registers each degradation grade as its own family and CSS variable; only the clean cut and grade 100 are preloaded, and the hero renders a hidden sample of the middle grades so they're fetched before the first scroll.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
