import { useRef, useEffect, useState, type MutableRefObject } from 'react';
import { usePretextCanvas } from '../hooks/usePretextCanvas';

const INK = '#1a1a1a';
const RUST = '#C2542D';

function lerpColor(a: string, b: string, t: number): string {
  const parse = (hex: string) => [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16),
  ];
  const [ar, ag, ab] = parse(a);
  const [br, bg, bb] = parse(b);
  const r = Math.round(ar + (br - ar) * t);
  const g = Math.round(ag + (bg - ag) * t);
  const bl = Math.round(ab + (bb - ab) * t);
  return `rgb(${r},${g},${bl})`;
}

interface ProjectTitleCanvasProps {
  text: string;
  progressRef: MutableRefObject<{ value: number }>;
  className?: string;
}

function computeFontSize(): number {
  const w = window.innerWidth;
  if (w >= 1024) return 60; // lg: text-6xl
  if (w >= 768) return 48;  // md: text-5xl
  return 36;                 // text-4xl
}

export default function ProjectTitleCanvas({ text, progressRef, className = '' }: ProjectTitleCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);
  const hoverRef = useRef(0); // 0-1 for color interpolation
  const isHoveredRef = useRef(false);
  const [fontSize, setFontSize] = useState(computeFontSize);
  const [maxWidth, setMaxWidth] = useState(500);

  const lineHeight = fontSize * 1.1;
  const font = `300 ${fontSize}px "Cormorant Garamond"`;

  const { chars, totalHeight, ready } = usePretextCanvas({
    text,
    font,
    lineHeight,
    maxWidth,
  });

  // Responsive
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

  // Hover detection on closest <a> ancestor
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const anchor = container.closest('a');
    if (!anchor) return;

    const enter = () => { isHoveredRef.current = true; };
    const leave = () => { isHoveredRef.current = false; };
    anchor.addEventListener('mouseenter', enter);
    anchor.addEventListener('mouseleave', leave);
    return () => {
      anchor.removeEventListener('mouseenter', enter);
      anchor.removeEventListener('mouseleave', leave);
    };
  }, []);

  // Render loop
  useEffect(() => {
    if (!ready || chars.length === 0) return;

    let lastTime = performance.now();

    function render(now: number) {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (!canvas || !ctx) return;

      const dpr = window.devicePixelRatio || 1;
      const w = containerRef.current?.clientWidth || 500;
      const h = totalHeight || lineHeight;

      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, w, h);

      // Smooth hover color interpolation
      const dt = (now - lastTime) / 1000;
      lastTime = now;
      const hoverTarget = isHoveredRef.current ? 1 : 0;
      hoverRef.current += (hoverTarget - hoverRef.current) * Math.min(1, dt * 4);

      const fillColor = lerpColor(INK, RUST, hoverRef.current);
      const progress = progressRef.current.value;
      const totalChars = chars.length;

      ctx.font = font;
      ctx.textBaseline = 'top';

      for (let i = 0; i < totalChars; i++) {
        const ch = chars[i];
        // Each char's local progress based on overall progress
        const charStart = i / totalChars;
        const charEnd = (i + 1) / totalChars;
        const localProgress = Math.max(0, Math.min(1, (progress - charStart) / (charEnd - charStart)));

        if (localProgress <= 0) continue;

        // Slight x-offset that settles
        const xOff = 8 * (1 - localProgress);

        ctx.globalAlpha = localProgress;
        ctx.fillStyle = fillColor;
        ctx.fillText(ch.char, ch.x + xOff, ch.y);
      }

      ctx.globalAlpha = 1;
      rafRef.current = requestAnimationFrame(render);
    }

    rafRef.current = requestAnimationFrame(render);
    return () => cancelAnimationFrame(rafRef.current);
  }, [ready, chars, totalHeight, lineHeight, font, progressRef]);

  return (
    <div ref={containerRef} className={className}>
      {/* Screen reader accessible title */}
      <h3 className="sr-only">{text}</h3>
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        style={{ width: '100%', height: totalHeight || 'auto', display: 'block' }}
      />
    </div>
  );
}
