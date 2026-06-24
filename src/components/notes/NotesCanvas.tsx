import { useEffect, useRef, useState } from 'react';
import Matter from 'matter-js';
import { LAYOUT, type NoteId, type SheetId } from './layout';
import NoteShell from './NoteShell';
import { TEASERS } from './teasers';
import DeskEphemera from './DeskEphemera';

interface Props {
  onOpenSheet: (id: SheetId) => void;
  onOpenResume: () => void;
}

interface Home {
  x: number;
  y: number;
  rot: number;
}

const NOTE_LABELS: Partial<Record<NoteId, string>> = {
  about: 'Open about me',
  experience: 'Open experience',
  projects: 'Open projects',
  publications: 'Open publications',
  resume: 'Open résumé',
};

export default function NotesCanvas({ onOpenSheet, onOpenResume }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const noteEls = useRef<Map<NoteId, HTMLDivElement>>(new Map());
  const downRef = useRef<{ x: number; y: number } | null>(null);
  const zTop = useRef(10);
  const [settled, setSettled] = useState(false);
  const [ready, setReady] = useState(false);
  const [dragged, setDragged] = useState(false);
  const [layoutKey, setLayoutKey] = useState(0);

  // full re-init on resize (debounced)
  useEffect(() => {
    let t: number;
    const onResize = () => {
      window.clearTimeout(t);
      t = window.setTimeout(() => {
        setSettled(false);
        setLayoutKey((k) => k + 1);
      }, 300);
    };
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
      window.clearTimeout(t);
    };
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let cancelled = false;
    const cleanups: (() => void)[] = [];
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const init = () => {
      if (cancelled || !containerRef.current) return;
      const cw = container.clientWidth;
      const ch = container.clientHeight;
      const scale = Math.min(Math.max(Math.min(cw / 1440, ch / 950), 0.8), 1.12);

      const homes = new Map<NoteId, Home>();
      const sizes = new Map<NoteId, { w: number; h: number }>();
      const depths = new Map<NoteId, number>();

      LAYOUT.forEach((def) => {
        const el = noteEls.current.get(def.id);
        if (!el) return;
        el.style.width = `${Math.round(def.w * scale)}px`;
        const rect = el.getBoundingClientRect();
        homes.set(def.id, {
          x: def.x * cw,
          y: def.y * ch,
          rot: (def.rot * Math.PI) / 180,
        });
        sizes.set(def.id, { w: rect.width, h: rect.height });
        // bigger notes read as "nearer" and parallax more
        depths.set(def.id, 0.5 + (def.w / 430) * 0.7);
      });

      // ── cursor parallax (gentle drift toward the pointer) ──
      const MAX = reduced ? 0 : 13;
      const pTarget = { x: 0, y: 0 };
      const pNow = { x: 0, y: 0 };
      const onMove = (e: PointerEvent) => {
        pTarget.x = (e.clientX / cw - 0.5) * 2 * MAX;
        pTarget.y = (e.clientY / ch - 0.5) * 2 * MAX;
      };
      if (!reduced) window.addEventListener('pointermove', onMove, { passive: true });

      const place = (id: NoteId, x: number, y: number, angle: number) => {
        const el = noteEls.current.get(id);
        const size = sizes.get(id);
        if (!el || !size) return;
        const d = depths.get(id) ?? 1;
        el.style.opacity = '1';
        el.style.transform = `translate(${x - size.w / 2 + pNow.x * d}px, ${
          y - size.h / 2 + pNow.y * d
        }px) rotate(${angle}rad)`;
      };

      if (reduced) {
        LAYOUT.forEach((def) => {
          const h = homes.get(def.id);
          if (h) place(def.id, h.x, h.y, h.rot);
        });
        setSettled(true);
        setReady(true);
        return;
      }

      const engine = Matter.Engine.create();
      engine.gravity.y = 0;
      const world = engine.world;

      // walls so flung notes can't leave the canvas
      const T = 240;
      Matter.Composite.add(world, [
        Matter.Bodies.rectangle(cw / 2, -ch * 1.6 - T / 2, cw * 3, T, { isStatic: true }),
        Matter.Bodies.rectangle(cw / 2, ch + T / 2, cw * 3, T, { isStatic: true }),
        Matter.Bodies.rectangle(-T / 2, ch / 2 - ch, T, ch * 5, { isStatic: true }),
        Matter.Bodies.rectangle(cw + T / 2, ch / 2 - ch, T, ch * 5, { isStatic: true }),
      ]);

      const bodies = new Map<NoteId, Matter.Body>();
      const spawnAt = new Map<NoteId, number>();
      const started = performance.now();

      LAYOUT.forEach((def, i) => {
        const size = sizes.get(def.id);
        const home = homes.get(def.id);
        if (!size || !home) return;
        const body = Matter.Bodies.rectangle(
          home.x + (Math.random() * 60 - 30),
          home.y - ch * 0.85,
          size.w,
          size.h,
          {
            frictionAir: 0.08,
            restitution: 0.2,
            angle: home.rot + (Math.random() * 0.16 - 0.08),
            // notes overlap like real paper — they never collide with each
            // other, only with the walls (and the mouse can still grab them)
            collisionFilter: { group: -1 },
          }
        );
        bodies.set(def.id, body);
        spawnAt.set(def.id, 250 + i * 110);
      });

      const addNote = (id: NoteId) => {
        const body = bodies.get(id);
        const home = homes.get(id);
        if (!body || !home) return;
        Matter.Composite.add(world, [
          body,
          Matter.Constraint.create({
            pointA: { x: home.x, y: home.y },
            bodyB: body,
            pointB: { x: 0, y: 0 },
            stiffness: 0.007,
            damping: 0.06,
            length: 0,
          }),
        ]);
      };

      const mouse = Matter.Mouse.create(container);
      const mouseConstraint = Matter.MouseConstraint.create(engine, {
        mouse,
        constraint: { stiffness: 0.12, damping: 0.08 },
      });
      Matter.Composite.add(world, mouseConstraint);

      const onStartDrag = (e: Matter.IEvent<Matter.MouseConstraint> & { body?: Matter.Body }) => {
        setDragged(true);
        for (const [id, b] of bodies) {
          if (b === e.body) {
            const el = noteEls.current.get(id);
            if (el) el.style.zIndex = String(++zTop.current);
          }
        }
      };
      Matter.Events.on(mouseConstraint, 'startdrag', onStartDrag);

      const sync = () => {
        // ease the parallax offset toward the pointer target
        pNow.x += (pTarget.x - pNow.x) * 0.07;
        pNow.y += (pTarget.y - pNow.y) * 0.07;

        const now = performance.now() - started;
        spawnAt.forEach((t, id) => {
          if (t >= 0 && now >= t) {
            addNote(id);
            spawnAt.set(id, -1);
          }
        });
        bodies.forEach((body, id) => {
          if ((spawnAt.get(id) ?? -1) >= 0) return;
          const home = homes.get(id);
          if (!home) return;
          const dragging = mouseConstraint.body === body;
          // soft angular spring back to the resting rotation
          Matter.Body.setAngularVelocity(
            body,
            body.angularVelocity * 0.86 + (home.rot - body.angle) * 0.045
          );
          // once a note is back home and barely moving, pin it to true rest
          // so the canvas is perfectly still instead of micro-jittering
          if (
            !dragging &&
            body.speed < 0.06 &&
            Math.abs(body.angularVelocity) < 0.002 &&
            Math.hypot(home.x - body.position.x, home.y - body.position.y) < 0.6 &&
            Math.abs(home.rot - body.angle) < 0.004
          ) {
            Matter.Body.setPosition(body, { x: home.x, y: home.y });
            Matter.Body.setAngle(body, home.rot);
            Matter.Body.setVelocity(body, { x: 0, y: 0 });
            Matter.Body.setAngularVelocity(body, 0);
          }
          place(id, body.position.x, body.position.y, body.angle);
        });
      };
      Matter.Events.on(engine, 'afterUpdate', sync);

      const runner = Matter.Runner.create();
      Matter.Runner.run(runner, engine);
      setReady(true);

      const settleTimer = window.setTimeout(
        () => setSettled(true),
        250 + LAYOUT.length * 110 + 900
      );

      cleanups.push(() => {
        window.clearTimeout(settleTimer);
        window.removeEventListener('pointermove', onMove);
        Matter.Events.off(mouseConstraint, 'startdrag', onStartDrag);
        Matter.Events.off(engine, 'afterUpdate', sync);
        Matter.Runner.stop(runner);
        // Matter.Mouse has no destroy — detach its listeners by hand
        const m = mouse as unknown as Record<string, EventListener>;
        ['mousemove', 'mousedown', 'mouseup'].forEach((ev) =>
          container.removeEventListener(ev, m[ev])
        );
        container.removeEventListener('wheel', m.mousewheel);
        container.removeEventListener('DOMMouseScroll', m.mousewheel);
        container.removeEventListener('touchmove', m.mousemove);
        container.removeEventListener('touchstart', m.mousedown);
        container.removeEventListener('touchend', m.mouseup);
        Matter.Composite.clear(world, false);
        Matter.Engine.clear(engine);
      });
    };

    // wait for webfonts so note heights (and physics bodies) are measured right
    document.fonts.ready.then(() => init());

    return () => {
      cancelled = true;
      cleanups.forEach((fn) => fn());
    };
  }, [layoutKey]);

  const open = (def: (typeof LAYOUT)[number]) => {
    if (def.sheet) onOpenSheet(def.sheet);
    else if (def.action === 'resume') onOpenResume();
  };

  const handleUp = (def: (typeof LAYOUT)[number]) => (e: React.PointerEvent) => {
    const d = downRef.current;
    downRef.current = null;
    if (!d) return;
    if (Math.hypot(e.clientX - d.x, e.clientY - d.y) > 8) return; // it was a drag
    open(def);
  };

  return (
    <div
      key={layoutKey}
      ref={containerRef}
      className={`fixed inset-0 overflow-hidden select-none transition-opacity duration-700 ${
        ready ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <DeskEphemera />

      {LAYOUT.map((def) => {
        const interactive = !!def.sheet || !!def.action;
        return (
          <div
            key={def.id}
            ref={(el) => {
              if (el) noteEls.current.set(def.id, el);
              else noteEls.current.delete(def.id);
            }}
            className="note-focus absolute top-0 left-0 opacity-0 will-change-transform rounded-[28px]"
            style={{ zIndex: 2 }}
            role={interactive ? 'button' : undefined}
            tabIndex={interactive ? 0 : undefined}
            aria-label={interactive ? NOTE_LABELS[def.id] : undefined}
            onPointerDown={(e) => {
              downRef.current = { x: e.clientX, y: e.clientY };
            }}
            onPointerUp={handleUp(def)}
            onKeyDown={
              interactive
                ? (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      open(def);
                    }
                  }
                : undefined
            }
          >
            <NoteShell variant={def.variant} tone={def.tone} tape={def.tape} clickable={interactive}>
              {TEASERS[def.id]}
            </NoteShell>
          </div>
        );
      })}

      {/* nudge to play — disappears after the first drag */}
      <div
        className={`absolute font-hand text-lg text-ink-mute -rotate-3 pointer-events-none transition-opacity duration-700 ${
          settled && !dragged ? 'opacity-100' : 'opacity-0'
        }`}
        style={{ left: '37%', top: '40%' }}
        aria-hidden="true"
      >
        (go on — drag them)
      </div>

      <footer className="absolute bottom-4 inset-x-6 flex items-center justify-between pointer-events-none">
        <span className="font-mono text-[10px] text-ink-faint">
          © {new Date().getFullYear()} xinyuan (nate) hu
        </span>
      </footer>
    </div>
  );
}
