import { useEffect, useRef, useState, useCallback } from 'react';
import Matter from 'matter-js';

const techStack = [
  { label: 'Python', color: '#4B7A5A' },
  { label: 'R', color: '#C2542D' },
  { label: 'SQL', color: '#6B5B3E' },
  { label: 'PyTorch', color: '#C2542D' },
  { label: 'NLP', color: '#3A3A3A' },
  { label: 'LLMs', color: '#6B5B3E' },
  { label: 'ML', color: '#4B7A5A' },
  { label: 'Pandas', color: '#8B6B47' },
  { label: 'NumPy', color: '#5A6B7A' },
  { label: 'Scikit', color: '#7A5A4B' },
  { label: 'React', color: '#5A7A8B' },
  { label: 'Flask', color: '#3A3A3A' },
  { label: 'Hive', color: '#8B7A47' },
  { label: 'BigQuery', color: '#5A6B7A' },
  { label: 'TypeScript', color: '#4B5A7A' },
  { label: 'Git', color: '#C2542D' },
  { label: 'Streamlit', color: '#7A4B5A' },
  { label: 'HuggingFace', color: '#8B6B47' },
  { label: 'JavaScript', color: '#8B7A47' },
  { label: 'Transformers', color: '#5A4B7A' },
];

interface BodyLabel {
  id: number;
  label: string;
  color: string;
  x: number;
  y: number;
  angle: number;
  scale: number;
}

export default function PhysicsStack() {
  const sceneRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<Matter.Engine | null>(null);
  const [bodies, setBodies] = useState<BodyLabel[]>([]);
  const bodiesMapRef = useRef<Map<number, { label: string; color: string }>>(new Map());
  const matterBodiesRef = useRef<Map<number, Matter.Body>>(new Map());
  const rafRef = useRef<number>(0);
  const mousePos = useRef({ x: -999, y: -999 });

  useEffect(() => {
    const container = sceneRef.current;
    if (!container) return;

    const w = container.clientWidth;
    const h = container.clientHeight;

    const engine = Matter.Engine.create({ gravity: { x: 0, y: 1.2 } });
    engineRef.current = engine;

    // Walls — floor and sides (invisible)
    const floor = Matter.Bodies.rectangle(w / 2, h + 25, w + 100, 50, { isStatic: true });
    const wallL = Matter.Bodies.rectangle(-25, h / 2, 50, h * 2, { isStatic: true });
    const wallR = Matter.Bodies.rectangle(w + 25, h / 2, 50, h * 2, { isStatic: true });
    Matter.Composite.add(engine.world, [floor, wallL, wallR]);

    // Measure text to get natural word dimensions
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    const fontSize = Math.max(14, Math.min(18, w * 0.028));
    ctx.font = `600 ${fontSize}px Outfit, sans-serif`;

    // Drop words with staggered timing
    const shuffled = [...techStack].sort(() => Math.random() - 0.5);

    shuffled.forEach((tech, i) => {
      setTimeout(() => {
        const measured = ctx.measureText(tech.label);
        const textW = measured.width + 20;
        const textH = fontSize + 12;

        // Use a chamfered rectangle (rounded) for more organic feel
        const x = 40 + Math.random() * (w - 80);
        const body = Matter.Bodies.rectangle(x, -30 - i * 10, textW, textH, {
          chamfer: { radius: 6 },
          restitution: 0.3,
          friction: 0.6,
          frictionAir: 0.01,
          density: 0.002,
        });

        bodiesMapRef.current.set(body.id, { label: tech.label, color: tech.color });
        matterBodiesRef.current.set(body.id, body);
        Matter.Composite.add(engine.world, body);
      }, i * 120);
    });

    // Mouse interaction — drag bodies around
    const mouse = Matter.Mouse.create(container);
    const mouseConstraint = Matter.MouseConstraint.create(engine, {
      mouse,
      constraint: {
        stiffness: 0.2,
        render: { visible: false },
      },
    });
    // Prevent page scroll when interacting
    mouse.element.removeEventListener('mousewheel', (mouse as any).mousewheel);
    mouse.element.removeEventListener('DOMMouseScroll', (mouse as any).mousewheel);
    Matter.Composite.add(engine.world, mouseConstraint);

    // Track mouse position relative to container
    const onMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mousePos.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };
    const onMouseLeave = () => {
      mousePos.current = { x: -999, y: -999 };
    };
    container.addEventListener('mousemove', onMouseMove);
    container.addEventListener('mouseleave', onMouseLeave);

    // Animation loop
    const popRadius = 60;
    const popForce = 0.008;
    let lastTime = performance.now();
    const update = (time: number) => {
      const delta = Math.min(time - lastTime, 30);
      lastTime = time;

      // Apply gentle repulsion force to bodies near cursor
      const mx = mousePos.current.x;
      const my = mousePos.current.y;
      if (mx > -100) {
        for (const [id, body] of matterBodiesRef.current) {
          if (body.isStatic) continue;
          const dx = body.position.x - mx;
          const dy = body.position.y - my;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < popRadius && dist > 1) {
            const strength = popForce * (1 - dist / popRadius);
            Matter.Body.applyForce(body, body.position, {
              x: (dx / dist) * strength,
              y: (dy / dist) * strength - 0.002, // slight upward bias for a "pop" feel
            });
          }
        }
      }

      Matter.Engine.update(engine, delta);

      const allBodies = Matter.Composite.allBodies(engine.world).filter(
        (b) => !b.isStatic
      );

      const next: BodyLabel[] = [];
      for (const b of allBodies) {
        const meta = bodiesMapRef.current.get(b.id);
        if (meta) {
          // Check proximity to cursor for scale
          const dx = b.position.x - mx;
          const dy = b.position.y - my;
          const dist = Math.sqrt(dx * dx + dy * dy);
          next.push({
            id: b.id,
            label: meta.label,
            color: meta.color,
            x: b.position.x,
            y: b.position.y,
            angle: b.angle,
            scale: dist < popRadius ? 1 + 0.3 * (1 - dist / popRadius) : 1,
          });
        }
      }
      setBodies(next);
      rafRef.current = requestAnimationFrame(update);
    };
    rafRef.current = requestAnimationFrame(update);

    // Resize handler
    const onResize = () => {
      const nw = container.clientWidth;
      const nh = container.clientHeight;
      Matter.Body.setPosition(floor, { x: nw / 2, y: nh + 25 });
      Matter.Body.setPosition(wallR, { x: nw + 25, y: nh / 2 });
      (floor as any).width = nw + 100;
    };
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(rafRef.current);
      container.removeEventListener('mousemove', onMouseMove);
      container.removeEventListener('mouseleave', onMouseLeave);
      window.removeEventListener('resize', onResize);
      Matter.Engine.clear(engine);
    };
  }, []);

  return (
    <div ref={sceneRef} className="relative w-full h-full select-none" style={{ touchAction: 'pan-y' }}>
      {bodies.map((b) => (
        <div
          key={b.id}
          className="absolute whitespace-nowrap font-sans font-semibold pointer-events-auto"
          style={{
            left: b.x,
            top: b.y,
            transform: `translate(-50%, -50%) rotate(${b.angle}rad) scale(${b.scale})`,
            color: b.color,
            fontSize: 'clamp(13px, 1.6vw, 18px)',
            willChange: 'transform',
            transition: 'transform 0.08s ease-out',
          }}
        >
          {b.label}
        </div>
      ))}
    </div>
  );
}
