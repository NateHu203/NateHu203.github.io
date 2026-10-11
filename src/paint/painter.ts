import { css, dist, tone, vary, type RGB } from './color';
import type { Ref } from './ref';
import { shuffle, smoothstep, type Rng } from './rng';

/** One pass of the brush, coarse to fine. Sizes are painting-buffer pixels. */
export interface Layer {
  r: number;
  /** grid spacing as a multiple of r */
  grid?: number;
  /** chance of a stroke where the reference has no new detail at this scale */
  fill: number;
  /** colour difference (vs. the next coarser level) that always earns a stroke */
  detail: number;
  maxLen: number;
  minLen: number;
  /** stop extending once the reference drifts this far from the stroke colour */
  stop: number;
  bristles: number;
  /** paint thickness range, 0..1 — fat over lean, so finer layers sit higher */
  height: [number, number];
  alpha: number;
}

/** How the brush behaves at a point, chosen by the subject (sky, water…). */
export interface Style {
  /** preferred stroke angle in radians */
  angle: number;
  /** 0..1 — how much a strong edge in the reference overrides `angle` */
  follow: number;
  /** multiplier on stroke length */
  len: number;
  hue: number;
  sat: number;
  light: number;
  /** chance of a broken-colour fleck (a bolder hue shift) */
  fleck: number;
  /** multiplier on a layer's `fill` — busier subjects get more small strokes */
  density: number;
  /** multiplier on a layer's `stop` — broad subjects allow longer strokes */
  tol: number;
  /** how strongly bristle streaks show, 0..1 (default 1) */
  texture?: number;
}

export interface Stroke {
  pts: number[];
  r: number;
  color: RGB;
  alpha: number;
  h: number;
  bristles: number;
  /** bristle contrast, 0..1 */
  texture?: number;
}

export type StyleAt = (x: number, y: number) => Style;

export function planLayer(ref: Ref, L: Layer, w: number, h: number, rng: Rng, styleAt: StyleAt): Stroke[] {
  const lv = ref.levelFor(L.r);
  const coarse = Math.min(ref.levels.length - 1, lv + 2);
  const step = L.r * (L.grid ?? 1);
  const out: Stroke[] = [];
  const stepLen = L.r * 0.9;

  for (let gy = -step * 0.5; gy < h + step * 0.5; gy += step) {
    for (let gx = -step * 0.5; gx < w + step * 0.5; gx += step) {
      const px = gx + (rng() - 0.5) * step;
      const py = gy + (rng() - 0.5) * step;
      const c = ref.color(lv, px, py);
      const st = styleAt(px, py);
      if (L.detail > 0) {
        const d = dist(c, ref.color(coarse, px, py));
        if (d < L.detail / st.density && rng() > L.fill * st.density) continue;
      }

      // trace a curved stroke through the field
      const pts = [px, py];
      let a0 = angleAt(ref, lv, px, py, st);
      if (rng() < 0.5) a0 += Math.PI;
      let dx = Math.cos(a0);
      let dy = Math.sin(a0);
      let cx = px;
      let cy = py;
      const maxLen = Math.max(1, Math.round(L.maxLen * st.len * (0.6 + rng() * 0.6)));
      for (let i = 0; i < maxLen; i++) {
        const a = angleAt(ref, lv, cx, cy, st);
        let nx = Math.cos(a);
        let ny = Math.sin(a);
        if (nx * dx + ny * dy < 0) {
          nx = -nx;
          ny = -ny;
        }
        // curvature filter keeps strokes from kinking
        nx = dx * 0.5 + nx * 0.5;
        ny = dy * 0.5 + ny * 0.5;
        const n = Math.hypot(nx, ny) || 1;
        nx /= n;
        ny /= n;
        const tx = cx + nx * stepLen;
        const ty = cy + ny * stepLen;
        if (i >= L.minLen && dist(ref.color(lv, tx, ty), c) > L.stop * st.tol) break;
        cx = tx;
        cy = ty;
        dx = nx;
        dy = ny;
        pts.push(cx, cy);
      }
      if (pts.length === 2) {
        // a dab: short, but still oriented
        const k = L.r * 0.55;
        pts.splice(0, 2, px - dx * k, py - dy * k, px + dx * k, py + dy * k);
      }

      let color = vary(c, rng, st.hue, st.sat, st.light);
      // flecks belong to the smaller strokes; on a broad one they'd read as a blot
      if (L.detail > 0 && st.fleck > 0 && rng() < st.fleck) {
        color = vary(color, rng, 38, 0.3, 0.06, 1.15);
      }
      out.push({
        pts,
        r: L.r * (0.8 + rng() * 0.35),
        color,
        alpha: L.alpha,
        h: thickness(L, st.texture ?? 1, rng),
        bristles: L.bristles,
        texture: st.texture ?? 1,
      });
    }
  }
  return shuffle(out, rng);
}

/** Paint thickness for a stroke; smooth subjects (texture < 1) are laid flatter. */
function thickness(L: Layer, tex: number, rng: Rng) {
  const mid = (L.height[0] + L.height[1]) / 2;
  const spread = (L.height[1] - L.height[0]) * (rng() - 0.5);
  return 0.3 + (mid - 0.3) * tex + spread * tex;
}

function angleAt(ref: Ref, lv: number, x: number, y: number, st: Style) {
  if (st.follow <= 0) return st.angle;
  const [gx, gy] = ref.grad(lv, x, y);
  const mag = Math.hypot(gx, gy);
  const w = st.follow * smoothstep(1.5, 8, mag);
  if (w <= 0.001) return st.angle;
  // strokes run along edges: perpendicular to the gradient. Blend angles in
  // doubled-angle space, since a stroke at θ and θ+π is the same stroke.
  const ga = Math.atan2(gy, gx) + Math.PI / 2;
  const vx = (1 - w) * Math.cos(2 * st.angle) + w * Math.cos(2 * ga);
  const vy = (1 - w) * Math.sin(2 * st.angle) + w * Math.sin(2 * ga);
  return Math.atan2(vy, vx) / 2;
}

/** Sample a smooth centreline (Catmull-Rom) through the control points. */
function centerline(p: number[], spacing: number): number[] {
  const n = p.length / 2;
  const out: number[] = [];
  const at = (i: number) => {
    const k = Math.max(0, Math.min(n - 1, i)) * 2;
    return [p[k], p[k + 1]];
  };
  for (let i = 0; i < n - 1; i++) {
    const [x0, y0] = at(i - 1);
    const [x1, y1] = at(i);
    const [x2, y2] = at(i + 1);
    const [x3, y3] = at(i + 2);
    const steps = Math.max(2, Math.ceil(Math.hypot(x2 - x1, y2 - y1) / spacing));
    for (let j = 0; j < steps; j++) {
      const t = j / steps;
      const t2 = t * t;
      const t3 = t2 * t;
      out.push(
        0.5 * (2 * x1 + (-x0 + x2) * t + (2 * x0 - 5 * x1 + 4 * x2 - x3) * t2 + (-x0 + 3 * x1 - 3 * x2 + x3) * t3),
        0.5 * (2 * y1 + (-y0 + y2) * t + (2 * y0 - 5 * y1 + 4 * y2 - y3) * t2 + (-y0 + 3 * y1 - 3 * y2 + y3) * t3)
      );
    }
  }
  out.push(p[(n - 1) * 2], p[(n - 1) * 2 + 1]);
  return out;
}

const gray = (v: number) => {
  const g = Math.round(Math.max(0, Math.min(1, v)) * 255);
  return `rgb(${g},${g},${g})`;
};

/**
 * Lay one stroke: a ribbon of paint that lands full and drags thin, with
 * bristle streaks through it, and its thickness on the height canvas.
 */
export function drawStroke(c: CanvasRenderingContext2D, hc: CanvasRenderingContext2D, s: Stroke, rng: Rng) {
  const line = centerline(s.pts, Math.max(1, s.r * 0.45));
  const m = line.length / 2;
  const nx = new Float32Array(m);
  const ny = new Float32Array(m);
  const w = new Float32Array(m);
  const tail = 0.35 + rng() * 0.4;
  const load = 0.9 + rng() * 0.2;
  for (let i = 0; i < m; i++) {
    const a = Math.max(0, i - 1);
    const b = Math.min(m - 1, i + 1);
    const dx = line[b * 2] - line[a * 2];
    const dy = line[b * 2 + 1] - line[a * 2 + 1];
    const len = Math.hypot(dx, dy) || 1;
    nx[i] = -dy / len;
    ny[i] = dx / len;
    const t = m > 1 ? i / (m - 1) : 0;
    const land = t < 0.18 ? 0.78 + 0.22 * (t / 0.18) : 1;
    const drag = 1 - (1 - tail) * smoothstep(0.5, 1, t);
    w[i] = s.r * load * land * drag * (0.94 + rng() * 0.12);
  }

  const ribbon = (ctx: CanvasRenderingContext2D) => {
    ctx.beginPath();
    for (let i = 0; i < m; i++) ctx.lineTo(line[i * 2] + nx[i] * w[i], line[i * 2 + 1] + ny[i] * w[i]);
    for (let i = m - 1; i >= 0; i--) ctx.lineTo(line[i * 2] - nx[i] * w[i], line[i * 2 + 1] - ny[i] * w[i]);
    ctx.closePath();
    ctx.fill();
    // where the loaded brush first touched down
    ctx.beginPath();
    ctx.arc(line[0], line[1], w[0], 0, Math.PI * 2);
    ctx.fill();
  };

  c.globalAlpha = s.alpha;
  c.fillStyle = css(s.color);
  ribbon(c);

  // thickness: each stroke settles toward its own height, so newer, fatter
  // paint stands proud of the lean layers beneath it
  hc.globalAlpha = 0.8;
  hc.fillStyle = gray(s.h);
  ribbon(hc);

  for (let b = 0; b < s.bristles; b++) {
    const o = rng() * 2 - 1;
    const i0 = Math.floor(rng() * 0.12 * m);
    const i1 = Math.max(i0 + 2, Math.ceil((0.6 + rng() * 0.42) * m));
    const bw = Math.max(0.7, s.r * (0.07 + rng() * 0.16));
    const path = (ctx: CanvasRenderingContext2D) => {
      ctx.beginPath();
      for (let i = i0; i < Math.min(m, i1); i++) {
        const k = o * w[i] * 0.9;
        ctx.lineTo(line[i * 2] + nx[i] * k, line[i * 2 + 1] + ny[i] * k);
      }
      ctx.stroke();
    };
    const tex = s.texture ?? 1;
    const t = (rng() * 2 - 1) * 0.13 * tex;
    c.globalAlpha = 0.22 + rng() * 0.3;
    c.strokeStyle = css(tone(s.color, t));
    c.lineWidth = bw;
    path(c);

    hc.globalAlpha = 0.7;
    hc.strokeStyle = gray(s.h + (t > 0 ? 0.05 : -0.05) * (0.5 + rng()) * tex);
    hc.lineWidth = bw;
    path(hc);
  }
}

export function setupBrush(ctx: CanvasRenderingContext2D) {
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.globalCompositeOperation = 'source-over';
}

/**
 * A phase of a painting: some number of units of work spread over a duration.
 * `draw(from, to)` paints units [from, to).
 */
export interface Phase {
  duration: number;
  start(): number;
  draw(from: number, to: number): void;
  /** called once per tick after drawing, for phases that composite */
  flush?(): void;
}

/** Runs phases one after another, pacing each to its duration but never
 *  spending more than a frame budget per tick. */
export class PaintJob {
  private i = -1;
  private total = 0;
  private done = 0;
  private t0 = 0;
  finished = false;

  constructor(private phases: Phase[], private instant = false) {}

  /** Returns true if anything was painted this tick. */
  tick(now: number, budget = 10): boolean {
    if (this.finished) return false;
    const until = performance.now() + budget;
    let painted = false;
    const touched = new Set<Phase>();
    while (performance.now() < until) {
      if (this.i < 0 || this.done >= this.total) {
        const ph = this.phases[this.i];
        if (ph && !this.instant && now - this.t0 < ph.duration) break; // let the phase breathe
        this.i++;
        if (this.i >= this.phases.length) {
          this.finished = true;
          break;
        }
        this.total = this.phases[this.i].start();
        this.done = 0;
        this.t0 = now;
        continue;
      }
      const ph = this.phases[this.i];
      const p = this.instant || ph.duration <= 0 ? 1 : Math.min(1, (now - this.t0) / ph.duration);
      const target = Math.ceil(this.total * p);
      if (this.done >= target) break;
      const to = Math.min(target, this.done + 24);
      ph.draw(this.done, to);
      this.done = to;
      painted = true;
      touched.add(ph);
    }
    touched.forEach((ph) => ph.flush?.());
    return painted;
  }
}
