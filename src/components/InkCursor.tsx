import { useEffect, useRef } from 'react';

export default function InkCursor() {
  const dotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const dot = dotRef.current;
    if (!dot) return;
    if (!window.matchMedia('(pointer: fine)').matches) return;

    const move = (e: MouseEvent) => {
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

    return () => {
      window.removeEventListener('mousemove', move);
      document.documentElement.removeEventListener('mouseleave', leave);
    };
  }, []);

  return (
    <div ref={dotRef} aria-hidden="true" className="pen-cursor">
      <span className="pen-dot" />
    </div>
  );
}
