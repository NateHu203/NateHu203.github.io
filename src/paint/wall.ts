import { shadeOnce } from './impasto';
import { drawStroke, setupBrush, type Stroke } from './painter';
import { ctx2d, makeCanvas } from './ref';
import { makeNoise, mulberry32, randomSeed } from './rng';

const TINTS: [number, number, number][] = [
  [0, 0, 0],
  [-8, 4, 12],
  [-10, 9, 3],
  [-6, 11, -4],
  [7, 7, -8],
];

/**
 * A seamless tile of neutral-grey brushwork. Laid over the wall colour with
 * `soft-light`, it reads as a hand-painted gallery wall in any light.
 */
export async function wallTile(size = 380): Promise<string | null> {
  const S = size * 2;
  const color = makeCanvas(S, S);
  const height = makeCanvas(S, S);
  const cc = ctx2d(color, true);
  const hc = ctx2d(height, true);
  cc.fillStyle = 'rgb(128,128,128)';
  cc.fillRect(0, 0, S, S);
  hc.fillStyle = 'rgb(60,60,60)';
  hc.fillRect(0, 0, S, S);
  setupBrush(cc);
  setupBrush(hc);

  const rng = mulberry32(randomSeed());
  const noise = makeNoise(rng);
  for (let i = 0; i < 1100; i++) {
    const x = rng() * S;
    const y = rng() * S;
    const r = S * (0.01 + rng() * 0.022);
    const a = noise(x / S * 3, y / S * 3) * 1.4;
    const steps = 2 + Math.floor(rng() * 3);
    const pts = [x, y];
    for (let j = 1; j <= steps; j++) pts.push(x + Math.cos(a) * r * j, y + Math.sin(a) * r * j + (rng() - 0.5) * r * 0.3);
    const g = 128 + (rng() - 0.5) * 22;
    // broken colour, kept faint: sky blue, aqua, leaf green, a little wheat
    const tint = TINTS[Math.floor(rng() * TINTS.length)];
    const k = rng() * 0.9;
    const s: Stroke = {
      pts,
      r,
      color: [g + tint[0] * k, g + tint[1] * k, g + tint[2] * k],
      alpha: 0.5 + rng() * 0.4,
      h: 0.25 + rng() * 0.25,
      bristles: 4,
    };
    // draw every copy that crosses an edge so the tile wraps cleanly
    const reach = r * (steps + 2);
    for (const ox of [-S, 0, S]) {
      for (const oy of [-S, 0, S]) {
        if (x + ox < -reach || x + ox > S + reach || y + oy < -reach || y + oy > S + reach) continue;
        drawStroke(cc, hc, { ...s, pts: pts.map((v, idx) => v + (idx % 2 ? oy : ox)) }, mulberry32(i));
      }
    }
  }
  shadeOnce(color, height, 1.2, 0.45);
  const blob = await new Promise<Blob | null>((r) => color.toBlob(r, 'image/png'));
  return blob ? URL.createObjectURL(blob) : null;
}
