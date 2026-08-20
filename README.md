# dxviie / tools

A collection of self-contained single-file HTML+JS tools built to solve specific problems I run into — mostly around generative art, pen plotting, and the analogue world.

**Live:** [tools.d17e.dev](https://tools.d17e.dev) · **By:** [d17e.dev](https://d17e.dev)

---

## Concept

Each tool is a standalone `.html` file: HTML, CSS, and JavaScript in one place, with no build step and no server-side dependencies. They run directly in the browser and can be bookmarked, shared, or hosted anywhere by copying a single file.

This approach is directly inspired by [Simon Willison's HTML tools](https://simonwillison.net/2025/Dec/10/html-tools/) and his collection at [tools.simonwillison.net](https://tools.simonwillison.net/). The format keeps tools small, readable, and easy to iterate on — especially with LLM assistance.

The SvelteKit shell around the tools adds a searchable landing page (tools grouped by category, filterable by name/tag/tech) and gives every tool a unique generative SVG icon — pattern family from its category, seeded by its slug.

---

## Tools

### Plotting & Print

SVG and PDF generators for pen plotters and paper — single-stroke fonts, calibration, page formats.

| Tool | Description |
|------|-------------|
| [Hershey Calendar](static/tools/hershey-calendar.html) | Plottable SVG and printable PDF calendars (month, quarter, year) at A6–A4 or custom sizes, portrait or landscape, set in Hershey or EMS vector fonts |
| [Pixel Art Print](static/tools/pixel-art-print.html) | Print-sized pixel grids — image and text layers rasterized with threshold dithering, noise tints, step or sine wave animation, GIF / MP4 / WebM export |
| [Plot Prep](static/tools/plot-prep.html) | SVG decorator for pen plotting — adds paper outline, calibration markers, and page boundary layers (Saxi / AxiDraw) |
| [PTPX Postcard Plotter](static/tools/ptpx-postcard-plotter.html) | Postcard back generator — lays out 4× A6 on A4 with Hershey single-stroke text, address lines, stamp boxes, and Inkscape layers ready for plotting |

### Camera & Vision

Webcam experiments with in-browser ML — segmentation, depth, landmarks, generative output.

| Tool | Description |
|------|-------------|
| [Camera Depth Performance Tool](static/tools/camera-depth-compositor.html) | Event-focused camera compositor combining MediaPipe face/hand landmarks with Depth Anything v2 depth masking, view modes, threshold controls, and performance metrics |
| [MediaPipe Vision inspector](static/tools/mediapipe-vision-inspector.html) | Webcam sandbox for Google MediaPipe Tasks Vision — face, hands, pose, holistic, gestures, selfie segmentation, with timing and JSON summaries |
| [Transformers depth lab](static/tools/transformers-depth-lab.html) | Webcam or image → monocular depth via Transformers.js — swap HF Hub ONNX models, WASM or WebGPU, timings and JSON summaries |
| [Webcam adaptive Voronoi hatch](static/tools/webcam-adaptive-voronoi-hatch.html) | Webcam → body segmentation → Voronoi hatching; optional gradient relief or AR portrait depth shading; spacing in mm; A6–A3 SVG export |
| [Webcam adaptive Voronoi hatch (conference)](static/tools/webcam-adaptive-voronoi-hatch-conference.html) | Conference mode wrapper: opens adaptive Voronoi hatch with stage/fullscreen controls and MIDI mapping enabled |
| [Webcam Silhouette Mosaic](static/tools/webcam-silhouette-mosaic.html) | Webcam + ml5 BodyPix person mask, grid or Voronoi planes, hatch pattern fills, and SVG export for pen plotters |

### Design & Social

Banners, reels and visuals for meetups and social media.

| Tool | Description |
|------|-------------|
| [Banner generator CCA](static/tools/generate-2026-03-22.html) | Banner generator for the March 2026 meetup of [Creative Coding Amsterdam](https://cca.codes) |
| [CCA Banner](static/tools/cca-banner.html) | Meetup banner generator for [Creative Coding Amsterdam](https://cca.codes) — title text, info boxes, logo plates, background images, palette picking, presets; 16:9 & square |
| [Framesheet Studio](static/tools/framesheet-studio.html) | Turns photos of plotted framesheets into looping animations — SVG-template frame detection, page rectification, mark-locked or neighbour stabilization, post FX, GIF / MP4 / frame-ZIP export at source quality |
| [Reel Studio](static/tools/reel-studio.html) | Timeline reel editor for socials — image/video clips with animation presets, trims, cued text overlays, clip audio + music track mixed into square or portrait MP4 export |

---

## Running locally

```bash
npm install
npm run dev
```

The SvelteKit shell wraps the tools in a shared landing page and viewer. The tools themselves remain standalone HTML files served directly from `static/tools/`.

## Adding a tool

1. Drop a self-contained `.html` file into `static/tools/`
2. Run `npm run register-tools` — interactive prompt for name, slug, description, category, and tags
3. The dev server picks it up immediately; the landing page updates automatically
4. Add the tool to the matching category table in this README (see `CLAUDE.md` for the conventions)

```bash
npm run register-tools           # add metadata to any unregistered tools
npm run register-tools --verify  # CI check — exits 1 if any tool is missing metadata
npm run register-tools --force   # re-register all tools (overwrite existing metadata)
```

Metadata is stored as a comment in each HTML file's `<head>`:

```html
<!-- tool-meta: {"name":"My Tool","slug":"my-tool","description":"...","category":"plotting","tags":["..."]} -->
```

Categories are defined in `src/lib/categories.json` (currently `plotting`, `vision`, `studio`, plus a `misc` fallback). `CLAUDE.md` documents the filing rules — one category per tool, chosen by its primary workflow — and how the landing page, metadata, and this README are kept in sync.

---

## Fonts

Bundled locally under `static/fonts/`:

- **Hershey fonts** (`static/fonts/hershey/`) — originally by Dr. A.V. Hershey (US NBS), SVG conversion by Windell H. Oskay. Free for any use with attribution. See `ATTRIBUTION.txt`.
- **EMS fonts** (`static/fonts/ems/`) — by Sheldon B. Michaels / Windell H. Oskay, derived from Source Sans Pro (Paul D. Hunt, Adobe). Licensed under the [SIL Open Font License](static/fonts/ems/OFL.txt).

---

## License

The SvelteKit shell and tooling scripts are MIT licensed.
Each HTML tool is self-contained — check the file header for any individual licensing notes.
