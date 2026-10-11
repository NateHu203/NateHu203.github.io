import { ctx2d, makeCanvas } from './ref';
import { makeNoise, mulberry32, randomSeed, smoothstep } from './rng';

/** Any CSS colour to RGB, via a 1×1 canvas. */
function parseColor(color: string): [number, number, number] {
  const c = ctx2d(makeCanvas(1, 1), true);
  c.fillStyle = '#fff';
  c.fillStyle = color;
  c.fillRect(0, 0, 1, 1);
  const d = c.getImageData(0, 0, 1, 1).data;
  return [d[0], d[1], d[2]];
}

/** Separable box blur on a float field, `passes` times (≈ gaussian). */
function blurField(src: Float32Array, W: number, H: number, r: number, passes = 2) {
  const a = src;
  const b = new Float32Array(src.length);
  const R = Math.max(1, Math.round(r));
  const norm = 1 / (2 * R + 1);
  for (let p = 0; p < passes; p++) {
    for (let y = 0; y < H; y++) {
      const row = y * W;
      let acc = 0;
      for (let x = -R; x <= R; x++) acc += a[row + Math.min(W - 1, Math.max(0, x))];
      for (let x = 0; x < W; x++) {
        b[row + x] = acc * norm;
        acc += a[row + Math.min(W - 1, x + R + 1)] - a[row + Math.max(0, x - R)];
      }
    }
    for (let x = 0; x < W; x++) {
      let acc = 0;
      for (let y = -R; y <= R; y++) acc += b[Math.min(H - 1, Math.max(0, y)) * W + x];
      for (let y = 0; y < H; y++) {
        a[y * W + x] = acc * norm;
        acc += b[Math.min(H - 1, y + R + 1) * W + x] - b[Math.max(0, y - R) * W + x];
      }
    }
  }
  return a;
}

/**
 * Write `el`'s text into `canvas` in `color`, as a loaded brush would:
 * bristle streaks running along each letter's strokes, thinning and breaking
 * where the brush runs dry. Flat — no relief, no shadow. Returns a function
 * that cancels the reveal.
 */
export function paintName(el: HTMLElement, canvas: HTMLCanvasElement, color: string, animate: boolean): () => void {
  const text = el.textContent?.trim() ?? '';
  const cs = getComputedStyle(el);
  const size = parseFloat(cs.fontSize);
  if (!text || !size) return () => {};

  // baseline: a zero-height inline-block sits on it
  const probe = document.createElement('span');
  probe.style.cssText = 'display:inline-block;width:0;height:0;vertical-align:baseline';
  el.appendChild(probe);
  const baseline = probe.offsetTop;
  probe.remove();

  // small names get full screen resolution; big ones are capped for speed
  const small = size < 48;
  const k = Math.min(window.devicePixelRatio || 1, small ? 3 : 1.75);
  const pad = Math.ceil(size * 0.1);
  const font = `${cs.fontStyle} ${cs.fontWeight} ${size}px ${cs.fontFamily}`;

  const m = ctx2d(makeCanvas(4, 4));
  m.font = font;
  const metrics = m.measureText(text);
  const cssW = Math.ceil(metrics.width + pad * 2);
  const cssH = Math.ceil(baseline + metrics.actualBoundingBoxDescent + pad * 2);
  const W = Math.round(cssW * k);
  const H = Math.round(cssH * k);
  const unit = size * k;

  // the letterforms
  const maskC = makeCanvas(W, H);
  const mx = ctx2d(maskC, true);
  mx.font = font;
  mx.scale(k, k);
  mx.fillStyle = '#fff';
  mx.fillText(text, pad, pad + baseline);
  const md = mx.getImageData(0, 0, W, H).data;
  const mask = new Float32Array(W * H);
  for (let i = 0; i < mask.length; i++) mask[i] = md[i * 4 + 3] / 255;

  // Which way does each stroke of each letter run? The structure tensor of
  // the softened letterforms gives a steady direction along stems and bowls.
  const soft = blurField(mask.slice(), W, H, unit * 0.025);
  const jxx = new Float32Array(W * H);
  const jxy = new Float32Array(W * H);
  const jyy = new Float32Array(W * H);
  for (let y = 1; y < H - 1; y++) {
    for (let x = 1; x < W - 1; x++) {
      const i = y * W + x;
      const gx = soft[i + 1] - soft[i - 1];
      const gy = soft[i + W] - soft[i - W];
      jxx[i] = gx * gx;
      jxy[i] = gx * gy;
      jyy[i] = gy * gy;
    }
  }
  const tr = unit * 0.07;
  blurField(jxx, W, H, tr);
  blurField(jxy, W, H, tr);
  blurField(jyy, W, H, tr);
  const dirAt = (x: number, y: number): [number, number] => {
    const i = Math.min(H - 1, Math.max(0, y | 0)) * W + Math.min(W - 1, Math.max(0, x | 0));
    // the gradient's direction, turned a quarter: along the stroke
    const a = 0.5 * Math.atan2(2 * jxy[i], jxx[i] - jyy[i]) + Math.PI / 2;
    return [Math.cos(a), Math.sin(a)];
  };

  const rng = mulberry32(randomSeed());
  const dry = makeNoise(rng);
  const wander = makeNoise(rng);
  const [cr, cg, cb] = parseColor(color);

  // the letter's edge, softened: bristles decide for themselves where they
  // stop, so the sides of each stroke come out streaky rather than cut
  const edge = blurField(mask.slice(), W, H, unit * 0.012);
  const edgeAt = (x: number, y: number) => {
    const xi = x | 0;
    const yi = y | 0;
    if (xi < 0 || yi < 0 || xi >= W || yi >= H) return 0;
    return edge[yi * W + xi];
  };

  const out = makeCanvas(W, H);
  const oc = ctx2d(out, true);

  // a first, thinner load of paint in the heart of each stroke, so the
  // letters always read; it stops short of the edge, which the bristles make
  const core = oc.createImageData(W, H);
  const cd = core.data;
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const i = y * W + x;
      const e = edge[i];
      if (e < 0.3) continue;
      const n = dry(x / (unit * 0.05), y / (unit * 0.05)) * 0.18;
      const a = smoothstep(0.62, 0.9, e + n);
      if (a <= 0) continue;
      cd[i * 4] = cr;
      cd[i * 4 + 1] = cg;
      cd[i * 4 + 2] = cb;
      cd[i * 4 + 3] = (small ? 150 : 128) * a;
    }
  }
  oc.putImageData(core, 0, 0);
  oc.globalCompositeOperation = 'destination-out';
  // ...broken up where the brush skipped across the canvas weave
  for (let i = 0; i < (W * H) / (unit * unit * 0.0011); i++) {
    const x = rng() * W;
    const y = rng() * H;
    const n = dry(x / (unit * 0.12), y / (unit * 0.04));
    if (n < 0.02) continue;
    oc.fillStyle = `rgba(0,0,0,${(0.35 + rng() * 0.5).toFixed(2)})`;
    oc.beginPath();
    oc.ellipse(x, y, unit * (0.006 + rng() * 0.016), unit * (0.002 + rng() * 0.004), rng() * Math.PI, 0, Math.PI * 2);
    oc.fill();
  }
  oc.globalCompositeOperation = 'source-over';
  oc.lineCap = 'round';
  oc.strokeStyle = `rgb(${cr},${cg},${cb})`;

  // bristles: streaks of white traced along the letter's own direction
  const step = unit * 0.006;
  const seeds = Math.round((W * H) / (unit * unit * (small ? 0.0011 : 0.00042)));
  for (let s = 0; s < seeds; s++) {
    const sx = rng() * W;
    const sy = rng() * H;
    if (edgeAt(sx, sy) < 0.35) continue;
    // where this bristle gives out: some run past the letter's edge, some
    // fall short of it — together they make a ragged, natural margin
    const reach = small ? 0.38 + rng() * 0.3 : 0.12 + rng() * 0.5;
    const drift = (rng() - 0.5) * unit * 0.012;
    const pts: number[] = [];
    for (const sign of [1, -1]) {
      let x = sx;
      let y = sy;
      let [px, py] = dirAt(x, y);
      px *= sign;
      py *= sign;
      const maxSteps = 18 + Math.floor(rng() * 40);
      const half: number[] = [];
      for (let i = 0; i < maxSteps; i++) {
        let [dx, dy] = dirAt(x, y);
        if (dx * px + dy * py < 0) {
          dx = -dx;
          dy = -dy;
        }
        // a bristle never runs perfectly true: it wanders a hair sideways
        const w = wander(x / (unit * 0.1), y / (unit * 0.1)) * 0.35 + drift / (unit * 0.2);
        x += (dx - dy * w) * step;
        y += (dy + dx * w) * step;
        px = dx;
        py = dy;
        if (edgeAt(x, y) < reach && rng() < 0.45) break;
        half.push(x, y);
      }
      if (sign === 1) pts.push(...half);
      else {
        const rev: number[] = [];
        for (let i = half.length - 2; i >= 0; i -= 2) rev.push(half[i], half[i + 1]);
        pts.unshift(...rev, sx, sy);
      }
    }
    if (pts.length < 8) continue;
    // at small sizes, keep bristles at least a hair wide so the texture shows
    const width = Math.max(k * 0.6, unit * (small ? 0.008 + rng() * 0.016 : 0.003 + rng() * 0.009));
    // some bristles carry plenty of paint, some are nearly dry
    const alpha = rng() < 0.3 ? 0.15 + rng() * 0.25 : 0.55 + rng() * 0.45;
    const n = pts.length / 2;
    // the bristle lands full and lifts off thin
    for (let i = 1; i < n; i++) {
      const t = i / (n - 1);
      const lift = smoothstep(0, 0.12, t) * (1 - smoothstep(0.7, 1, t));
      if (lift <= 0.02) continue;
      oc.globalAlpha = alpha * lift;
      oc.lineWidth = width * (0.55 + 0.45 * lift);
      oc.beginPath();
      oc.moveTo(pts[(i - 1) * 2], pts[(i - 1) * 2 + 1]);
      oc.lineTo(pts[i * 2], pts[i * 2 + 1]);
      oc.stroke();
    }
  }
  oc.globalAlpha = 1;

  canvas.width = W;
  canvas.height = H;
  canvas.style.width = `${cssW}px`;
  canvas.style.height = `${cssH}px`;
  canvas.style.left = `${-pad}px`;
  canvas.style.top = `${-pad}px`;
  const ctx = ctx2d(canvas);
  ctx.clearRect(0, 0, W, H);

  if (!animate) {
    ctx.drawImage(out, 0, 0);
    return () => {};
  }

  // written left to right, like a brush drawn across the canvas
  const DURATION = 1100;
  const feather = W * 0.16;
  let raf = 0;
  const t0 = performance.now();
  const tick = (now: number) => {
    const t = Math.min(1, (now - t0) / DURATION);
    const e = 1 - Math.pow(1 - t, 3);
    const front = -feather + (W + feather * 2) * e;
    ctx.globalCompositeOperation = 'source-over';
    ctx.clearRect(0, 0, W, H);
    ctx.drawImage(out, 0, 0);
    ctx.globalCompositeOperation = 'destination-in';
    const g = ctx.createLinearGradient(front - feather, 0, front, 0);
    g.addColorStop(0, 'rgba(0,0,0,1)');
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
    ctx.globalCompositeOperation = 'source-over';
    if (t < 1) raf = requestAnimationFrame(tick);
  };
  raf = requestAnimationFrame(tick);
  return () => cancelAnimationFrame(raf);
}
