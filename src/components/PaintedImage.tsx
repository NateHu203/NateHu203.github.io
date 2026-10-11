import { useEffect, useRef, useState } from 'react';
import { paintImage } from '../paint/paintImage';

interface Props {
  src: string;
  alt: string;
  ratio: number;
  fit?: 'cover' | 'contain';
  ground?: string;
}

/**
 * An image hung in a white frame, repainted as an oil sketch when it nears
 * the viewport. Hovering its link lifts the paint to show the original.
 */
export default function PaintedImage({ src, alt, ratio, fit = 'cover', ground }: Props) {
  const boxRef = useRef<HTMLDivElement>(null);
  const [painted, setPainted] = useState(false);

  useEffect(() => {
    const box = boxRef.current;
    if (!box) return;
    let cancelled = false;
    let canvas: HTMLCanvasElement | null = null;

    const io = new IntersectionObserver(
      async ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        const img = new Image();
        img.src = src;
        try {
          await img.decode();
          const w = box.clientWidth;
          const result = await paintImage(img, w, w / ratio, { fit, ground });
          if (cancelled) return;
          canvas = result;
          canvas.className = 'painted__canvas';
          canvas.setAttribute('aria-hidden', 'true');
          box.appendChild(canvas);
          requestAnimationFrame(() => !cancelled && setPainted(true));
        } catch {
          // leave the original showing
          if (!cancelled) setPainted(false);
        }
      },
      { rootMargin: '700px 0px' }
    );
    // paintings further along the gallery wall sit off-screen sideways, so
    // watch the gallery itself rather than each frame
    io.observe(box.closest('.gallery') ?? box);
    return () => {
      cancelled = true;
      io.disconnect();
      canvas?.remove();
    };
  }, [src, ratio, fit, ground]);

  return (
    <div className="frame">
      <div ref={boxRef} className={`painted${painted ? ' is-painted' : ''}`} style={{ aspectRatio: ratio }}>
        <img
          src={src}
          alt={alt}
          loading="lazy"
          decoding="async"
          className={`painted__photo painted__photo--${fit}`}
          style={ground ? { background: ground } : undefined}
        />
      </div>
    </div>
  );
}
