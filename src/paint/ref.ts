import type { RGB } from './color';

interface Level {
  data: Uint8ClampedArray;
  w: number;
  h: number;
  /** painting-buffer pixels per level pixel */
  f: number;
}

export function makeCanvas(w: number, h: number) {
  const c = document.createElement('canvas');
  c.width = Math.max(1, Math.round(w));
  c.height = Math.max(1, Math.round(h));
  return c;
}

export function ctx2d(c: HTMLCanvasElement, readback = false) {
  const ctx = c.getContext('2d', readback ? { willReadFrequently: true } : undefined);
  if (!ctx) throw new Error('2D canvas unavailable');
  return ctx;
}

/**
 * The reference image a painting is made from, kept as a blur pyramid.
 * Coarse brushes read coarse levels, fine brushes read sharp ones — the
 * same trick as Hertzmann's "Painterly Rendering with Curved Brush Strokes
 * of Multiple Sizes" (SIGGRAPH '98).
 */
export class Ref {
  levels: Level[] = [];
  region: Uint8Array | null = null;
  private rw = 0;
  private rh = 0;
  private rf = 1;

  /** `regionStep`: region ids are encoded in the red channel as id × step */
  constructor(src: HTMLCanvasElement, bufW: number, region?: HTMLCanvasElement, regionStep = 36) {
    let canvas = src;
    for (let i = 0; i < 7; i++) {
      const ctx = ctx2d(canvas, true);
      const { width: w, height: h } = canvas;
      this.levels.push({ data: ctx.getImageData(0, 0, w, h).data, w, h, f: bufW / w });
      if (w < 24 || h < 24) break;
      const next = makeCanvas(Math.ceil(w / 2), Math.ceil(h / 2));
      const nctx = ctx2d(next, true);
      nctx.imageSmoothingQuality = 'high';
      nctx.drawImage(canvas, 0, 0, next.width, next.height);
      canvas = next;
    }
    if (region) {
      const d = ctx2d(region, true).getImageData(0, 0, region.width, region.height).data;
      this.region = new Uint8Array(region.width * region.height);
      for (let i = 0; i < this.region.length; i++) this.region[i] = Math.round(d[i * 4] / regionStep);
      this.rw = region.width;
      this.rh = region.height;
      this.rf = bufW / region.width;
    }
  }

  /** Pyramid level whose pixels are about half the brush radius. */
  levelFor(r: number) {
    const f0 = this.levels[0].f;
    const lv = Math.round(Math.log2(Math.max(1, r / 2 / f0)));
    return Math.max(0, Math.min(this.levels.length - 1, lv));
  }

  color(level: number, x: number, y: number): RGB {
    const L = this.levels[level];
    const fx = Math.max(0, Math.min(L.w - 1.001, x / L.f - 0.5));
    const fy = Math.max(0, Math.min(L.h - 1.001, y / L.f - 0.5));
    const x0 = fx | 0;
    const y0 = fy | 0;
    const tx = fx - x0;
    const ty = fy - y0;
    const d = L.data;
    const i00 = (y0 * L.w + x0) * 4;
    const i10 = i00 + 4;
    const i01 = i00 + L.w * 4;
    const i11 = i01 + 4;
    const out: RGB = [0, 0, 0];
    for (let k = 0; k < 3; k++) {
      const a = d[i00 + k] + (d[i10 + k] - d[i00 + k]) * tx;
      const b = d[i01 + k] + (d[i11 + k] - d[i01 + k]) * tx;
      out[k] = a + (b - a) * ty;
    }
    return out;
  }

  private lum(L: Level, x: number, y: number) {
    const xi = Math.max(0, Math.min(L.w - 1, x | 0));
    const yi = Math.max(0, Math.min(L.h - 1, y | 0));
    const i = (yi * L.w + xi) * 4;
    return 0.3 * L.data[i] + 0.59 * L.data[i + 1] + 0.11 * L.data[i + 2];
  }

  /** Luminance gradient (Sobel) at a level, in luminance units per level pixel. */
  grad(level: number, x: number, y: number): [number, number] {
    const L = this.levels[level];
    const lx = x / L.f;
    const ly = y / L.f;
    const tl = this.lum(L, lx - 1, ly - 1);
    const tc = this.lum(L, lx, ly - 1);
    const tr = this.lum(L, lx + 1, ly - 1);
    const ml = this.lum(L, lx - 1, ly);
    const mr = this.lum(L, lx + 1, ly);
    const bl = this.lum(L, lx - 1, ly + 1);
    const bc = this.lum(L, lx, ly + 1);
    const br = this.lum(L, lx + 1, ly + 1);
    return [(tr + 2 * mr + br - tl - 2 * ml - bl) / 8, (bl + 2 * bc + br - tl - 2 * tc - tr) / 8];
  }

  regionAt(x: number, y: number) {
    if (!this.region) return 0;
    const xi = Math.max(0, Math.min(this.rw - 1, (x / this.rf) | 0));
    const yi = Math.max(0, Math.min(this.rh - 1, (y / this.rf) | 0));
    return this.region[yi * this.rw + xi];
  }
}
