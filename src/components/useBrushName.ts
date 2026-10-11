import { useEffect, type RefObject } from 'react';
import { paintName } from '../paint/name';

interface Options {
  /** paint colour; defaults to the element's own text colour */
  color?: string;
  /** brush it in left to right on first paint (skipped for reduced motion) */
  animate?: boolean;
}

/**
 * Brush-letter an element's text into a canvas inside it. The element's own
 * text stays in place, transparent, for screen readers and selection.
 */
export function useBrushName(elRef: RefObject<HTMLElement>, canvasRef: RefObject<HTMLCanvasElement>, opts: Options = {}) {
  const { color, animate = false } = opts;
  useEffect(() => {
    const el = elRef.current;
    const cv = canvasRef.current;
    if (!el || !cv) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const ink = color ?? getComputedStyle(el).color;
    let cancel = () => {};
    let width = 0;
    let timer = 0;
    let alive = true;
    const paint = (reveal: boolean) => {
      cancel();
      try {
        cancel = paintName(el, cv, ink, reveal);
        el.classList.add('is-painted');
      } catch {
        el.classList.remove('is-painted');
      }
    };
    const fontsReady = Promise.race([
      document.fonts.load(`${getComputedStyle(el).fontWeight} 100px "Mona Sans"`).catch(() => null),
      new Promise((r) => setTimeout(r, 2500)),
    ]);
    fontsReady.then(() => {
      if (!alive) return;
      width = el.offsetWidth;
      paint(animate && !reduced);
    });
    const ro = new ResizeObserver(() => {
      if (!width || Math.abs(el.offsetWidth - width) < 1) return;
      width = el.offsetWidth;
      window.clearTimeout(timer);
      timer = window.setTimeout(() => paint(false), 150);
    });
    ro.observe(el);
    return () => {
      alive = false;
      cancel();
      ro.disconnect();
      window.clearTimeout(timer);
    };
  }, [elRef, canvasRef, color, animate]);
}
