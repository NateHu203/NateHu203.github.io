import { useRef, useEffect, useState, useCallback } from 'react';
import { usePretextCanvas, type CharPosition } from '../hooks/usePretextCanvas';

function easeOut(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

function computeFontSize(): number {
  return Math.min(128, Math.max(56, window.innerWidth * 0.09));
}

function lerpColor(a: string, b: string, t: number): string {
  const parse = (hex: string) => [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16),
  ];
  const [ar, ag, ab] = parse(a);
  const [br, bg, bb] = parse(b);
  return `rgb(${Math.round(ar + (br - ar) * t)},${Math.round(ag + (bg - ag) * t)},${Math.round(ab + (bb - ab) * t)})`;
}

const LINES = [
  { text: "Hi, I'm Xinyuan", italic: false },
  { text: '(Nate) Hu ...', italic: true },
];

const STAGGER_MS = 30;
const REVEAL_DURATION_MS = 800;
const WAVE_DURATION_MS = 2000;
const WAVE_AMPLITUDE = 1.5;
const INITIAL_Y_OFFSET = 60;
const COLOR = '#1a1a1a';
const RUST = '#C2542D';

// Cursor interaction constants
const REPEL_RADIUS = 120;   // px — how close cursor needs to be to affect a char
const REPEL_STRENGTH = 25;  // px — max displacement
const SPRING_SPEED = 0.12;  // how fast chars spring back (0-1 per frame)

interface CharState {
  dx: number; // current x displacement
  dy: number; // current y displacement
  colorT: number; // 0 = ink, 1 = rust
}

export default function HeroCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);
  const [fontSize, setFontSize] = useState(computeFontSize);
  const lineHeight = fontSize * 0.95;
  const containerRef = useRef<HTMLDivElement>(null);
  const [maxWidth, setMaxWidth] = useState(800);

  // Mouse position relative to canvas
  const mouseRef = useRef<{ x: number; y: number } | null>(null);
  // Per-character animation state for cursor interaction
  const charStatesRef = useRef<CharState[]>([]);

  useEffect(() => {
    function update() {
      setFontSize(computeFontSize());
      if (containerRef.current) {
        setMaxWidth(containerRef.current.clientWidth);
      }
    }
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  // Track mouse over canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const onMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    };
    const onLeave = () => {
      mouseRef.current = null;
    };

    canvas.addEventListener('mousemove', onMove);
    canvas.addEventListener('mouseleave', onLeave);
    return () => {
      canvas.removeEventListener('mousemove', onMove);
      canvas.removeEventListener('mouseleave', onLeave);
    };
  }, []);

  const font1 = `300 ${fontSize}px "Cormorant Garamond"`;
  const font2 = `italic 300 ${fontSize}px "Cormorant Garamond"`;

  const line1 = usePretextCanvas({ text: LINES[0].text, font: font1, lineHeight, maxWidth });
  const line2 = usePretextCanvas({ text: LINES[1].text, font: font2, lineHeight, maxWidth });

  const ready = line1.ready && line2.ready;
  const line2YOffset = line1.totalHeight > 0 ? line1.totalHeight : lineHeight;

  const allChars = useCallback((): { chars: CharPosition[]; font: string; yOffset: number }[] => [
    { chars: line1.chars, font: font1, yOffset: 0 },
    { chars: line2.chars, font: font2, yOffset: line2YOffset },
  ], [line1.chars, line2.chars, font1, font2, line2YOffset]);

  const totalChars = line1.chars.length + line2.chars.length;
  const totalHeight = line2YOffset + line2.totalHeight;

  // Initialize/resize char states when char count changes
  useEffect(() => {
    if (charStatesRef.current.length !== totalChars) {
      charStatesRef.current = Array.from({ length: totalChars }, () => ({
        dx: 0, dy: 0, colorT: 0,
      }));
    }
  }, [totalChars]);

  // Animation loop
  useEffect(() => {
    if (!ready || totalChars === 0) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    startTimeRef.current = performance.now();
    // Keep animating indefinitely for cursor interaction
    let running = true;

    function render(now: number) {
      if (!running) return;
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (!canvas || !ctx) return;

      const dpr = window.devicePixelRatio || 1;
      const w = containerRef.current?.clientWidth || 800;
      const h = totalHeight;

      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, w, h);

      const elapsed = now - startTimeRef.current;
      const mouse = mouseRef.current;
      const states = charStatesRef.current;
      let globalIndex = 0;

      const lines = allChars();

      for (const { chars, font, yOffset } of lines) {
        ctx.font = font;

        for (const ch of chars) {
          const state = states[globalIndex];
          if (!state) { globalIndex++; continue; }

          // --- Reveal animation ---
          const charDelay = globalIndex * STAGGER_MS;
          const revealProgress = Math.max(0, Math.min(1, (elapsed - charDelay) / REVEAL_DURATION_MS));
          const easedReveal = easeOut(revealProgress);

          let revealYOff = INITIAL_Y_OFFSET * (1 - easedReveal);
          const waveElapsed = elapsed - charDelay - REVEAL_DURATION_MS;
          if (waveElapsed > 0 && waveElapsed < WAVE_DURATION_MS) {
            const waveDampen = 1 - waveElapsed / WAVE_DURATION_MS;
            revealYOff += Math.sin(waveElapsed * 0.006 + globalIndex * 0.3) * WAVE_AMPLITUDE * waveDampen;
          }

          // --- Cursor repel ---
          const charCenterX = ch.x + ch.width / 2;
          const charCenterY = ch.y + yOffset + lineHeight / 2;

          let targetDx = 0;
          let targetDy = 0;
          let targetColorT = 0;

          if (mouse && easedReveal >= 1) {
            const dx = charCenterX - mouse.x;
            const dy = charCenterY - mouse.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < REPEL_RADIUS && dist > 0) {
              const force = (1 - dist / REPEL_RADIUS) ** 2; // quadratic falloff
              targetDx = (dx / dist) * REPEL_STRENGTH * force;
              targetDy = (dy / dist) * REPEL_STRENGTH * force;
              targetColorT = force;
            }
          }

          // Spring toward target
          state.dx += (targetDx - state.dx) * SPRING_SPEED;
          state.dy += (targetDy - state.dy) * SPRING_SPEED;
          state.colorT += (targetColorT - state.colorT) * SPRING_SPEED;

          // Snap tiny values to 0
          if (Math.abs(state.dx) < 0.01) state.dx = 0;
          if (Math.abs(state.dy) < 0.01) state.dy = 0;
          if (Math.abs(state.colorT) < 0.001) state.colorT = 0;

          // --- Draw ---
          ctx.globalAlpha = easedReveal;
          ctx.fillStyle = state.colorT > 0.001 ? lerpColor(COLOR, RUST, state.colorT) : COLOR;
          ctx.textBaseline = 'top';
          ctx.fillText(
            ch.char,
            ch.x + state.dx,
            ch.y + yOffset + revealYOff + state.dy,
          );

          globalIndex++;
        }
      }

      ctx.globalAlpha = 1;
      rafRef.current = requestAnimationFrame(render);
    }

    rafRef.current = requestAnimationFrame(render);

    return () => {
      running = false;
      cancelAnimationFrame(rafRef.current);
    };
  }, [ready, totalChars, totalHeight, allChars, lineHeight]);

  return (
    <div ref={containerRef} className="mb-6 w-full">
      <canvas
        ref={canvasRef}
        style={{ width: '100%', height: totalHeight || 'auto', cursor: 'default' }}
      />
    </div>
  );
}
