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

- **Bun is the package manager only. Do not add `--bun` to the scripts.** Running Next on the Bun runtime builds fine locally but *fails on Vercel*: `Failed to load external module next/dist/compiled/next-server/app-page-turbo.runtime.prod.js: TypeError: Expected CommonJS module to have a function wrapper`, then `Failed to collect page data for /_not-found`. This was tried and reverted. Matching reports ([#86866](https://github.com/vercel/next.js/issues/86866), [#87417](https://github.com/vercel/next.js/issues/87417)) appear closed, but both were auto-closed by a bot for missing reproductions — not fixed. Plain `bun run` follows the `next` binary's node shebang, which is what we want.
- `trustedDependencies` in `package.json` must keep both `@tailwindcss/oxide` and `sharp`. Bun blocks lifecycle scripts by default, and declaring the field *replaces* its built-in trusted list instead of extending it — dropping either silently breaks Tailwind's native binary or image optimization.
- ESLint is pinned to 9.x. `eslint-config-next` claims `eslint: >=9.0.0`, but its transitive `eslint-plugin-react` caps at `^9.7` and crashes under 10.

## Architecture

Single-page Next.js App Router site (Next 16.3, React 19, Tailwind v4, TypeScript strict) with Cache Components and React Compiler enabled. One route: `app/page.tsx` stacks all sections in order (Hero → Skills → Encryption → Experience → Projects → Contact). `app/layout.tsx` wraps them with the persistent `StarsCanvas`, `Navbar`, and `Footer`. Config lives in `next.config.ts`.

**Content lives in `constants/index.ts`, not in components.** That ~700-line file is the single source of truth for every section's data (`SERVICES`, `EXPERIENCES`, the skill groups, `PROJECTS`, `NAV_LINKS`, `SOCIALS`, `PROFESSIONAL_PROFILES`, `USED_TECH`). Adding a project or job is a data edit there, not a component change. Most exports end in `as const` and component prop types derive from them (e.g. `experience.tsx` types its card as `(typeof EXPERIENCES)[keyof typeof EXPERIENCES][number]`), so widening a literal type can ripple into components.

**Icon paths are conventions, not full paths.** Constants store bare filenames; the consuming component prefixes the public directory:

- skills / project tech icons → `/skills/${icon}` (`skill-data-provider.tsx`, `project-card.tsx`)
- service icons → `/services/${icon}` (`hero.tsx`)
- experience logos → `/experiences/${icon}` (`experience.tsx`)
- `PROJECTS[].image` is the exception — a full path like `/projects/foo.png`

Add the asset to the matching `public/` subfolder when adding a constant entry.

**Component split:** `components/main/` holds full page sections (each rendered once from `page.tsx` or `layout.tsx`); `components/sub/` holds the pieces they compose. Import via the `@/*` alias. Sections are server components by default; anything using framer-motion, r3f, hooks, or browser APIs needs `"use client"`.

**Animation:** use the variant factories in `lib/motion.ts` (`fadeIn`, `slideIn`, `staggerContainer`, plus the skill/lock variants) rather than inline variants — parents pass `staggerContainer()`, children `fadeIn(...)`. A variant only animates if the element also sets `initial` plus `animate`/`whileInView`, or has a motion parent orchestrating it.

**Rich text:** `parseStringWithBold` in `lib/utils.tsx` turns `**bold**` inside constant strings into a gradient `<strong>` — that's why `EXPERIENCES[].points` contain asterisks. `lib/utils.tsx` is `.tsx` because it returns JSX; `cn()` lives there too.

### Keep heavy assets lazy

`three` / `@react-three/fiber` / `drei` load via `next/dynamic` with `ssr: false`, which is the difference between ~790KB and ~1760KB of initial JS. `ssr: false` is illegal in a server component, which is why `components/main/star-background.tsx` exists as a thin client wrapper around `components/sub/star-scene.tsx`; `contact-us.tsx` wraps `components/sub/earth.tsx` the same way. Don't pull them into a static import graph.

For background video use `components/sub/lazy-background-video.tsx`, not a raw `<video>`. `preload="none"` does **not** defer an autoplaying video — `autoplay` wins and the browser fetches it regardless. The component withholds `src` until the element nears the viewport.

## Cache Components

`cacheComponents: true` is a stable top-level key in Next 16 (not `experimental.`). Everything is dynamic by default; caching is opt-in via `"use cache"`.

**Always pair `"use cache"` with an explicit `cacheLife`** — without one you silently get the `default` profile, which revalidates every 15 minutes. `app/page.tsx` uses `max`; `components/main/footer.tsx` uses `days` because it renders `new Date().getFullYear()`, and an uncached timestamp during prerender is a hard build error (`blocking-prerender-current-time`) that `instant = false` cannot suppress.

The footer sits in the layout, so its `days` lifetime caps the whole route — `/` reports 1d revalidate even though the page asks for `max`, because a route's revalidate is the minimum across its tree. Anything new that reads the clock, randomness, `cookies()`, or `headers()` needs `"use cache"` or a `<Suspense>` boundary, or the build fails.

## Contact form

`components/main/contact-us.tsx` sends via EmailJS entirely client-side (no API route). It reads four `NEXT_PUBLIC_` vars from `.env.local`: `NEXT_PUBLIC_SERVICE_ID`, `NEXT_PUBLIC_TEMPLATE_ID`, `NEXT_PUBLIC_EMAILJS_KEY`, `NEXT_PUBLIC_EMAILJS_RECIEVER` (the misspelling is the real name). Validation is DOM-based: it toggles `.hidden` on `#name-error` / `#email-error` / `#message-error`, so those IDs must match the field names.

The form has no `noValidate` and the email field is `type="email"`, so a malformed email is caught by native browser validation before React's handler runs — the custom "Invalid E-mail!" span only appears when the field is empty. Long-standing behavior, not a bug.

## Styling

Tailwind v4 via `@tailwindcss/postcss` — there is no `tailwind.config.ts`. Theme customization goes in the `@theme` block in `app/globals.css`, alongside the hand-written classes components rely on (`button-primary`, `Welcome-box`, `Welcome-text`, `cursive`, `scrollbar-hidden`). The site is dark-only; `#030014` is set on `<body>` and as the viewport `themeColor`. Section colors are inline hex literals (`#151030`, `#1d1836`, `#2A0E61`) rather than theme tokens — match neighboring values when adding UI.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
