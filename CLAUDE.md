# CLAUDE.md — project conventions

Guidelines for working on this repo. Follow these whenever you add, rename,
recategorize, or remove a tool — the goal is that the landing page, the tool
metadata, and the README never drift apart.

## What this repo is

A collection of self-contained single-file HTML tools (`static/tools/*.html`)
wrapped by a SvelteKit shell that provides the landing page and a viewer.
Tools have no build step; the shell is prerendered static output.

- `static/tools/*.html` — the tools themselves, one file each, metadata in a
  `<!-- tool-meta: {...} -->` comment in `<head>`
- `src/lib/categories.json` — **canonical category registry** (single source of truth)
- `src/lib/generative.ts` — seeded generative SVG icon system
- `scripts/register-tools.js` — interactive metadata registration / CI verify
- `vite.config.ts` — scans tool metadata into the `virtual:tools` module

## Tool metadata

Every tool file carries exactly one meta comment:

```html
<!-- tool-meta: {"name":"…","slug":"…","description":"…","category":"…","tags":["…"]} -->
```

- `name` — short display name, no trailing punctuation
- `slug` — kebab-case, stable once published (it's the URL and the icon seed)
- `description` — one sentence up to ~250 chars, written like the existing ones:
  "What it does — key features, comma-separated". Em-dash after the summary.
- `category` — one id from `src/lib/categories.json` (see below). Required.
- `tags` — 3–8 lowercase keywords: techniques, formats, libraries

Run `npm run register-tools` after dropping a new file in `static/tools/`;
`npm run register-tools --verify` must pass (it fails on a missing or unknown
category).

## Categories

Canonical list lives in `src/lib/categories.json`. Current categories:

| id | label | what belongs here |
|----|-------|-------------------|
| `plotting` | Plotting & Print | Output destined for pen plotters or paper: SVG/PDF generators, plot prep, single-stroke/Hershey text, page-format layout |
| `vision` | Camera & Vision | Webcam or image input processed with in-browser ML (MediaPipe, TensorFlow.js, Transformers.js…): segmentation, depth, landmarks — including ones that *output* plottable SVG |
| `studio` | Design & Social | Visuals made for screens and socials: banners, reels, video/animation export |
| `misc` | Misc | Fallback only. A tool should never *stay* here — recategorize or add a category |

Filing rules:

1. **One category per tool.** Pick by the tool's primary *input/workflow*, not
   every capability it has. A webcam tool that exports plotter SVG is `vision`
   (you stand in front of a camera to use it); a calendar generator that
   exports SVG+PDF is `plotting` (its output goes to pen/paper).
2. **When torn, prefer the more specific category** over `studio`, and
   `plotting` only when plotter/print output is the tool's reason to exist.
3. **Adding a category** needs ≥2 tools that clearly don't fit the existing
   ones. To add: append to `src/lib/categories.json` (id, label, tagline,
   color, icon family), pick an icon family (reuse one of
   `hatch|contour|blocks|grid` or add a generator in `src/lib/generative.ts`),
   pick a color that reads on `#0e0e0e` and isn't close to the existing
   lime/cyan/orange/violet, add a section to the README, and update the table
   above. Don't reorder existing categories — the JSON order is the display
   order on the page and in the README.
4. **Never invent category ids in tool-meta** that aren't in the registry —
   they render as Misc and fail `--verify`.

## Keeping the README up to date

The README's *Tools* section mirrors the landing page. Whenever a tool is
added, renamed, recategorized, or its description materially changes:

1. Update its row in the README under the **matching category heading**
   (same order as `categories.json`; tools alphabetical by name within a
   category — same as the site).
2. Table row format: `| [Name](static/tools/file.html) | description |` —
   keep the description a trimmed version of the tool-meta description
   (aim ≤ 200 chars; drop feature lists before dropping the "what it is").
3. Update the tool count if the README states one anywhere.
4. Never hand-edit the README to disagree with tool-meta — tool-meta is the
   source of truth; fix it there first, then mirror it.

## Generative icon system

Each tool's icon is generated, not drawn: pattern family from its category
(`hatch` = plotting, `contour` = vision, `blocks` = studio, `grid` = misc),
seeded by its **slug** (`generateIcon(slug, family)` in `src/lib/generative.ts`).

- Changing a slug changes the icon — another reason slugs stay stable.
- Generation must stay **deterministic and pure** (no `Date.now`, no
  `Math.random`): pages are prerendered and hydrate against the same markup.
- New pattern families: keep them stroke-based (`currentColor`), viewBox
  `0 0 64 64`, legible at 18px (the viewer header uses that size).

## Design conventions (shell)

- Dark only, terminal aesthetic: IBM Plex Mono, background `#0e0e0e`,
  accent lime `#c8f060`, **no border radius**, uppercase letterspaced labels.
- Category colors come from `categories.json` and flow in via a `--cat` CSS
  custom property (inline `style`) — don't hardcode them in components.
- Tool cards are **fixed-size** (`height: 218px`, clamped name/description,
  single tag row): whatever you add to a card must not make heights diverge.
- The landing grid is full-width (`auto-fill, minmax(272px, 1fr)`) — don't
  reintroduce a `max-width` cap on `main`.
- Svelte components use Svelte 4 legacy syntax (`export let`, `$:`) — match
  that style, don't mix in runes.
