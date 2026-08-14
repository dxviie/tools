/**
 * Generative SVG icon system.
 *
 * Every tool gets a unique, deterministic glyph: the pattern family comes
 * from its category (hatch / contour / blocks / grid) and the composition
 * is seeded by its slug. Pure functions only — output must be identical
 * on server and client so prerendered markup hydrates cleanly.
 */

export interface IconShape {
  d: string;
  sw: number; // stroke width (ignored when fill = true)
  op: number;
  fill: boolean;
}

export interface RidgeLine {
  d: string;
  op: number;
  channel: number; // 0..2 → mapped to category colors by the component
}

// ── Seeded randomness ──────────────────────────────────────────────────────

export function hashString(str: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const f = (n: number) => Math.round(n * 100) / 100;

// ── Geometry helpers ───────────────────────────────────────────────────────

interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** Parallel hatch segments clipped to a rect, joined into one path. */
function hatchPath(r: Rect, angleDeg: number, spacing: number, phase: number): string {
  const a = (angleDeg * Math.PI) / 180;
  const dx = Math.cos(a);
  const dy = Math.sin(a);
  const nx = -dy;
  const ny = dx;
  const cx = r.x + r.w / 2;
  const cy = r.y + r.h / 2;
  const extent = Math.abs((r.w / 2) * nx) + Math.abs((r.h / 2) * ny);
  const parts: string[] = [];

  for (let t = -extent + phase * spacing; t <= extent; t += spacing) {
    const px = cx + nx * t;
    const py = cy + ny * t;
    const ss: number[] = [];
    if (Math.abs(dx) > 1e-6) {
      for (const ex of [r.x, r.x + r.w]) {
        const s = (ex - px) / dx;
        const iy = py + dy * s;
        if (iy >= r.y - 0.01 && iy <= r.y + r.h + 0.01) ss.push(s);
      }
    }
    if (Math.abs(dy) > 1e-6) {
      for (const ey of [r.y, r.y + r.h]) {
        const s = (ey - py) / dy;
        const ix = px + dx * s;
        if (ix >= r.x - 0.01 && ix <= r.x + r.w + 0.01) ss.push(s);
      }
    }
    if (ss.length < 2) continue;
    const s0 = Math.min(...ss);
    const s1 = Math.max(...ss);
    if (s1 - s0 < 1.5) continue;
    parts.push(
      `M${f(px + dx * s0)} ${f(py + dy * s0)}L${f(px + dx * s1)} ${f(py + dy * s1)}`
    );
  }
  return parts.join('');
}

function rectPath(r: Rect): string {
  return `M${f(r.x)} ${f(r.y)}h${f(r.w)}v${f(r.h)}h${f(-r.w)}Z`;
}

function crossPath(x: number, y: number, len: number): string {
  const h = len / 2;
  return `M${f(x - h)} ${f(y)}L${f(x + h)} ${f(y)}M${f(x)} ${f(y - h)}L${f(x)} ${f(y + h)}`;
}

function dotPath(x: number, y: number, r: number): string {
  return (
    `M${f(x + r)} ${f(y)}` +
    `A${f(r)} ${f(r)} 0 1 0 ${f(x - r)} ${f(y)}` +
    `A${f(r)} ${f(r)} 0 1 0 ${f(x + r)} ${f(y)}Z`
  );
}

/** Split a rect into n sub-rects with a gutter, alternating orientation. */
function splitRects(rnd: () => number, start: Rect, n: number, gutter: number): Rect[] {
  const rects: Rect[] = [start];
  while (rects.length < n) {
    let idx = 0;
    for (let i = 1; i < rects.length; i++) {
      if (rects[i].w * rects[i].h > rects[idx].w * rects[idx].h) idx = i;
    }
    const r = rects[idx];
    const ratio = 0.35 + rnd() * 0.3;
    const vertical = r.w > r.h ? true : r.h > r.w ? false : rnd() < 0.5;
    let a: Rect, b: Rect;
    if (vertical) {
      const w1 = r.w * ratio - gutter / 2;
      a = { x: r.x, y: r.y, w: w1, h: r.h };
      b = { x: r.x + w1 + gutter, y: r.y, w: r.w - w1 - gutter, h: r.h };
    } else {
      const h1 = r.h * ratio - gutter / 2;
      a = { x: r.x, y: r.y, w: r.w, h: h1 };
      b = { x: r.x, y: r.y + h1 + gutter, w: r.w, h: r.h - h1 - gutter };
    }
    rects.splice(idx, 1, a, b);
  }
  return rects;
}

// ── Pattern families ───────────────────────────────────────────────────────

/** Plotting: hatched swatch regions + a registration cross. */
function hatchIcon(rnd: () => number): IconShape[] {
  const shapes: IconShape[] = [];
  const regions = splitRects(rnd, { x: 5, y: 5, w: 54, h: 54 }, 2 + Math.floor(rnd() * 3), 4);

  // Rotate angles between regions so neighbours always contrast.
  const baseAngle = [0, 30, 45, 60, 90, 135][Math.floor(rnd() * 6)];
  const angleStep = 60 + Math.floor(rnd() * 4) * 15; // 60 | 75 | 90 | 105

  regions.forEach((r, i) => {
    const angle = (baseAngle + i * angleStep) % 180;
    const treatment = i === 0 ? 0 : rnd();
    if (treatment < 0.62) {
      const spacing = i === 0 ? 3 + rnd() * 2 : 4 + rnd() * 4;
      shapes.push({
        d: hatchPath(r, angle, spacing, rnd()),
        sw: 1.8,
        op: i === 0 ? 0.9 : 0.4 + rnd() * 0.35,
        fill: false
      });
      if (rnd() < 0.4) shapes.push({ d: rectPath(r), sw: 1.4, op: 0.45, fill: false });
    } else if (treatment < 0.85) {
      // framed region with a single diagonal — an "empty plate"
      shapes.push({ d: rectPath(r), sw: 1.5, op: 0.55, fill: false });
      shapes.push({
        d: `M${f(r.x)} ${f(r.y + r.h)}L${f(r.x + r.w)} ${f(r.y)}`,
        sw: 1.4,
        op: 0.5,
        fill: false
      });
    } else {
      // blank breathing room, corner tick only
      shapes.push({
        d: `M${f(r.x)} ${f(r.y + 4)}L${f(r.x)} ${f(r.y)}L${f(r.x + 4)} ${f(r.y)}`,
        sw: 1.5,
        op: 0.6,
        fill: false
      });
    }
  });

  const corners = [
    [7, 7],
    [57, 7],
    [7, 57],
    [57, 57]
  ];
  const [cx, cy] = corners[Math.floor(rnd() * corners.length)];
  shapes.push({ d: crossPath(cx, cy, 7), sw: 2, op: 1, fill: false });
  return shapes;
}

/** One cluster of wobbly concentric rings. */
function ringCluster(
  rnd: () => number,
  cx: number,
  cy: number,
  r0: number,
  maxR: number,
  rings: number,
  wobble: number,
  opBase: number
): IconShape[] {
  const shapes: IconShape[] = [];
  const step = (maxR - r0) / Math.max(rings - 1, 1);

  for (let i = 0; i < rings; i++) {
    const rr0 = r0 + i * step;
    const a1 = rr0 * wobble * (0.7 + rnd() * 0.7);
    const p1 = rnd() * Math.PI * 2;
    const k1 = 2 + Math.floor(rnd() * 3);
    const a2 = rr0 * wobble * 0.4 * rnd();
    const p2 = rnd() * Math.PI * 2;
    const k2 = 4 + Math.floor(rnd() * 4);

    const pts: string[] = [];
    const steps = 30;
    for (let s = 0; s <= steps; s++) {
      const th = (s / steps) * Math.PI * 2;
      const rr = rr0 + a1 * Math.sin(k1 * th + p1) + a2 * Math.sin(k2 * th + p2);
      pts.push(`${s === 0 ? 'M' : 'L'}${f(cx + rr * Math.cos(th))} ${f(cy + rr * Math.sin(th))}`);
    }
    shapes.push({ d: pts.join('') + 'Z', sw: 1.8, op: Math.max(opBase - i * 0.12, 0.25), fill: false });
  }
  return shapes;
}

/**
 * Vision: depth-map contours in one of three compositions —
 * centered, off-center (cropped by the frame), or a dual cluster.
 */
function contourIcon(rnd: () => number): IconShape[] {
  const shapes: IconShape[] = [];
  const variant = rnd();
  const wobble = 0.06 + rnd() * 0.2;

  // occasional scanlines behind the contours
  if (rnd() < 0.38) {
    const lines = 3 + Math.floor(rnd() * 3);
    for (let i = 0; i < lines; i++) {
      const y = 12 + (i * 44) / (lines - 1) + (rnd() - 0.5) * 4;
      shapes.push({ d: `M8 ${f(y)}L56 ${f(y)}`, sw: 1.1, op: 0.22, fill: false });
    }
  }

  if (variant < 0.42) {
    // centered
    const cx = 32 + (rnd() - 0.5) * 8;
    const cy = 32 + (rnd() - 0.5) * 8;
    const rings = 4 + Math.floor(rnd() * 3);
    shapes.push(...ringCluster(rnd, cx, cy, 3.5 + rnd() * 4, 23 + rnd() * 4, rings, wobble, 0.95));
    shapes.push({ d: dotPath(cx, cy, 1.8), sw: 0, op: 1, fill: true });
  } else if (variant < 0.78) {
    // off-center, rings cropped by the icon frame
    const anchors = [
      [20, 22],
      [44, 20],
      [19, 43],
      [45, 44]
    ];
    const [ax, ay] = anchors[Math.floor(rnd() * anchors.length)];
    const cx = ax + (rnd() - 0.5) * 6;
    const cy = ay + (rnd() - 0.5) * 6;
    const rings = 5 + Math.floor(rnd() * 3);
    shapes.push(...ringCluster(rnd, cx, cy, 3 + rnd() * 3, 28 + rnd() * 8, rings, wobble, 0.9));
    shapes.push({ d: dotPath(cx, cy, 1.8), sw: 0, op: 1, fill: true });
  } else {
    // dual cluster — a big and a small "landmark"
    const mx = 22 + (rnd() - 0.5) * 6;
    const my = 26 + (rnd() - 0.5) * 8;
    shapes.push(...ringCluster(rnd, mx, my, 3.5, 13 + rnd() * 3, 3 + Math.floor(rnd() * 2), wobble, 0.95));
    shapes.push({ d: dotPath(mx, my, 1.6), sw: 0, op: 1, fill: true });

    const sx = 45 + (rnd() - 0.5) * 6;
    const sy = 42 + (rnd() - 0.5) * 8;
    shapes.push(...ringCluster(rnd, sx, sy, 2.5, 7 + rnd() * 3, 2 + Math.floor(rnd() * 2), wobble, 0.8));
    shapes.push({ d: dotPath(sx, sy, 1.3), sw: 0, op: 0.9, fill: true });
  }
  return shapes;
}

/** Studio: banner-layout blocks — text lines, a plate, stroked frames. */
function blocksIcon(rnd: () => number): IconShape[] {
  const shapes: IconShape[] = [];
  const rects = splitRects(rnd, { x: 6, y: 6, w: 52, h: 52 }, 4 + Math.floor(rnd() * 3), 4);

  let largest = 0;
  for (let i = 1; i < rects.length; i++) {
    if (rects[i].w * rects[i].h > rects[largest].w * rects[largest].h) largest = i;
  }
  const filled = (largest + 1 + Math.floor(rnd() * (rects.length - 1))) % rects.length;

  rects.forEach((r, i) => {
    if (i === largest) {
      shapes.push({ d: rectPath(r), sw: 1.6, op: 0.6, fill: false });
      const lines = Math.max(2, Math.min(3, Math.floor(r.h / 9)));
      const inset = 4.5;
      for (let l = 0; l < lines; l++) {
        const y = r.y + inset + 2 + l * 5.5;
        if (y > r.y + r.h - inset) break;
        const len = (r.w - inset * 2) * (0.55 + rnd() * 0.4);
        shapes.push({
          d: `M${f(r.x + inset)} ${f(y)}L${f(r.x + inset + len)} ${f(y)}`,
          sw: 2.2,
          op: 0.95,
          fill: false
        });
      }
    } else if (i === filled) {
      shapes.push({ d: rectPath(r), sw: 0, op: 0.85, fill: true });
    } else if (rnd() < 0.35 && Math.min(r.w, r.h) > 10) {
      shapes.push({ d: rectPath(r), sw: 1.6, op: 0.55, fill: false });
      shapes.push({ d: dotPath(r.x + r.w / 2, r.y + r.h / 2, Math.min(r.w, r.h) * 0.18), sw: 1.8, op: 0.9, fill: false });
    } else {
      shapes.push({ d: rectPath(r), sw: 1.6, op: 0.45 + rnd() * 0.3, fill: false });
      if (rnd() < 0.5) {
        shapes.push({
          d: `M${f(r.x)} ${f(r.y + r.h)}L${f(r.x + r.w)} ${f(r.y)}`,
          sw: 1.4,
          op: 0.5,
          fill: false
        });
      }
    }
  });
  return shapes;
}

/** Misc: a field of grid marks with one emphasized cell. */
function gridIcon(rnd: () => number): IconShape[] {
  const shapes: IconShape[] = [];
  const n = 4 + Math.floor(rnd() * 2);
  const m = 8;
  const cell = (64 - m * 2) / (n - 1);
  const special = Math.floor(rnd() * n * n);

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      const x = m + i * cell;
      const y = m + j * cell;
      if (i * n + j === special) {
        const s = cell * 0.32;
        shapes.push({ d: rectPath({ x: x - s, y: y - s, w: s * 2, h: s * 2 }), sw: 0, op: 0.95, fill: true });
        continue;
      }
      const kind = rnd();
      if (kind < 0.35) {
        shapes.push({ d: dotPath(x, y, 1.4), sw: 0, op: 0.5 + rnd() * 0.4, fill: true });
      } else if (kind < 0.6) {
        shapes.push({ d: crossPath(x, y, 5), sw: 1.6, op: 0.5 + rnd() * 0.4, fill: false });
      } else if (kind < 0.75) {
        const s = 2.6;
        shapes.push({ d: rectPath({ x: x - s, y: y - s, w: s * 2, h: s * 2 }), sw: 1.5, op: 0.5 + rnd() * 0.3, fill: false });
      }
      // else: empty cell
    }
  }
  return shapes;
}

// ── Public API ─────────────────────────────────────────────────────────────

const FAMILIES: Record<string, (rnd: () => number) => IconShape[]> = {
  hatch: hatchIcon,
  contour: contourIcon,
  blocks: blocksIcon,
  grid: gridIcon
};

export function generateIcon(seed: string, family: string): IconShape[] {
  const make = FAMILIES[family] ?? gridIcon;
  return make(mulberry32(hashString(seed)));
}

/**
 * Flowing pen-path ridge lines for the landing hero.
 * Sum-of-sines walks across the full width; deterministic via seed.
 */
export function generateRidges(seed: string, width = 1440, height = 300, count = 10): RidgeLine[] {
  const rnd = mulberry32(hashString(seed));
  const lines: RidgeLine[] = [];

  for (let i = 0; i < count; i++) {
    const tI = i / (count - 1);
    const baseY = height * (0.18 + 0.74 * tI);
    const amp = 5 + tI * 22;
    const harmonics = [1, 2, 3].map(() => ({
      a: (0.3 + rnd() * 0.7) * amp * 0.6,
      fr: ((0.6 + rnd() * 1.6) * Math.PI * 2) / width,
      ph: rnd() * Math.PI * 2
    }));

    const pts: string[] = [];
    for (let x = -20; x <= width + 20; x += 16) {
      let y = baseY;
      for (const h of harmonics) y += h.a * Math.sin(x * h.fr + h.ph);
      pts.push(`${x === -20 ? 'M' : 'L'}${f(x)} ${f(y)}`);
    }

    const channel = i % 5 === 2 ? 1 : i % 5 === 4 ? 2 : 0;
    lines.push({ d: pts.join(''), op: 0.06 + tI * 0.2, channel });
  }
  return lines;
}
