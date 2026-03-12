# dxviie / tools

A collection of self-contained single-file HTML+JS tools built to solve specific problems I run into — mostly around generative art, pen plotting, and the analogue world.

**Live:** [tools.d17e.dev](https://tools.d17e.dev) · **By:** [d17e.dev](https://d17e.dev)

---

## Concept

Each tool is a standalone `.html` file: HTML, CSS, and JavaScript in one place, with no build step and no server-side dependencies. They run directly in the browser and can be bookmarked, shared, or hosted anywhere by copying a single file.

This approach is directly inspired by [Simon Willison's HTML tools](https://simonwillison.net/2025/Dec/10/html-tools/) and his collection at [tools.simonwillison.net](https://tools.simonwillison.net/). The format keeps tools small, readable, and easy to iterate on — especially with LLM assistance.

---

## Tools

| Tool | Description |
|------|-------------|
| [Plot Prep](static/tools/plot-prep.html) | SVG decorator for pen plotting — adds paper outline, calibration markers, and page boundary layers (Saxi / AxiDraw) |
| [PTPX Postcard Plotter](static/tools/ptpx-postcard-plotter.html) | Postcard back generator — lays out 4× A6 on A4 with Hershey single-stroke text, address lines, stamp boxes, and Inkscape layers ready for plotting |

---

## Running locally

```bash
npm install
npm run dev
```

The SvelteKit shell wraps the tools in a shared landing page and viewer. The tools themselves remain standalone HTML files served directly from `static/tools/`.

## Adding a tool

1. Drop a self-contained `.html` file into `static/tools/`
2. Run `npm run register-tools` — interactive prompt for name, slug, description, and tags
3. The dev server picks it up immediately; the landing page updates automatically

```bash
npm run register-tools           # add metadata to any unregistered tools
npm run register-tools --verify  # CI check — exits 1 if any tool is missing metadata
npm run register-tools --force   # re-register all tools (overwrite existing metadata)
```

Metadata is stored as a comment in each HTML file's `<head>`:

```html
<!-- tool-meta: {"name":"My Tool","slug":"my-tool","description":"...","tags":["..."]} -->
```

---

## Fonts

Bundled locally under `static/fonts/`:

- **Hershey fonts** (`static/fonts/hershey/`) — originally by Dr. A.V. Hershey (US NBS), SVG conversion by Windell H. Oskay. Free for any use with attribution. See `ATTRIBUTION.txt`.
- **EMS fonts** (`static/fonts/ems/`) — by Sheldon B. Michaels / Windell H. Oskay, derived from Source Sans Pro (Paul D. Hunt, Adobe). Licensed under the [SIL Open Font License](static/fonts/ems/OFL.txt).

---

## License

The SvelteKit shell and tooling scripts are MIT licensed.
Each HTML tool is self-contained — check the file header for any individual licensing notes.
