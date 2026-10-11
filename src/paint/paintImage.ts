import { shadeOnce } from './impasto';
import { drawStroke, planLayer, setupBrush, type Layer, type Style } from './painter';
import { ctx2d, makeCanvas, Ref } from './ref';
import { makeNoise, mulberry32, randomSeed } from './rng';

const yieldToBrowser = () => new Promise<void>((r) => setTimeout(r, 0));

// one painting at a time, so a page of them never stalls scrolling
let queue: Promise<unknown> = Promise.resolve();

function enqueue<T>(job: () => Promise<T>) {
  const run = queue.then(job);
  queue = run.catch(() => undefined);
  return run;
}

export interface PaintImageOptions {
  fit: 'cover' | 'contain';
  /** background behind a contained image */
  ground?: string;
}

/**
 * Re-paint a photo or figure as a small oil sketch: the same coarse-to-fine
 * brush as the hero, with strokes that swirl along a flow field and follow
 * strong edges, then lit once from the upper left.
 */
export function paintImage(img: HTMLImageElement, cssW: number, cssH: number, opts: PaintImageOptions) {
  return enqueue(() => {
    const k = Math.min(window.devicePixelRatio || 1, 1.5);
    const W = Math.max(8, Math.round(Math.min(cssW * k, 1100)));
    const H = Math.max(8, Math.round((W * cssH) / cssW));
    const refC = makeCanvas(W, H);
    const rx = ctx2d(refC, true);
    rx.fillStyle = opts.ground ?? '#7d7a76';
    rx.fillRect(0, 0, W, H);
    const iw = img.naturalWidth || W;
    const ih = img.naturalHeight || H;
    const s = opts.fit === 'cover' ? Math.max(W / iw, H / ih) : Math.min(W / iw, H / ih) * 0.82;
    rx.imageSmoothingQuality = 'high';
    rx.drawImage(img, (W - iw * s) / 2, (H - ih * s) / 2, iw * s, ih * s);
    return paintRef(refC);
  });
}

export interface PaintRefOptions {
  /** coarsest brush radius as a fraction of the longer side (default 1/24) */
  brush?: number;
  relief?: number;
  strength?: number;
}

/** Queue a reference canvas to be painted (see `paintRef`). */
export function paintCanvas(refC: HTMLCanvasElement, opts?: PaintRefOptions) {
  return enqueue(() => paintRef(refC, opts));
}

/** Paint a reference canvas at its own size and return the lit painting. */
async function paintRef(refC: HTMLCanvasElement, opts: PaintRefOptions = {}) {
  const W = refC.width;
  const H = refC.height;
  const ref = new Ref(refC, W);
  const color = makeCanvas(W, H);
  const height = makeCanvas(W, H);
  const cc = ctx2d(color, true);
  const hc = ctx2d(height, true);
  cc.drawImage(refC, 0, 0);
  hc.fillStyle = 'rgb(30,30,30)';
  hc.fillRect(0, 0, W, H);
  setupBrush(cc);
  setupBrush(hc);

  const seed = randomSeed();
  const rng = mulberry32(seed);
  const noise = makeNoise(mulberry32(seed + 1));
  const style: Style = { angle: 0, follow: 0.85, len: 1, hue: 8, sat: 0.14, light: 0.05, fleck: 0.03, density: 1, tol: 1 };
  const styleAt = (x: number, y: number) => {
    style.angle = noise(x * 0.006, y * 0.006) * Math.PI * 0.9;
    return style;
  };

  const r0 = Math.max(W, H) * (opts.brush ?? 1 / 24);
  const layers: Layer[] = [
    { r: r0, fill: 1, detail: 0, maxLen: 6, minLen: 1, stop: 44, bristles: 7, height: [0.2, 0.3], alpha: 0.94 },
    { r: r0 / 2, fill: 0.35, detail: 6, maxLen: 5, minLen: 1, stop: 36, bristles: 5, height: [0.28, 0.38], alpha: 0.9 },
    { r: r0 / 4, fill: 0.08, detail: 10, maxLen: 4, minLen: 1, stop: 30, bristles: 3, height: [0.33, 0.42], alpha: 0.9 },
    { r: Math.max(1.6, r0 / 8), fill: 0.02, detail: 18, maxLen: 3, minLen: 0, stop: 26, bristles: 1, height: [0.36, 0.44], alpha: 0.92 },
  ];

  for (const L of layers) {
    const strokes = planLayer(ref, L, W, H, rng, styleAt);
    for (let i = 0; i < strokes.length; i++) {
      drawStroke(cc, hc, strokes[i], rng);
      if (i % 350 === 349) await yieldToBrowser();
    }
    await yieldToBrowser();
  }
  shadeOnce(color, height, opts.relief ?? 0.9, opts.strength ?? 0.25);
  return color;
}
