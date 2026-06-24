import { useEffect, useRef } from 'react';

const TRAIL_MS = 450;

export default function InkCursor() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const dot = dotRef.current;
    if (!canvas || !dot) return;
    if (!window.matchMedia('(pointer: fine)').matches) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const resize = () => {
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    const pts: { x: number; y: number; t: number }[] = [];

    const move = (e: MouseEvent) => {
      pts.push({ x: e.clientX, y: e.clientY, t: performance.now() });
      const target = e.target as HTMLElement | null;
      const hover = !!target?.closest?.('a, button, [data-hover], [role="button"]');
      dot.style.opacity = '1';
      // wrapper is a zero-size point — its origin lands exactly on the pointer,
      // and the dot is centered on that origin via fixed margins (see CSS).
      dot.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
      dot.classList.toggle('pen-hover', hover);
    };
    const leave = () => {
      dot.style.opacity = '0';
    };
    window.addEventListener('mousemove', move, { passive: true });
    document.documentElement.addEventListener('mouseleave', leave);

    let raf = 0;
    const tick = () => {
      const now = performance.now();
      while (pts.length && now - pts[0].t > TRAIL_MS) pts.shift();
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      ctx.lineCap = 'round';
      for (let i = 1; i < pts.length; i++) {
        const age = (now - pts[i].t) / TRAIL_MS;
        ctx.strokeStyle = `rgba(45, 79, 158, ${0.16 * (1 - age)})`;
        ctx.lineWidth = 1.3;
        ctx.beginPath();
        ctx.moveTo(pts[i - 1].x, pts[i - 1].y);
        ctx.lineTo(pts[i].x, pts[i].y);
        ctx.stroke();
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', move);
      document.documentElement.removeEventListener('mouseleave', leave);
    };
  }, []);

  return (
    <>
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-[90]"
        aria-hidden="true"
      />
      <div ref={dotRef} aria-hidden="true" className="pen-cursor">
        <span className="pen-dot" />
      </div>
    </>
  );
}
