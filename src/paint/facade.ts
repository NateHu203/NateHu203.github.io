import { css, hex, mix, tone } from './color';
import { paintCanvas } from './paintImage';
import { ctx2d, makeCanvas } from './ref';
import { mulberry32, randomSeed, type Rng } from './rng';
import { PALETTES, type Mood } from './scene';

/** The house itself is drawn in a 1000-unit frame, set inside a wider
 *  margin of orchard and sky so the close-up fills the view sooner. */
const INSET = { x: 300, y: 230 };

/**
 * The farmhouse up close, for the moment the walk arrives at its door.
 * Laid out in design units; `anchor` (the foot of the door) and `houseW`
 * line it up with the little house in the field painting.
 */
export const FACADE = {
  W: 1600,
  H: 1200,
  houseW: 640,
  anchor: { x: INSET.x + 500, y: INSET.y + 615 },
  door: { x: INSET.x + 452, y: INSET.y + 417, w: 96, h: 198 },
};

export interface FacadeArt {
  mood: Mood;
  wall: HTMLCanvasElement;
}

type P = (typeof PALETTES)[Mood];

export async function paintFacade(mood: Mood): Promise<FacadeArt> {
  const P = PALETTES[mood];
  const S = Math.min(1.9, 1.3 * Math.min(window.devicePixelRatio || 1, 1.5));
  const rng = mulberry32(randomSeed());

  const ref = makeCanvas(FACADE.W * S, FACADE.H * S);
  const c = ctx2d(ref);
  c.scale(S, S);
  drawSurroundings(c, P, rng);
  c.translate(INSET.x, INSET.y);
  drawFront(c, P, rng, wallColor());

  // flat colour, blended: shading kept to a whisper
  const wall = await paintCanvas(ref, { brush: 1 / 46, relief: 0.8, strength: 0.25 });
  return { mood, wall };
}

/** The page's wall colour, so the room inside matches where the walk ends. */
function wallColor() {
  const v = getComputedStyle(document.documentElement).getPropertyValue('--wall').trim();
  return /^#[0-9a-f]{6}$/i.test(v) ? v : '#e0ebe5';
}

function blob(c: CanvasRenderingContext2D, x: number, y: number, rx: number, ry: number, color: string) {
  c.fillStyle = color;
  c.beginPath();
  c.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  c.fill();
}

function pick<T>(arr: T[], rng: Rng) {
  return arr[Math.floor(rng() * arr.length)];
}

/** Sky, field and orchard filling the whole close-up, in outer units. */
function drawSurroundings(c: CanvasRenderingContext2D, P: P, rng: Rng) {
  const { W, H } = FACADE;
  const ground = INSET.y + 600;
  const sky = c.createLinearGradient(0, 0, 0, ground);
  P.sky.forEach(([t, col]) => sky.addColorStop(t, col));
  c.fillStyle = sky;
  c.fillRect(0, 0, W, ground + 4);
  c.filter = 'blur(16px)';
  for (let i = 0; i < 9; i++) blob(c, rng() * W, 40 + rng() * 300, 80 + rng() * 120, 28 + rng() * 24, css(hex(P.cloudLit), 0.8));
  c.filter = 'none';

  const field = c.createLinearGradient(0, ground - 40, 0, H);
  P.field.forEach(([t, col]) => field.addColorStop(t, col));
  c.fillStyle = field;
  c.fillRect(0, ground - 40, W, H - ground + 40);

  // the orchard runs out past the edges of the view
  for (const [x0, x1] of [
    [-60, INSET.x + 120],
    [INSET.x + 880, W + 60],
  ]) {
    c.strokeStyle = css(tone(hex(P.wheatDark), -0.35));
    c.lineWidth = 11;
    for (let i = 0; i < 4; i++) {
      const tx = x0 + 40 + rng() * (x1 - x0 - 80);
      c.beginPath();
      c.moveTo(tx, ground + 20);
      c.lineTo(tx + (rng() - 0.5) * 30, ground - 220);
      c.stroke();
    }
    for (let i = 0; i < 170; i++) {
      const x = x0 + rng() * (x1 - x0);
      const y = 160 + rng() * (ground - 170);
      const r = 18 + rng() * 34;
      blob(c, x, y, r * 1.15, r, rng() < 0.45 ? pick(P.blossom, rng) : pick(P.hedge, rng));
    }
  }
  // meadow flowers in the foreground
  for (let i = 0; i < 260; i++) {
    const x = rng() * W;
    const y = ground + 10 + rng() * (H - ground - 10);
    blob(c, x, y, 6 + rng() * 7, 5 + rng() * 5, pick(P.flowers, rng));
  }
}

/** The house and its garden, in the inner 1000-unit frame. */
function drawFront(c: CanvasRenderingContext2D, P: P, rng: Rng, interior: string) {
  const W = 1000;
  const H = 860 + INSET.y;
  const ground = 600;

  // the orchard close by on either side
  for (const [x0, x1] of [
    [-40, 230],
    [770, 1040],
  ]) {
    c.strokeStyle = css(tone(hex(P.wheatDark), -0.35));
    c.lineWidth = 9;
    for (let i = 0; i < 3; i++) {
      const tx = x0 + 40 + rng() * (x1 - x0 - 80);
      c.beginPath();
      c.moveTo(tx, ground + 10);
      c.lineTo(tx + (rng() - 0.5) * 30, ground - 170);
      c.stroke();
    }
    for (let i = 0; i < 120; i++) {
      const x = x0 + rng() * (x1 - x0);
      const y = 120 + rng() * (ground - 130);
      const r = 14 + rng() * 26;
      const col = rng() < 0.45 ? pick(P.blossom, rng) : pick(P.hedge, rng);
      blob(c, x, y, r * 1.15, r, col);
    }
  }

  // the house: whitewash, slate roof, chimney
  const left = 180;
  const right = 820;
  const top = 315;
  const base = FACADE.anchor.y - INSET.y;
  const wall = c.createLinearGradient(0, top, 0, base);
  wall.addColorStop(0, P.house);
  wall.addColorStop(1, css(mix(hex(P.house), hex(P.hillsNear), 0.18)));
  c.fillStyle = wall;
  c.fillRect(left, top, right - left, base - top);
  // plaster, unevenly limewashed
  for (let i = 0; i < 40; i++) {
    const warm = rng() < 0.5;
    blob(c, left + rng() * (right - left), top + rng() * (base - top), 20 + rng() * 40, 10 + rng() * 22, warm ? 'rgba(236,228,206,0.35)' : 'rgba(190,212,214,0.3)');
  }
  c.fillStyle = P.roof;
  c.fillRect(615, 20, 46, 110);
  c.beginPath();
  c.moveTo(left - 45, top);
  c.lineTo(270, 70);
  c.lineTo(730, 70);
  c.lineTo(right + 45, top);
  c.closePath();
  c.fill();
  c.strokeStyle = css(tone(hex(P.roof), -0.22), 0.7);
  c.lineWidth = 3;
  for (let y = 95; y < top; y += 26) {
    const t = (y - 70) / (top - 70);
    c.beginPath();
    c.moveTo(270 - t * 135, y);
    c.lineTo(730 + t * 135, y);
    c.stroke();
  }
  c.fillStyle = css(tone(hex(P.roof), -0.35), 0.35);
  c.fillRect(left, top, right - left, 22);

  // windows with shutters and flower boxes
  for (const cx of [308, 692]) {
    const wx = cx - 42;
    const wy = 405;
    c.fillStyle = '#EEF0EA';
    c.fillRect(wx - 6, wy - 6, 96, 120);
    const glass = c.createLinearGradient(0, wy, 0, wy + 108);
    glass.addColorStop(0, css(mix(hex(P.sky[0][1]), [40, 70, 90], 0.35)));
    glass.addColorStop(1, '#2F4656');
    c.fillStyle = glass;
    c.fillRect(wx, wy, 84, 108);
    c.fillStyle = '#EEF0EA';
    c.fillRect(wx + 40, wy, 4, 108);
    c.fillRect(wx, wy + 52, 84, 4);
    c.fillStyle = P.door;
    c.fillRect(wx - 44, wy - 6, 34, 120);
    c.fillRect(wx + 94, wy - 6, 34, 120);
    c.fillStyle = css(tone(hex(P.door), -0.25));
    c.fillRect(wx - 8, wy + 112, 100, 16);
    for (let i = 0; i < 22; i++) blob(c, wx - 4 + rng() * 92, wy + 108 + rng() * 6, 6 + rng() * 5, 5 + rng() * 4, pick(P.flowers, rng));
  }

  // the doorway: stone surround, a step, and the dark opening the door hangs in
  const d = { ...FACADE.door, x: FACADE.door.x - INSET.x, y: FACADE.door.y - INSET.y };
  c.fillStyle = '#E3DFD3';
  c.fillRect(d.x - 14, d.y - 14, d.w + 28, d.h + 14);
  // standing open: the room inside is the same wall the work hangs on,
  // lit by the day coming in behind us
  const inside = hex(interior);
  const room = c.createRadialGradient(d.x + d.w * 0.55, d.y + d.h * 0.42, 4, d.x + d.w * 0.55, d.y + d.h * 0.42, d.h * 0.75);
  room.addColorStop(0, css(tone(inside, 0.45)));
  room.addColorStop(0.6, css(inside));
  room.addColorStop(1, css(tone(inside, -0.12)));
  c.fillStyle = room;
  c.fillRect(d.x, d.y, d.w, d.h);
  // the door itself, swung in against the jamb
  c.fillStyle = P.door;
  c.beginPath();
  c.moveTo(d.x, d.y);
  c.lineTo(d.x + d.w * 0.2, d.y + d.h * 0.05);
  c.lineTo(d.x + d.w * 0.2, d.y + d.h * 0.97);
  c.lineTo(d.x, d.y + d.h);
  c.closePath();
  c.fill();
  c.fillStyle = '#CFCABE';
  c.fillRect(d.x - 26, base - 3, d.w + 52, 14);

  // wisteria over the door, just coming into flower
  for (let i = 0; i < 26; i++) {
    const x = d.x - 70 + rng() * (d.w + 140);
    const y = top + 30 + rng() * 60;
    blob(c, x, y, 16 + rng() * 14, 10 + rng() * 6, pick(P.hedge, rng));
  }
  for (let i = 0; i < 12; i++) {
    const x = d.x - 60 + rng() * (d.w + 120);
    const y = top + 50 + rng() * 50;
    blob(c, x, y + 18, 9, 22 + rng() * 12, rng() < 0.5 ? '#B6A3DA' : '#C9B9E6');
  }

  // the path to the step, grass along the wall
  c.fillStyle = P.path;
  c.globalAlpha = 1;
  c.beginPath();
  c.moveTo(d.x - 6, base + 8);
  c.lineTo(d.x + d.w + 6, base + 8);
  c.lineTo(690, H);
  c.lineTo(310, H);
  c.closePath();
  c.fill();
  for (let i = 0; i < 70; i++) {
    const x = rng() * W;
    if (x > 330 && x < 670) continue;
    blob(c, x, base + rng() * 20, 12 + rng() * 14, 8 + rng() * 8, pick(P.hedge, rng));
  }
  for (let i = 0; i < 90; i++) {
    const x = rng() * W;
    const y = base + 20 + rng() * (H - base - 20);
    if (x > 300 && x < 700 && y > base) continue;
    blob(c, x, y, 5 + rng() * 5, 4 + rng() * 4, pick(P.flowers, rng));
  }
}
