import { Impasto, shadeOnce, STILL, type Camera } from './impasto';
import { drawStroke, PaintJob, planLayer, setupBrush, type Layer, type Phase, type Stroke, type Style, type StyleAt } from './painter';
import { ctx2d, makeCanvas, Ref } from './ref';
import { makeNoise, mulberry32, randomSeed, smoothstep } from './rng';
import { drawScene, PALETTES, REGION, REGION_STEP, type Box, type Mood } from './scene';

export const PRIMER = '#AEBBB4';

interface Options {
  /** the page block the painting sits behind */
  stage: HTMLElement;
  /** the title block — the sky behind it is kept calm */
  quiet: HTMLElement;
  mood: Mood;
  reduced: boolean;
  onFail?: (err: unknown) => void;
  /** a painting (first or repaint) has finished */
  onPainted?: () => void;
}

/** Where things sit in the painting, 0..1 of its width and height. */
export interface SceneLayout {
  horizon: number;
  door: { x: number; y: number };
  houseW: number;
}

// a fixed, high, soft light: the paint reads as smooth, blended colour with
// only a whisper of brush texture — no raised relief
const LIGHT = { x: 0.3, y: -0.8 };
const RELIEF = 0.7;

/**
 * The hero painting: a scene, painted coarse-to-fine onto a colour canvas and
 * a height canvas, then shown through WebGL so the view can glide into it.
 */
export class HeroPainting {
  private host: HTMLElement;
  private opts: Options;
  private gl: Impasto | null = null;
  private display: HTMLCanvasElement;
  private color = makeCanvas(1, 1);
  private height = makeCanvas(1, 1);
  private cctx = ctx2d(this.color);
  private hctx = ctx2d(this.height);
  private k = 1;
  private cssW = 0;
  private cssH = 0;
  private seed = randomSeed();
  private mood: Mood;
  private job: PaintJob | null = null;
  private raf = 0;
  private uploadPending = false;
  private needsRender = false;
  private visible = true;
  private destroyed = false;
  private started = false;
  private ro: ResizeObserver;
  private io: IntersectionObserver;
  private resizeTimer = 0;
  private cam: Camera = STILL;
  layout: SceneLayout | null = null;

  constructor(host: HTMLElement, opts: Options) {
    this.host = host;
    this.opts = opts;
    this.mood = opts.mood;

    this.display = document.createElement('canvas');
    try {
      this.gl = new Impasto(this.display);
    } catch {
      this.gl = null;
      this.display = this.color;
    }
    this.display.setAttribute('aria-hidden', 'true');
    host.appendChild(this.display);

    this.ro = new ResizeObserver(() => this.onResize());
    this.ro.observe(host);
    this.io = new IntersectionObserver(([e]) => {
      this.visible = e.isIntersecting;
      if (this.visible) this.schedule();
    });
    this.io.observe(host);

    this.measure();
    this.allocate();
    this.prime();
    this.render();
    // the title block must be laid out in its final font before we measure it
    Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 2000))]).then(() => {
      if (this.destroyed) return;
      this.started = true;
      this.paint(!opts.reduced, true);
    });
  }

  destroy() {
    this.destroyed = true;
    cancelAnimationFrame(this.raf);
    window.clearTimeout(this.resizeTimer);
    this.ro.disconnect();
    this.io.disconnect();
    this.display.remove();
  }

  setMood(mood: Mood) {
    if (mood === this.mood) return;
    this.mood = mood;
    if (this.started) this.paint(!this.opts.reduced, false);
  }

  /** Move the viewer: 0..1 zoom/walk come from the page's scroll position. */
  setCamera(cam: Camera) {
    this.cam = cam;
    this.needsRender = true;
    this.schedule();
  }

  // ── sizing ──

  private measure() {
    this.cssW = Math.max(1, this.host.clientWidth);
    this.cssH = Math.max(1, this.host.clientHeight);
    let k = Math.min(window.devicePixelRatio || 1, 1.5);
    const budget = 3.4e6;
    if (this.cssW * this.cssH * k * k > budget) k = Math.sqrt(budget / (this.cssW * this.cssH));
    this.k = k;
  }

  private allocate() {
    const w = Math.round(this.cssW * this.k);
    const h = Math.round(this.cssH * this.k);
    this.color.width = w;
    this.color.height = h;
    this.height.width = w;
    this.height.height = h;
    this.gl?.resize(w, h);
  }

  private prime() {
    for (const ctx of [this.cctx, this.hctx]) {
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';
      ctx.filter = 'none';
    }
    this.cctx.fillStyle = PRIMER;
    this.cctx.fillRect(0, 0, this.color.width, this.color.height);
    this.hctx.fillStyle = 'rgb(30,30,30)';
    this.hctx.fillRect(0, 0, this.height.width, this.height.height);
    this.uploadPending = true;
    this.needsRender = true;
  }

  private onResize() {
    window.clearTimeout(this.resizeTimer);
    this.resizeTimer = window.setTimeout(() => {
      const w = this.host.clientWidth;
      const h = this.host.clientHeight;
      // ignore the mobile URL bar sliding in and out
      if (Math.abs(w - this.cssW) < 2 && Math.abs(h - this.cssH) < 140) return;
      this.measure();
      this.allocate();
      this.prime();
      if (this.started) this.paint(false, false);
    }, 220);
  }

  // ── painting ──

  private quietBox(scale: number): Box | null {
    const r = this.opts.quiet.getBoundingClientRect();
    const h = this.host.getBoundingClientRect();
    if (!r.width) return null;
    return {
      x: (r.left - h.left) * scale,
      y: (r.top - h.top) * scale,
      w: r.width * scale,
      h: r.height * scale,
    };
  }

  private layers(): Layer[] {
    const s = this.k;
    const big = Math.min(1.25, Math.max(0.7, Math.min(this.cssW, this.cssH) / 820));
    return [
      { r: 30 * s * big, fill: 1, detail: 0, maxLen: 7, minLen: 2, stop: 46, bristles: 9, height: [0.2, 0.32], alpha: 0.94 },
      { r: 17 * s * big, fill: 0.8, detail: 5, maxLen: 6, minLen: 1, stop: 38, bristles: 7, height: [0.3, 0.42], alpha: 0.9 },
      { r: 9 * s * big, fill: 0.32, detail: 8, maxLen: 5, minLen: 1, stop: 32, bristles: 5, height: [0.36, 0.48], alpha: 0.9 },
      { r: 4.6 * s, fill: 0.08, detail: 12, maxLen: 4, minLen: 1, stop: 28, bristles: 3, height: [0.4, 0.5], alpha: 0.9 },
      { r: 2.5 * s, fill: 0.01, detail: 18, maxLen: 3, minLen: 0, stop: 24, bristles: 2, height: [0.42, 0.52], alpha: 0.92 },
    ];
  }

  /** How the brush moves over each subject. */
  private styleFor(ref: Ref, horizon: number): StyleAt {
    const noise = makeNoise(mulberry32(this.seed + 3));
    const k = this.k;
    const W = this.color.width;
    const H = this.color.height;
    const P = PALETTES[this.mood];
    const vp = { x: W * (H > W * 1.05 ? 0.5 : 0.46), y: horizon };
    const S: Record<number, Style> = {
      [REGION.SKY]: { angle: 0, follow: 0.4, len: 1.6, hue: 6, sat: 0.1, light: 0.035, fleck: 0.02, density: 0.45, tol: 1.7, texture: 0.55 },
      [REGION.WATER]: { angle: 0, follow: 0.1, len: 0.8, hue: 6, sat: 0.12, light: 0.05, fleck: 0.02, density: 1.2, tol: 1 },
      [REGION.OBJECT]: { angle: 0, follow: 0.9, len: 0.7, hue: 4, sat: 0.08, light: 0.03, fleck: 0, density: 1, tol: 1 },
      [REGION.FOLIAGE]: { angle: 0, follow: 0.35, len: 0.45, hue: 12, sat: 0.18, light: 0.07, fleck: 0.05, density: 1.5, tol: 1.2 },
      [REGION.FIELD]: { angle: 0, follow: 0.25, len: 1, hue: 11, sat: 0.18, light: 0.06, fleck: 0.06, density: 1.15, tol: 1.15 },
      [REGION.PATH]: { angle: 0, follow: 0.5, len: 0.8, hue: 6, sat: 0.1, light: 0.05, fleck: 0.03, density: 1, tol: 1 },
      [REGION.POPLAR]: { angle: 0, follow: 0.4, len: 0.6, hue: 10, sat: 0.16, light: 0.06, fleck: 0.04, density: 1.3, tol: 1.1 },
    };
    const q = this.quietBox(k);
    const calm: Style = { ...S[REGION.SKY], density: 0.2, len: 2, fleck: 0, light: 0.025, texture: 0.35 };
    const skySwing = 0.5 + P.lean;

    return (x, y) => {
      const reg = ref.regionAt(x, y);
      const n = noise((x / k) * 0.006, (y / k) * 0.006);
      if (reg === REGION.SKY) {
        const inQuiet = q && x > q.x && x < q.x + q.w && y > q.y && y < q.y + q.h;
        const st = inQuiet ? calm : S[REGION.SKY];
        st.angle = n * skySwing;
        return st;
      }
      const st = S[reg] ?? S[REGION.FIELD];
      switch (reg) {
        case REGION.FIELD: {
          // distant wheat lies in flat bands; near wheat stands up as blades
          const t = Math.max(0, Math.min(1, (y - horizon) / (H - horizon)));
          const up = smoothstep(0.2, 0.85, t);
          st.angle = (-Math.PI / 2 + P.lean) * up + n * (0.15 + up * 0.35);
          st.len = 1.05 - up * 0.45;
          break;
        }
        case REGION.PATH:
          st.angle = Math.atan2(vp.y - y, vp.x - x) + n * 0.2;
          break;
        case REGION.POPLAR:
          st.angle = -Math.PI / 2 + P.lean * 0.5 + n * 0.25;
          break;
        case REGION.FOLIAGE:
          st.angle = n * 4;
          break;
        default:
          st.angle = n * 0.2;
      }
      return st;
    };
  }

  private paint(animate: boolean, first: boolean) {
    try {
      const W = this.color.width;
      const H = this.color.height;
      const refC = makeCanvas(W / 2, H / 2);
      const regC = makeCanvas(W / 2, H / 2);
      const toRef = refC.width / W;
      const quiet = this.quietBox(this.k * toRef);
      const { horizon, door, houseW } = drawScene(refC, regC, this.mood, this.seed, quiet);
      this.layout = {
        horizon: horizon / refC.height,
        door: { x: door.x / refC.width, y: door.y / refC.height },
        houseW: houseW / refC.width,
      };
      const ref = new Ref(refC, W, regC, REGION_STEP);
      const rng = mulberry32(randomSeed());
      const styleAt = this.styleFor(ref, horizon / toRef);
      const durations = first ? [700, 800, 900, 800, 550] : [450, 500, 580, 500, 360];

      const phases: Phase[] = this.layers().map((L, i) => {
        let strokes: Stroke[] = [];
        return {
          duration: durations[i],
          start: () => {
            strokes = planLayer(ref, L, W, H, rng, styleAt);
            setupBrush(this.cctx);
            setupBrush(this.hctx);
            return strokes.length;
          },
          draw: (a, b) => {
            for (let j = a; j < b; j++) drawStroke(this.cctx, this.hctx, strokes[j], rng);
          },
        };
      });

      this.job = new PaintJob(phases, !animate);
      this.schedule();
    } catch (err) {
      this.opts.onFail?.(err);
    }
  }

  // ── frame loop ──

  private schedule() {
    if (!this.raf && this.visible && !this.destroyed) this.raf = requestAnimationFrame(this.loop);
  }

  private loop = () => {
    this.raf = 0;
    if (this.destroyed) return;
    const now = performance.now();
    if (this.job) {
      if (this.job.tick(now, 12)) this.uploadPending = true;
      if (this.job.finished) {
        this.job = null;
        if (!this.gl) shadeOnce(this.color, this.height, RELIEF, 0.3);
        this.opts.onPainted?.();
      }
    }
    this.render();
    if (this.job) this.schedule();
  };

  private render(force = false) {
    if (!this.gl) return;
    if (this.uploadPending) {
      this.gl.upload(this.color, this.height);
      this.uploadPending = false;
      force = true;
    }
    if (force || this.needsRender) {
      this.gl.render(LIGHT, RELIEF, this.cam);
      this.needsRender = false;
    }
  }
}
