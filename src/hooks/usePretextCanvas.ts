import { useRef, useState, useEffect, useCallback } from 'react';
import { prepareWithSegments, layoutWithLines, type PreparedTextWithSegments } from '@chenglou/pretext';

export interface CharPosition {
  char: string;
  x: number;
  y: number;
  width: number;
  lineIndex: number;
}

interface UsePretextCanvasOptions {
  text: string;
  font: string;
  lineHeight: number;
  maxWidth: number;
  color?: string;
}

interface UsePretextCanvasReturn {
  chars: CharPosition[];
  totalHeight: number;
  ready: boolean;
}

export function usePretextCanvas({
  text,
  font,
  lineHeight,
  maxWidth,
}: UsePretextCanvasOptions): UsePretextCanvasReturn {
  const [ready, setReady] = useState(false);
  const preparedRef = useRef<PreparedTextWithSegments | null>(null);
  const [chars, setChars] = useState<CharPosition[]>([]);
  const [totalHeight, setTotalHeight] = useState(0);

  // Prepare text (expensive — only when text or font changes)
  useEffect(() => {
    let cancelled = false;

    async function init() {
      await document.fonts.load(font);
      if (cancelled) return;

      preparedRef.current = prepareWithSegments(text, font);
      setReady(true);
    }

    setReady(false);
    preparedRef.current = null;
    init();

    return () => { cancelled = true; };
  }, [text, font]);

  // Layout (cheap — runs when maxWidth, lineHeight, or prepared data changes)
  const computeLayout = useCallback(() => {
    const prepared = preparedRef.current;
    if (!prepared || maxWidth <= 0) return;

    const { lines, height } = layoutWithLines(prepared, maxWidth, lineHeight);
    const segments = (prepared as any).segments as string[];
    const widths = (prepared as any).widths as number[];

    const positions: CharPosition[] = [];

    for (let li = 0; li < lines.length; li++) {
      const line = lines[li];
      const startSeg = line.start.segmentIndex;
      const endSeg = line.end.segmentIndex;
      // End graphemeIndex 0 means we stopped before consuming any of endSeg
      const lastSeg = line.end.graphemeIndex === 0 ? endSeg - 1 : endSeg;

      let x = 0;
      for (let si = startSeg; si <= lastSeg && si < segments.length; si++) {
        const seg = segments[si];
        const w = widths[si];

        if (seg.trim().length > 0) {
          positions.push({
            char: seg,
            x,
            y: li * lineHeight,
            width: w,
            lineIndex: li,
          });
        }
        x += w;
      }
    }

    setChars(positions);
    setTotalHeight(height);
  }, [maxWidth, lineHeight]);

  useEffect(() => {
    if (ready) computeLayout();
  }, [ready, computeLayout]);

  return { chars, totalHeight, ready };
}
