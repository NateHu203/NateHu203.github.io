import { useEffect, useRef } from 'react';
import { HeroPainting } from '../paint/hero';
import { FACADE, paintFacade, type FacadeArt } from '../paint/facade';
import { MOODS, MOOD_LABEL, PAINTING_TITLE, type Mood } from '../lib/mood';
import { RESUME_URL } from '../data/content';
import { smoothstep } from '../paint/rng';
import { paintName } from '../paint/name';

interface Props {
  mood: Mood;
  onMood: (mood: Mood) => void;
  onResume: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

// The approach, as fractions of the scroll runway. One steady glide up to the
// open door, then the light inside spreads out until it is the page itself.
const BEATS = {
  scatter: [0, 0.22], // the type drifts off to the edges
  glide: [0.02, 1], // toward the house
  closeUp: [0.22, 0.4], // the painted house gives way to the close-up
  center: [0.35, 0.8], // the doorway drifts to the middle of the view
  light: [0.55, 0.98], // the room's light spreads out to fill the view
} as const;

// how wide the doorway is on screen when the glide ends, as a share of the
// view — close enough to step through, not so close the brushwork blows up
const DOOR_SHARE = 0.34;

// how quickly the view catches up with the scroll (ms); smooths wheel steps
const EASE_MS = 240;

export default function Hero({ mood, onMood, onResume }: Props) {
  const journeyRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLElement>(null);
  const paintRef = useRef<HTMLDivElement>(null);
  const introRef = useRef<HTMLDivElement>(null);
  const nameRef = useRef<HTMLHeadingElement>(null);
  const nameCanvas = useRef<HTMLCanvasElement>(null);
  const facadeRef = useRef<HTMLDivElement>(null);
  const wallSlot = useRef<HTMLDivElement>(null);
  const veilRef = useRef<HTMLDivElement>(null);
  const engine = useRef<HeroPainting | null>(null);
  const facade = useRef<FacadeArt | null>(null);
  const firstMood = useRef(mood);
  const moodRef = useRef(mood);
  const updateRef = useRef<() => void>(() => {});

  // the painting itself
  useEffect(() => {
    if (!stageRef.current || !paintRef.current || !introRef.current) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let painting = false;

    // paint the close-up once the field is done, and again if the weather changes
    const ensureFacade = () => {
      const want = moodRef.current;
      if (reduced || painting || facade.current?.mood === want) return;
      painting = true;
      paintFacade(want)
        .then((art) => {
          facade.current = art;
          wallSlot.current?.replaceChildren(art.wall);
          updateRef.current();
        })
        .catch(() => undefined)
        .finally(() => {
          painting = false;
          if (facade.current?.mood !== moodRef.current) ensureFacade();
        });
    };

    try {
      engine.current = new HeroPainting(paintRef.current, {
        stage: stageRef.current,
        quiet: introRef.current,
        mood: firstMood.current,
        reduced,
        onPainted: () => {
          updateRef.current();
          ensureFacade();
        },
      });
    } catch {
      // the type and the rooms inside still work without the painting
    }
    return () => {
      engine.current?.destroy();
      engine.current = null;
    };
  }, []);

  // the name, painted in pointillist dabs over its own (invisible) text
  useEffect(() => {
    const el = nameRef.current;
    const cv = nameCanvas.current;
    if (!el || !cv) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let cancel = () => {};
    let width = 0;
    let timer = 0;
    let alive = true;
    const paint = (animate: boolean) => {
      cancel();
      try {
        cancel = paintName(el, cv, animate);
        el.classList.add('is-painted');
      } catch {
        el.classList.remove('is-painted');
      }
    };
    const fontsReady = Promise.race([
      document.fonts.load(`800 100px "Mona Sans"`).catch(() => null),
      new Promise((r) => setTimeout(r, 2500)),
    ]);
    fontsReady.then(() => {
      if (!alive) return;
      width = el.offsetWidth;
      paint(!reduced);
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
  }, []);

  useEffect(() => {
    moodRef.current = mood;
    engine.current?.setMood(mood);
  }, [mood]);

  // the walk: scroll position drives the camera
  useEffect(() => {
    const journey = journeyRef.current;
    const stage = stageRef.current;
    if (!journey || !stage) return;
    const still = window.matchMedia('(prefers-reduced-motion: reduce)');
    let raf = 0;
    let cur = -1;
    let last = 0;

    const progress = () => {
      const rect = journey.getBoundingClientRect();
      return clamp01(-rect.top / Math.max(1, rect.height - window.innerHeight));
    };

    const update = () => {
      raf = 0;
      const root = document.documentElement;
      if (still.matches) {
        root.dataset.inside = String(journey.getBoundingClientRect().bottom < window.innerHeight * 0.15);
        return;
      }
      // ease toward the scroll position rather than jumping with each wheel step
      const target = progress();
      const now = performance.now();
      const dt = last ? Math.min(64, now - last) : 16;
      last = now;
      if (cur < 0 || Math.abs(target - cur) > 0.5) cur = target;
      else cur += (target - cur) * (1 - Math.exp(-dt / EASE_MS));
      if (Math.abs(target - cur) < 0.0003) cur = target;
      else raf = requestAnimationFrame(update);
      if (cur === target) last = 0;
      render(cur);
    };

    const render = (p: number) => {
      const root = document.documentElement;
      const span = (b: readonly [number, number]) => clamp01((p - b[0]) / (b[1] - b[0]));
      root.dataset.inside = String(p > 0.97);

      const out = span(BEATS.scatter);
      stage.style.setProperty('--out', (out * out).toFixed(4));
      stage.dataset.scattered = String(out > 0.3);

      const e = engine.current;
      const L = e?.layout;
      if (!e || !L) return;
      const vw = stage.clientWidth;
      const sh = stage.clientHeight;
      const d = FACADE.door;

      // zoom in log space so the approach keeps a constant pace
      const finalScale = (DOOR_SHARE * Math.min(vw, sh * 1.4)) / d.w;
      const finalZoom = (finalScale * FACADE.houseW) / (L.houseW * vw);
      const glide = 1 - Math.pow(1 - span(BEATS.glide), 1.6);
      const zoom = Math.exp(Math.log(finalZoom) * glide);
      e.setCamera({ zoom, center: L.door });

      // the close-up of the house rides the same camera
      const f = facadeRef.current;
      const ready = !!facade.current;
      const k = smoothstep(0, 1, span(BEATS.center));
      const doorX = L.door.x * vw + (vw / 2 - L.door.x * vw) * k;
      const doorY = L.door.y * sh + (sh / 2 - L.door.y * sh) * k;
      const s = (zoom * L.houseW * vw) / FACADE.houseW;
      if (f) {
        // approaching, we look at the doorstep; nearer, at the doorway's middle
        const fx = FACADE.anchor.x + (d.x + d.w / 2 - FACADE.anchor.x) * k;
        const fy = FACADE.anchor.y + (d.y + d.h * 0.5 - FACADE.anchor.y) * k;
        f.style.transform = `translate3d(${(doorX - fx * s).toFixed(2)}px, ${(doorY - fy * s).toFixed(2)}px, 0) scale(${s.toFixed(4)})`;
        f.style.opacity = ready ? String(smoothstep(0, 1, span(BEATS.closeUp))) : '0';
        f.style.visibility = p > BEATS.closeUp[0] - 0.02 && p < 0.995 ? 'visible' : 'hidden';
      }

      // the light inside the door spreads out until it is the wall of the page
      const veil = veilRef.current;
      if (veil) {
        const t = ready ? span(BEATS.light) : span([0.45, 0.95]);
        const lt = t * t * (3 - 2 * t);
        const cy = ready ? doorY - (d.h * 0.5 - d.h * 0.42) * s : sh * 0.5;
        const reach = Math.hypot(Math.max(doorX, vw - doorX), Math.max(cy, sh - cy));
        const r0 = ready ? d.w * s * 0.42 : 0;
        veil.style.setProperty('--vx', `${doorX.toFixed(1)}px`);
        veil.style.setProperty('--vy', `${cy.toFixed(1)}px`);
        veil.style.setProperty('--vr', `${(r0 + (reach * 1.15 - r0) * lt).toFixed(1)}px`);
        veil.style.opacity = t > 0 ? '1' : '0';
      }
    };
    updateRef.current = () => {
      if (cur >= 0) render(cur);
      else update();
    };

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    still.addEventListener('change', onScroll);
    update();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      still.removeEventListener('change', onScroll);
    };
  }, []);

  return (
    <section className="journey" id="top" ref={journeyRef} aria-label="Introduction">
      <header className="hero" ref={stageRef}>
        <div className="hero__paint" ref={paintRef} />

        <div className="facade" ref={facadeRef} aria-hidden="true" style={{ width: FACADE.W, height: FACADE.H }}>
          <div className="facade__wall" ref={wallSlot} />
        </div>
        <div className="hero__veil" ref={veilRef} aria-hidden="true" />

        <nav className="hero__nav" aria-label="Sections">
          <a href="#about">About</a>
          <a href="#projects">Projects</a>
          <a href="#papers">Papers</a>
          <a href="#experience">Experience</a>
          <a href={RESUME_URL} target="_blank" rel="noopener" onClick={onResume}>
            Résumé
          </a>
        </nav>

        <div className="hero__intro" ref={introRef}>
          <h1 className="hero__name" ref={nameRef}>
            Xinyuan Hu
            <canvas className="hero__name-paint" ref={nameCanvas} aria-hidden="true" />
          </h1>
          <p className="hero__lede">
            I build things with language models: agents that run on your phone,
            small and large models that share the work, and systems that read so
            people don&rsquo;t have to.
          </p>
          <p className="hero__meta">Founding AI engineer at Huddle. Emory&nbsp;&rsquo;26, Harvard&nbsp;&rsquo;28.</p>
        </div>

        <aside className="placard" aria-label="About this painting">
          <p className="placard__title">{PAINTING_TITLE[mood]}</p>
          <p className="placard__medium">Pixels on canvas, painted stroke by stroke in your browser just now.</p>
          <div className="placard__moods" role="group" aria-label="Repaint the field in other weather">
            <span className="placard__prompt" aria-hidden="true">
              Repaint
            </span>
            {MOODS.map((m) => (
              <button key={m} type="button" aria-pressed={m === mood} onClick={() => onMood(m)}>
                {MOOD_LABEL[m]}
              </button>
            ))}
          </div>
        </aside>

        <p className="hero__scroll" aria-hidden="true">
          Scroll to walk up to the house
        </p>
      </header>
    </section>
  );
}
