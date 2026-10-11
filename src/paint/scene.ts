import { hex, mix, css, tone, type RGB } from './color';
import { ctx2d, makeCanvas } from './ref';
import { fbm, makeNoise, mulberry32, smoothstep, type Noise2, type Rng } from './rng';

export type Mood = 'morning' | 'noon' | 'breeze' | 'rain';

/** What the brush is painting at a point; encoded as id × 36 in the region map. */
export const REGION = { SKY: 0, WATER: 1, OBJECT: 2, FOLIAGE: 3, FIELD: 4, PATH: 5, POPLAR: 6 } as const;
export const REGION_STEP = 36;

interface Palette {
  sky: [number, string][];
  cloudLit: string;
  cloudShade: string;
  /** how many cumulus clouds, and how soft their edges are */
  clouds: number;
  cloudEdge: number;
  /** stretch clouds sideways, as wind does */
  cloudStretch: number;
  glow: { x: number; y: number; color: string; size: number; alpha: number };
  haze: string;
  hazeAmount: number;
  hillsFar: string;
  hillsNear: string;
  hedge: string[];
  poplar: string;
  poplarLit: string;
  poplarShade: string;
  blossom: string[];
  house: string;
  roof: string;
  /** the front door and shutters */
  door: string;
  field: [number, string][];
  wheatLight: string;
  wheatDark: string;
  /** strength of the silvery bands wind combs through young wheat */
  wind: number;
  /** how far the wheat and poplars lean */
  lean: number;
  path: string;
  pathShade: string;
  flowers: string[];
  flowerAmount: number;
  puddles?: boolean;
  rainbow?: boolean;
  /** lighten the sky behind the title block so the type stays crisp */
  quietTone: number;
}

// cornflowers, a few white daisies and pale buttercups
const FLOWERS = ['#4E74C9', '#5D86D6', '#F6F5EE', '#F2E7A0', '#7FA0E0'];

// Four kinds of spring weather over the same field of young wheat.
export const PALETTES: Record<Mood, Palette> = {
  morning: {
    sky: [
      [0, '#8DB9D8'],
      [0.5, '#BCD7E2'],
      [1, '#E4EEEA'],
    ],
    cloudLit: '#F7F8F4',
    cloudShade: '#B4C8D6',
    clouds: 3,
    cloudEdge: 0.5,
    cloudStretch: 1.3,
    glow: { x: 0.12, y: 0.2, color: '#FBF6E4', size: 0.9, alpha: 0.55 },
    haze: '#E8F0EC',
    hazeAmount: 0.6,
    hillsFar: '#B3C9D2',
    hillsNear: '#9DBDB6',
    hedge: ['#6E9C8E', '#7FA996', '#5E8C84'],
    poplar: '#6FA084',
    poplarLit: '#A6C994',
    poplarShade: '#4E7F78',
    blossom: ['#F7F3F1', '#F1E3E6', '#E9F0E2'],
    house: '#F2F1EA',
    roof: '#7D93A6',
    door: '#3F8285',
    field: [
      [0, '#A9C8B9'],
      [0.35, '#8DBB93'],
      [1, '#5F9A6A'],
    ],
    wheatLight: '#D3E6C9',
    wheatDark: '#4C8463',
    wind: 0.35,
    lean: 0.12,
    path: '#DCD8C4',
    pathShade: '#A9B4B2',
    flowers: FLOWERS,
    flowerAmount: 0.7,
    quietTone: 0.14,
  },
  noon: {
    sky: [
      [0, '#5E9FD4'],
      [0.55, '#97C5E6'],
      [1, '#D9ECEE'],
    ],
    cloudLit: '#FFFFFF',
    cloudShade: '#A9C1D9',
    clouds: 6,
    cloudEdge: 0.28,
    cloudStretch: 1,
    glow: { x: 0.85, y: 0.05, color: '#FFFDF2', size: 0.8, alpha: 0.4 },
    haze: '#DDEEF0',
    hazeAmount: 0.25,
    hillsFar: '#8FB3CC',
    hillsNear: '#6FA39A',
    hedge: ['#3F8A6E', '#579D72', '#2F7468'],
    poplar: '#4E9A6A',
    poplarLit: '#9BCB72',
    poplarShade: '#2C6B66',
    blossom: ['#FBF8F5', '#F4E4EA', '#EDF5E4'],
    house: '#F7F6EF',
    roof: '#5F7F9C',
    door: '#2F7A7C',
    field: [
      [0, '#86BBA2'],
      [0.3, '#72B26E'],
      [1, '#4C9452'],
    ],
    wheatLight: '#C6E39F',
    wheatDark: '#3B7F55',
    wind: 0.45,
    lean: 0.15,
    path: '#E6DEC2',
    pathShade: '#AEB9B4',
    flowers: FLOWERS,
    flowerAmount: 1,
    quietTone: 0.2,
  },
  breeze: {
    sky: [
      [0, '#6AA7D6'],
      [0.55, '#A7CEE6'],
      [1, '#DCEEEB'],
    ],
    cloudLit: '#FDFEFB',
    cloudShade: '#AFC6DA',
    clouds: 8,
    cloudEdge: 0.35,
    cloudStretch: 1.9,
    glow: { x: 0.8, y: 0.1, color: '#FFFDF2', size: 0.7, alpha: 0.3 },
    haze: '#E0EFEC',
    hazeAmount: 0.3,
    hillsFar: '#97B9CE',
    hillsNear: '#76A89C',
    hedge: ['#468F73', '#5EA277', '#33786A'],
    poplar: '#55A06E',
    poplarLit: '#A6D27E',
    poplarShade: '#2F6F68',
    blossom: ['#FBF8F5', '#F4E4EA', '#EDF5E4'],
    house: '#F6F5EE',
    roof: '#6684A0',
    door: '#2F7C7A',
    field: [
      [0, '#8FC1A8'],
      [0.3, '#7CB878'],
      [1, '#4E9758'],
    ],
    wheatLight: '#D6EDB4',
    wheatDark: '#3C8058',
    wind: 0.95,
    lean: 0.38,
    path: '#E4DCC0',
    pathShade: '#AFBAB4',
    flowers: FLOWERS,
    flowerAmount: 1.1,
    quietTone: 0.2,
  },
  rain: {
    sky: [
      [0, '#7E9DB8'],
      [0.45, '#A9C3D2'],
      [1, '#D6E6E6'],
    ],
    cloudLit: '#EEF2F2',
    cloudShade: '#8EA4B8',
    clouds: 7,
    cloudEdge: 0.55,
    cloudStretch: 1.5,
    glow: { x: 0.7, y: 0.25, color: '#F6F8EC', size: 0.9, alpha: 0.35 },
    haze: '#DCE8E8',
    hazeAmount: 0.4,
    hillsFar: '#94AFC2',
    hillsNear: '#6C9C93',
    hedge: ['#357F68', '#4A936E', '#28695F'],
    poplar: '#3F8C66',
    poplarLit: '#8FC57A',
    poplarShade: '#245E5C',
    blossom: ['#F8F6F4', '#F0E1E8', '#E6F1E0'],
    house: '#F1F1EC',
    roof: '#56718C',
    door: '#2A6C70',
    field: [
      [0, '#7EB39F'],
      [0.3, '#5FA86A'],
      [1, '#3C8A4E'],
    ],
    wheatLight: '#B9E09A',
    wheatDark: '#2F7550',
    wind: 0.3,
    lean: 0.1,
    path: '#CFC8B2',
    pathShade: '#94A3A6',
    flowers: FLOWERS,
    flowerAmount: 0.9,
    puddles: true,
    rainbow: true,
    quietTone: 0.18,
  },
};

export interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

const regionFill = (id: number) => `rgb(${id * REGION_STEP},0,0)`;
const fade = (c: string, a: number) => css(hex(c), a);

function inBox(b: Box, x: number, y: number, pad = 0) {
  return x > b.x - pad && x < b.x + b.w + pad && y > b.y - pad && y < b.y + b.h + pad;
}

/**
 * Paint the reference "motif" — a flat, blurry study of a spring wheat field
 * — that the brush then interprets. Geometry comes from `seed` alone, so the
 * same field can be repainted in different weather, as Monet did in series.
 */
export function drawScene(out: HTMLCanvasElement, region: HTMLCanvasElement, mood: Mood, seed: number, quiet: Box | null) {
  const W = out.width;
  const H = out.height;
  const ctx = ctx2d(out);
  const rc = ctx2d(region);
  const P = PALETTES[mood];
  const portrait = H > W * 1.05;
  const Y = Math.round(H * (portrait ? 0.58 : 0.6));
  const u = Math.min(W, H);
  const geo = mulberry32(seed);
  const rng = mulberry32(seed ^ 0x9e3779b9 ^ (mood.length * 7919));
  const noise = makeNoise(mulberry32(seed + 17));
  const vp = { x: W * (portrait ? 0.5 : 0.46), y: Y };

  rc.imageSmoothingEnabled = false;
  rc.fillStyle = regionFill(REGION.SKY);
  rc.fillRect(0, 0, W, H);
  rc.fillStyle = regionFill(REGION.FIELD);
  rc.fillRect(0, Y, W, H - Y);

  // ── sky ──
  const sky = ctx.createLinearGradient(0, 0, 0, Y);
  P.sky.forEach(([t, c]) => sky.addColorStop(t, c));
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, Y + 2);

  const g = P.glow;
  const glow = ctx.createRadialGradient(g.x * W, g.y * Y, 0, g.x * W, g.y * Y, g.size * u);
  glow.addColorStop(0, fade(g.color, g.alpha));
  glow.addColorStop(1, fade(g.color, 0));
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, Y);

  drawClouds(ctx, W, Y, u, P, geo, noise, quiet);
  if (P.rainbow) drawRainbow(ctx, W, Y, u, portrait);

  if (quiet && P.quietTone) {
    const cx = quiet.x + quiet.w * 0.45;
    const cy = quiet.y + quiet.h * 0.5;
    const rad = Math.max(quiet.w, quiet.h) * 0.85;
    const q = ctx.createRadialGradient(cx, cy, 0, cx, cy, rad);
    q.addColorStop(0, fade('#ffffff', P.quietTone));
    q.addColorStop(0.6, fade('#ffffff', P.quietTone * 0.6));
    q.addColorStop(1, fade('#ffffff', 0));
    ctx.fillStyle = q;
    ctx.fillRect(0, 0, W, Y);
  }

  // ── the far distance: hills and hedgerows ──
  hills(ctx, rc, W, Y, u, P.hillsFar, 0.05, 0.0024, noise, 3.1);
  hills(ctx, rc, W, Y, u, P.hillsNear, 0.026, 0.004, noise, 8.7);
  hedgerows(ctx, rc, W, Y, u, P, geo, rng, quiet);

  const mist = ctx.createLinearGradient(0, Y - u * 0.14, 0, Y + u * 0.05);
  mist.addColorStop(0, fade(P.haze, 0));
  mist.addColorStop(0.7, fade(P.haze, P.hazeAmount));
  mist.addColorStop(1, fade(P.haze, 0));
  ctx.fillStyle = mist;
  ctx.fillRect(0, Y - u * 0.14, W, u * 0.19);

  // ── the field, and the track up to the farmhouse door ──
  const door = { x: vp.x, y: Y + u * 0.012 };
  field(ctx, W, H, Y, P, noise, vp);
  const path = drawPath(ctx, rc, W, H, Y, u, P, door, portrait);
  if (P.puddles) puddles(ctx, rc, path, u, P, rng);
  flowers(ctx, W, H, Y, u, P, rng, path);
  const houseW = farmhouse(ctx, rc, door.x, door.y, u, P, rng);
  poplars(ctx, rc, W, H, Y, u, P, geo, rng, portrait);
  grasses(ctx, W, H, Y, u, P, rng);

  return { horizon: Y, door, houseW };
}

/** A rainbow in front of the clearing clouds, fading where it meets the land. */
function drawRainbow(ctx: CanvasRenderingContext2D, W: number, Y: number, u: number, portrait: boolean) {
  const cx = W * (portrait ? 0.78 : 0.8);
  const cy = Y + u * 0.18;
  const r0 = u * (portrait ? 0.42 : 0.5);
  const bands = ['#A58FD0', '#7F9EE0', '#7FC7A0', '#F1E28E', '#F4BC82', '#E89488'];
  const bw = u * 0.012;
  const layer = makeCanvas(W, Y);
  const lc = ctx2d(layer);
  bands.forEach((c, i) => {
    lc.strokeStyle = c;
    lc.lineWidth = bw * 1.25;
    lc.beginPath();
    lc.arc(cx, cy, r0 + i * bw, Math.PI, Math.PI * 2);
    lc.stroke();
  });
  // soften toward the feet of the arc
  lc.globalCompositeOperation = 'destination-in';
  const f = lc.createLinearGradient(0, cy - r0 - bw * 6, 0, Y);
  f.addColorStop(0, 'rgba(0,0,0,0.6)');
  f.addColorStop(0.55, 'rgba(0,0,0,0.45)');
  f.addColorStop(1, 'rgba(0,0,0,0)');
  lc.fillStyle = f;
  lc.fillRect(0, 0, W, Y);
  ctx.drawImage(layer, 0, 0);
}

function drawClouds(
  ctx: CanvasRenderingContext2D,
  W: number,
  Y: number,
  u: number,
  P: Palette,
  geo: Rng,
  noise: Noise2,
  quiet: Box | null
) {
  type Cloud = { x: number; y: number; w: number; h: number };
  const clouds: Cloud[] = [];
  for (let i = 0; i < P.clouds * 3 && clouds.length < P.clouds; i++) {
    const w = u * (0.16 + geo() * 0.24) * P.cloudStretch;
    const h = (w / P.cloudStretch) * (0.38 + geo() * 0.16);
    const x = geo() * W;
    const y = Y * (0.14 + geo() * 0.6);
    // keep the sky behind the title clear
    if (quiet && inBox(quiet, x, y, w * 0.45)) continue;
    clouds.push({ x, y, w, h });
  }
  const s = 4;
  const cw = Math.ceil(W / s);
  const ch = Math.ceil(Y / s);
  const c = makeCanvas(cw, ch);
  const cc = ctx2d(c, true);
  const img = cc.createImageData(cw, ch);
  const lit = hex(P.cloudLit);
  const shade = hex(P.cloudShade);
  for (let j = 0; j < ch; j++) {
    for (let i = 0; i < cw; i++) {
      const px = i * s;
      const py = j * s;
      let best = 0;
      let shadeT = 0;
      for (const cl of clouds) {
        const dx = (px - cl.x) / (cl.w / 2);
        const dy = (py - cl.y) / (cl.h / 2);
        if (Math.abs(dx) > 1.6 || Math.abs(dy) > 2.2) continue;
        // billowing top, flat-ish base
        const e = dx * dx + (dy < 0 ? dy * dy * 0.8 : dy * dy * 3.2);
        const n = fbm(noise, px / (u * 0.07), py / (u * 0.07), 4);
        const d = smoothstep(0, P.cloudEdge, 1 - e + n * 0.9);
        if (d > best) {
          best = d;
          shadeT = smoothstep(-0.5, 0.9, dy + n * 0.6);
        }
      }
      if (best <= 0.01) continue;
      const col = mix(lit, shade, shadeT * 0.85);
      const k = (j * cw + i) * 4;
      img.data[k] = col[0];
      img.data[k + 1] = col[1];
      img.data[k + 2] = col[2];
      img.data[k + 3] = best * 245;
    }
  }
  cc.putImageData(img, 0, 0);
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(c, 0, 0, W, Y);
}

function hills(
  ctx: CanvasRenderingContext2D,
  rc: CanvasRenderingContext2D,
  W: number,
  Y: number,
  u: number,
  color: string,
  height: number,
  freq: number,
  noise: Noise2,
  off: number
) {
  const pts: number[] = [];
  for (let x = 0; x <= W + 10; x += 10) {
    const n = fbm(noise, x * freq + off, off, 3);
    pts.push(x, Y - u * height * (0.35 + 0.65 * smoothstep(-0.4, 0.5, n)));
  }
  for (const [c, fill] of [
    [ctx, color],
    [rc, regionFill(REGION.OBJECT)],
  ] as const) {
    c.fillStyle = fill;
    c.beginPath();
    c.moveTo(0, Y + 2);
    for (let i = 0; i < pts.length; i += 2) c.lineTo(pts[i], pts[i + 1]);
    c.lineTo(W, Y + 2);
    c.closePath();
    c.fill();
  }
}

function blob(ctx: CanvasRenderingContext2D, rc: CanvasRenderingContext2D, x: number, y: number, rx: number, ry: number, color: string, id: number) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
  rc.fillStyle = regionFill(id);
  rc.beginPath();
  rc.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  rc.fill();
}

function hedgerows(
  ctx: CanvasRenderingContext2D,
  rc: CanvasRenderingContext2D,
  W: number,
  Y: number,
  u: number,
  P: Palette,
  geo: Rng,
  rng: Rng,
  quiet: Box | null
) {
  let x = -u * 0.02;
  while (x < W) {
    const len = u * (0.08 + geo() * 0.25);
    const gap = u * (0.03 + geo() * 0.12);
    const n = Math.ceil(len / (u * 0.012));
    for (let i = 0; i < n; i++) {
      const bx = x + (i / n) * len;
      const r = u * (0.008 + geo() * 0.012);
      const by = Y - r * 0.6;
      if (quiet && inBox(quiet, bx, by, r)) continue;
      blob(ctx, rc, bx, by, r * 1.2, r, P.hedge[Math.floor(rng() * P.hedge.length)], REGION.FOLIAGE);
    }
    x += len + gap;
  }
}

/** A whitewashed farmhouse with a blue-green door, in a small orchard. */
function farmhouse(ctx: CanvasRenderingContext2D, rc: CanvasRenderingContext2D, x: number, base: number, u: number, P: Palette, rng: Rng) {
  const w = u * 0.078;
  const h = u * 0.036;
  const roofH = u * 0.03;
  for (let i = 0; i < 18; i++) {
    const side = i % 2 ? 1 : -1;
    const bx = x + side * (w * 0.62 + rng() * w * 1.2);
    const r = u * (0.008 + rng() * 0.011);
    const c = rng() < 0.35 ? P.blossom[Math.floor(rng() * P.blossom.length)] : P.hedge[Math.floor(rng() * P.hedge.length)];
    blob(ctx, rc, bx, base - r * (0.8 + rng() * 1.6), r * 1.15, r, c, REGION.FOLIAGE);
  }
  const top = base - h;
  for (const [c, wall, roof] of [
    [ctx, P.house, P.roof],
    [rc, regionFill(REGION.OBJECT), regionFill(REGION.OBJECT)],
  ] as const) {
    c.fillStyle = wall;
    c.fillRect(x - w / 2, top, w, h);
    c.fillStyle = roof;
    c.beginPath();
    c.moveTo(x - w * 0.57, top);
    c.lineTo(x - w * 0.36, top - roofH);
    c.lineTo(x + w * 0.36, top - roofH);
    c.lineTo(x + w * 0.57, top);
    c.closePath();
    c.fill();
    c.fillRect(x + w * 0.18, top - roofH * 1.35, w * 0.07, roofH * 0.5);
  }
  // shade under the eaves
  ctx.fillStyle = css(tone(hex(P.roof), -0.3), 0.3);
  ctx.fillRect(x - w / 2, top, w, h * 0.12);
  // door and windows with shutters
  const dw = w * 0.15;
  const dh = h * 0.66;
  ctx.fillStyle = P.door;
  ctx.fillRect(x - dw / 2, base - dh, dw, dh);
  const ww = w * 0.13;
  const wh = h * 0.36;
  for (const sx of [-0.3, 0.3]) {
    const cx = x + sx * w;
    ctx.fillStyle = '#3E5A6E';
    ctx.fillRect(cx - ww / 2, top + h * 0.3, ww, wh);
    ctx.fillStyle = P.door;
    ctx.fillRect(cx - ww / 2 - ww * 0.45, top + h * 0.3, ww * 0.4, wh);
    ctx.fillRect(cx + ww / 2 + ww * 0.05, top + h * 0.3, ww * 0.4, wh);
  }
  return w;
}

/** Young wheat: a gradient field, furrows running to the horizon, and the
 *  pale bands wind combs through it as it shows the undersides of the blades. */
function field(ctx: CanvasRenderingContext2D, W: number, H: number, Y: number, P: Palette, noise: Noise2, vp: { x: number; y: number }) {
  const s = 3;
  const fw = Math.ceil(W / s);
  const fh = Math.ceil((H - Y) / s);
  const c = makeCanvas(fw, fh);
  const fc = ctx2d(c, true);
  const grad = fc.createLinearGradient(0, 0, 0, fh);
  P.field.forEach(([t, col]) => grad.addColorStop(t, col));
  fc.fillStyle = grad;
  fc.fillRect(0, 0, fw, fh);
  const img = fc.getImageData(0, 0, fw, fh);
  const light = hex(P.wheatLight);
  const dark = hex(P.wheatDark);
  for (let j = 0; j < fh; j++) {
    const t = j / fh;
    const depth = t + 0.04;
    const z = 1 / depth;
    for (let i = 0; i < fw; i++) {
      const lx = ((i * s - vp.x) / W) * depth * 8;
      const k = (j * fw + i) * 4;
      const base: RGB = [img.data[k], img.data[k + 1], img.data[k + 2]];
      const furrow = Math.sin(lx * 14) * 0.5 + 0.5;
      const wave = fbm(noise, lx * 0.9 + z * 0.15, z * 0.55 + 40, 4);
      const patch = fbm(noise, lx * 0.5 + 90, z * 0.3, 3);
      let col = mix(base, dark, smoothstep(0.1, 0.5, patch) * 0.45 + (1 - furrow) * 0.08 * t);
      col = mix(col, light, smoothstep(0.05, 0.4, wave) * P.wind * (0.4 + t * 0.6));
      img.data[k] = col[0];
      img.data[k + 1] = col[1];
      img.data[k + 2] = col[2];
    }
  }
  fc.putImageData(img, 0, 0);
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(c, 0, Y, W, H - Y);
}

function drawPath(
  ctx: CanvasRenderingContext2D,
  rc: CanvasRenderingContext2D,
  W: number,
  H: number,
  Y: number,
  u: number,
  P: Palette,
  door: { x: number; y: number },
  portrait: boolean
) {
  // a farm track winding up to the house
  const bottom = { x: W * (portrait ? 0.36 : 0.42), y: H + u * 0.02 };
  const mid = { x: W * (portrait ? 0.6 : 0.56), y: Y + (H - Y) * 0.42 };
  const end = { x: door.x, y: door.y };
  const pts: { x: number; y: number; w: number }[] = [];
  const N = 40;
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    const a = (1 - t) * (1 - t);
    const b = 2 * (1 - t) * t;
    const c = t * t;
    const x = a * bottom.x + b * mid.x + c * end.x;
    const y = a * bottom.y + b * mid.y + c * end.y;
    const depth = (y - Y) / (H - Y);
    pts.push({ x, y, w: u * (0.006 + 0.13 * Math.pow(Math.max(0, depth), 1.15)) });
  }
  const p = new Path2D();
  pts.forEach((q, i) => (i ? p.lineTo(q.x - q.w, q.y) : p.moveTo(q.x - q.w, q.y)));
  for (let i = pts.length - 1; i >= 0; i--) p.lineTo(pts[i].x + pts[i].w, pts[i].y);
  p.closePath();

  const grad = ctx.createLinearGradient(0, Y, 0, H);
  grad.addColorStop(0, css(mix(hex(P.path), hex(P.haze), 0.5)));
  grad.addColorStop(1, P.path);
  ctx.fillStyle = grad;
  ctx.fill(p);
  // cool shadow along the near edge, grass creeping in
  ctx.save();
  ctx.clip(p);
  ctx.strokeStyle = fade(P.pathShade, 0.55);
  for (let i = 1; i < pts.length; i++) {
    const q = pts[i];
    ctx.lineWidth = Math.max(1, q.w * 0.35);
    ctx.beginPath();
    ctx.moveTo(pts[i - 1].x + pts[i - 1].w, pts[i - 1].y);
    ctx.lineTo(q.x + q.w, q.y);
    ctx.stroke();
  }
  ctx.restore();
  rc.fillStyle = regionFill(REGION.PATH);
  rc.fill(p);
  return { path: p, pts };
}

function puddles(
  ctx: CanvasRenderingContext2D,
  rc: CanvasRenderingContext2D,
  path: ReturnType<typeof drawPath>,
  u: number,
  P: Palette,
  rng: Rng
) {
  const sky = hex(P.sky[0][1]);
  const pale = hex(P.sky[P.sky.length - 1][1]);
  for (const t of [0.18, 0.34, 0.55]) {
    const q = path.pts[Math.round((1 - t) * (path.pts.length - 1))];
    const x = q.x + (rng() - 0.5) * q.w * 0.6;
    const rx = q.w * (0.35 + rng() * 0.3);
    const ry = rx * 0.22;
    const g = ctx.createLinearGradient(0, q.y - ry, 0, q.y + ry);
    g.addColorStop(0, css(pale));
    g.addColorStop(1, css(sky));
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(x, q.y, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = fade('#ffffff', 0.7);
    ctx.lineWidth = Math.max(1, u * 0.002);
    ctx.beginPath();
    ctx.moveTo(x - rx * 0.5, q.y - ry * 0.2);
    ctx.lineTo(x + rx * 0.2, q.y - ry * 0.2);
    ctx.stroke();
    rc.fillStyle = regionFill(REGION.WATER);
    rc.beginPath();
    rc.ellipse(x, q.y, rx, ry, 0, 0, Math.PI * 2);
    rc.fill();
  }
}

function flowers(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  Y: number,
  u: number,
  P: Palette,
  rng: Rng,
  path: ReturnType<typeof drawPath>
) {
  const n = Math.round(700 * P.flowerAmount);
  for (let i = 0; i < n; i++) {
    const t = Math.pow(rng(), 0.55);
    const y = Y + (H - Y) * t;
    const x = rng() * W;
    if (ctx.isPointInPath(path.path, x, y)) continue;
    const r = u * (0.0015 + 0.009 * t * t) * (0.6 + rng() * 0.8);
    const c = P.flowers[Math.floor(rng() * P.flowers.length)];
    ctx.fillStyle = fade(c, 0.75 + rng() * 0.25);
    ctx.beginPath();
    ctx.ellipse(x, y, r * 1.3, r, (rng() - 0.5) * 0.6, 0, Math.PI * 2);
    ctx.fill();
  }
}

function poplars(
  ctx: CanvasRenderingContext2D,
  rc: CanvasRenderingContext2D,
  W: number,
  H: number,
  Y: number,
  u: number,
  P: Palette,
  geo: Rng,
  rng: Rng,
  portrait: boolean
) {
  // a row of poplars along a lane, receding toward the horizon
  const n = portrait ? 6 : 9;
  const near = { x: W * (portrait ? 1.0 : 0.97), base: Y + (H - Y) * 0.07, h: H * 0.46, w: u * 0.058 };
  const far = { x: W * (portrait ? 0.7 : 0.66), base: Y + u * 0.004, h: H * 0.11, w: u * 0.016 };
  const lit = hex(P.poplarLit);
  const body = hex(P.poplar);
  const shade = hex(P.poplarShade);
  for (let i = 0; i < n; i++) {
    const t = Math.pow(i / (n - 1), 1.35);
    const x = far.x + (near.x - far.x) * t + (geo() - 0.5) * u * 0.01;
    const base = far.base + (near.base - far.base) * t;
    const h = (far.h + (near.h - far.h) * t) * (0.9 + geo() * 0.2);
    const w = far.w + (near.w - far.w) * t;
    const lean = P.lean * h * 0.18;

    // shadow thrown across the field, away from the light
    ctx.fillStyle = css(tone(hex(P.wheatDark), -0.1), 0.35);
    ctx.beginPath();
    ctx.ellipse(x + h * 0.25, base + w * 0.15, h * 0.28, w * 0.28, 0.08, 0, Math.PI * 2);
    ctx.fill();

    const crown = new Path2D();
    crown.moveTo(x - w * 0.18, base);
    crown.bezierCurveTo(x - w * 0.62, base - h * 0.3, x - w * 0.45 + lean * 0.5, base - h * 0.75, x + lean, base - h);
    crown.bezierCurveTo(x + w * 0.45 + lean * 0.5, base - h * 0.75, x + w * 0.62, base - h * 0.3, x + w * 0.18, base);
    crown.closePath();
    const g = ctx.createLinearGradient(x - w * 0.5, 0, x + w * 0.5, 0);
    g.addColorStop(0, css(lit));
    g.addColorStop(0.45, css(body));
    g.addColorStop(1, css(shade));
    ctx.fillStyle = g;
    ctx.fill(crown);
    // a few leafy clumps to break the silhouette
    for (let k = 0; k < 6; k++) {
      const ty = base - h * (0.15 + rng() * 0.7);
      const tx = x + lean * ((base - ty) / h) + (rng() - 0.5) * w * 0.8;
      ctx.fillStyle = css(mix(lit, shade, rng()), 0.8);
      ctx.beginPath();
      ctx.ellipse(tx, ty, w * 0.22, h * 0.05, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    rc.fillStyle = regionFill(REGION.POPLAR);
    rc.fill(crown);
  }
}

function grasses(ctx: CanvasRenderingContext2D, W: number, H: number, Y: number, u: number, P: Palette, rng: Rng) {
  const dark = hex(P.wheatDark);
  const light = hex(P.wheatLight);
  for (let i = 0; i < 260; i++) {
    const t = 0.72 + rng() * 0.28;
    const y = Y + (H - Y) * t;
    const x = rng() * W;
    const len = u * (0.02 + rng() * 0.05) * t;
    const lean = (P.lean + (rng() - 0.5) * 0.4) * len;
    ctx.strokeStyle = css(mix(dark, light, rng() * 0.8), 0.7);
    ctx.lineWidth = Math.max(1, u * 0.0025 * t);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.quadraticCurveTo(x + lean * 0.3, y - len * 0.6, x + lean, y - len);
    ctx.stroke();
  }
}
