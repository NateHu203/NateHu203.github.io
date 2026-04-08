import { useEffect, useState } from 'react';

const BODY_CHARS = ['#', '█', '▓', '▒', '■', '▄', '▀', '░'];
const EDGE_CHARS = ['/', '\\', '|', '—', '+', '×'];
const ACCENT_CHARS = ['●', '◆', '★'];

const bodyColors = ['#3a3a3a', '#484848', '#2e2e2e', '#525252', '#404040'];
const edgeColors = ['#8B7A6B', '#7A6B5B', '#6B5B4B'];
const accentColors = ['#C2542D', '#B04828'];

const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

interface Cell {
  char: string;
  color: string;
  row: number;
  col: number;
}

function drawBear(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.fillStyle = '#000';

  // Body — large horizontal ellipse
  ctx.beginPath();
  ctx.ellipse(w * 0.46, h * 0.52, w * 0.32, h * 0.2, 0, 0, Math.PI * 2);
  ctx.fill();

  // Hump / upper back
  ctx.beginPath();
  ctx.ellipse(w * 0.38, h * 0.38, w * 0.18, h * 0.14, -0.15, 0, Math.PI * 2);
  ctx.fill();

  // Neck
  ctx.beginPath();
  ctx.ellipse(w * 0.62, h * 0.4, w * 0.1, h * 0.16, 0.2, 0, Math.PI * 2);
  ctx.fill();

  // Head — circle
  ctx.beginPath();
  ctx.arc(w * 0.74, h * 0.34, w * 0.11, 0, Math.PI * 2);
  ctx.fill();

  // Snout — small ellipse protruding right
  ctx.beginPath();
  ctx.ellipse(w * 0.84, h * 0.38, w * 0.07, h * 0.055, 0.1, 0, Math.PI * 2);
  ctx.fill();

  // Left ear
  ctx.beginPath();
  ctx.arc(w * 0.68, h * 0.24, w * 0.035, 0, Math.PI * 2);
  ctx.fill();

  // Right ear
  ctx.beginPath();
  ctx.arc(w * 0.76, h * 0.23, w * 0.035, 0, Math.PI * 2);
  ctx.fill();

  // Tail — small bump on left
  ctx.beginPath();
  ctx.ellipse(w * 0.14, h * 0.44, w * 0.035, h * 0.03, -0.4, 0, Math.PI * 2);
  ctx.fill();

  // Back-left leg
  ctx.beginPath();
  ctx.moveTo(w * 0.24, h * 0.62);
  ctx.lineTo(w * 0.21, h * 0.82);
  ctx.lineTo(w * 0.18, h * 0.85);
  ctx.lineTo(w * 0.28, h * 0.85);
  ctx.lineTo(w * 0.30, h * 0.82);
  ctx.lineTo(w * 0.32, h * 0.62);
  ctx.fill();

  // Back-right leg (slightly behind)
  ctx.beginPath();
  ctx.moveTo(w * 0.34, h * 0.63);
  ctx.lineTo(w * 0.32, h * 0.80);
  ctx.lineTo(w * 0.29, h * 0.83);
  ctx.lineTo(w * 0.39, h * 0.83);
  ctx.lineTo(w * 0.41, h * 0.80);
  ctx.lineTo(w * 0.42, h * 0.63);
  ctx.fill();

  // Front-left leg
  ctx.beginPath();
  ctx.moveTo(w * 0.58, h * 0.62);
  ctx.lineTo(w * 0.56, h * 0.82);
  ctx.lineTo(w * 0.53, h * 0.85);
  ctx.lineTo(w * 0.63, h * 0.85);
  ctx.lineTo(w * 0.65, h * 0.82);
  ctx.lineTo(w * 0.66, h * 0.62);
  ctx.fill();

  // Front-right leg
  ctx.beginPath();
  ctx.moveTo(w * 0.67, h * 0.61);
  ctx.lineTo(w * 0.66, h * 0.80);
  ctx.lineTo(w * 0.63, h * 0.83);
  ctx.lineTo(w * 0.73, h * 0.83);
  ctx.lineTo(w * 0.75, h * 0.80);
  ctx.lineTo(w * 0.75, h * 0.61);
  ctx.fill();

  // Eye — punch a hole
  ctx.globalCompositeOperation = 'destination-out';
  ctx.beginPath();
  ctx.arc(w * 0.76, h * 0.32, w * 0.015, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalCompositeOperation = 'source-over';

  // Nose
  ctx.fillStyle = '#C2542D';
  ctx.beginPath();
  ctx.arc(w * 0.895, h * 0.38, w * 0.015, 0, Math.PI * 2);
  ctx.fill();
}

export default function AsciiBear() {
  const [cells, setCells] = useState<Cell[]>([]);
  const gridCols = 52;
  const gridRows = 40;

  useEffect(() => {
    const cw = 200;
    const ch = 160;
    const canvas = document.createElement('canvas');
    canvas.width = cw;
    canvas.height = ch;
    const ctx = canvas.getContext('2d')!;

    drawBear(ctx, cw, ch);

    const imgData = ctx.getImageData(0, 0, cw, ch);
    const result: Cell[] = [];

    for (let r = 0; r < gridRows; r++) {
      for (let c = 0; c < gridCols; c++) {
        const px = Math.floor((c / gridCols) * cw);
        const py = Math.floor((r / gridRows) * ch);
        const idx = (py * cw + px) * 4;
        const alpha = imgData.data[idx + 3];

        if (alpha < 128) continue;

        // Check if accent (nose area - red channel)
        const red = imgData.data[idx];
        const green = imgData.data[idx + 1];
        const isNose = red > 150 && green < 100;

        // Edge detection
        let isEdge = false;
        const step = 2;
        for (const [dx, dy] of [[-step,0],[step,0],[0,-step],[0,step]] as const) {
          const nx = px + dx;
          const ny = py + dy;
          if (nx < 0 || nx >= cw || ny < 0 || ny >= ch) { isEdge = true; break; }
          if (imgData.data[(ny * cw + nx) * 4 + 3] < 128) { isEdge = true; break; }
        }

        let char: string;
        let color: string;

        if (isNose) {
          char = pick(ACCENT_CHARS);
          color = pick(accentColors);
        } else if (isEdge) {
          char = pick(EDGE_CHARS);
          color = pick(edgeColors);
        } else {
          char = pick(BODY_CHARS);
          color = pick(bodyColors);
        }

        result.push({ char, color, row: r, col: c });
      }
    }

    setCells(result);
  }, []);

  return (
    <div className="w-full flex items-center justify-center select-none" aria-label="Bear illustration">
      <div
        className="grid font-mono leading-none"
        style={{
          gridTemplateRows: `repeat(${gridRows}, 1em)`,
          gridTemplateColumns: `repeat(${gridCols}, 0.6em)`,
          fontSize: 'clamp(7px, 1vw, 11px)',
        }}
      >
        {cells.map((cell, i) => (
          <span
            key={i}
            className="flex items-center justify-center transition-all duration-150 hover:scale-150 cursor-default"
            style={{
              gridRow: cell.row + 1,
              gridColumn: cell.col + 1,
              color: cell.color,
            }}
            onMouseEnter={(e) => { (e.target as HTMLElement).style.color = '#C2542D'; }}
            onMouseLeave={(e) => { (e.target as HTMLElement).style.color = cell.color; }}
          >
            {cell.char}
          </span>
        ))}
      </div>
    </div>
  );
}
