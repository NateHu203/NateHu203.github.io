import { useEffect, useRef, useState } from 'react';
import PaintedImage from './PaintedImage';
import { EMAIL, RESUME_URL, socials, roles, projects, papers, type Project } from '../data/content';

const SOCIAL_LABEL: Record<string, string> = {
  github: 'GitHub',
  linkedin: 'LinkedIn',
  scholar: 'Google Scholar',
};

export function About() {
  return (
    <section id="about" className="section about" aria-labelledby="about-title">
      <h2 id="about-title" className="section__title">
        About
      </h2>
      <div className="about__grid">
        <div className="about__story">
          <p className="about__lead">
            I&rsquo;m Xinyuan, and everyone calls me Nate. I studied computer science and data
            science at Emory, and I&rsquo;m continuing with an S.M. in data science at Harvard.
          </p>
          <p>
            Most of my work lives where language models meet the real world: on-device agents,
            small and large models collaborating on one task, and pipelines that read the news,
            the inbox or the literature so that people don&rsquo;t have to.
          </p>
        </div>
        <dl className="about__facts">
          <div>
            <dt>Education</dt>
            <dd>
              Harvard University
              <span>S.M. Data Science, 2028</span>
            </dd>
            <dd>
              Emory University
              <span>B.S. Computer Science and Data Science, 2026</span>
            </dd>
          </div>
          <div>
            <dt>Recognition</dt>
            <dd>Dean&rsquo;s List, 2022–2024</dd>
            <dd>DataFest 2025, Best Insight</dd>
          </div>
          <div>
            <dt>Off the clock</dt>
            <dd>Piano, tennis, and an unreasonable number of video games</dd>
          </div>
        </dl>
      </div>
    </section>
  );
}

function Work({ p }: { p: Project }) {
  return (
    <a className="work" href={p.github} target="_blank" rel="noopener noreferrer">
      {p.image && (
        <PaintedImage
          src={p.image}
          alt=""
          ratio={p.ratio}
          fit={p.fit}
          ground={p.fit === 'contain' ? '#c8dcd6' : undefined}
        />
      )}
      <div className="label">
        <h3 className="label__title">{p.title}</h3>
        <p className="label__kind">{p.type}</p>
        <p className="label__medium">{p.tech.join(', ')}</p>
        <p className="label__desc">{p.desc}</p>
        <span className="label__link">Code on GitHub</span>
      </div>
    </a>
  );
}

const WALK_QUERY = '(min-width: 1024px) and (min-height: 600px) and (prefers-reduced-motion: no-preference)';

export function Projects() {
  const [walk, setWalk] = useState(() => window.matchMedia(WALK_QUERY).matches);
  useEffect(() => {
    const mq = window.matchMedia(WALK_QUERY);
    const on = () => setWalk(mq.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  return walk ? <ProjectsWalk /> : <ProjectsHang />;
}

/** A salon hang, for phones and anyone who prefers less motion. */
function ProjectsHang() {
  return (
    <section id="projects" className="section" aria-labelledby="projects-title">
      <h2 id="projects-title" className="section__title">
        Projects
      </h2>
      <p className="section__note">Hover a painting to see what it was painted from.</p>
      <ul className="hang">
        {projects.map((p) => (
          <li key={p.title} className="hang__item">
            <Work p={p} />
          </li>
        ))}
      </ul>
    </section>
  );
}

/** Inside the house: scrolling walks you sideways along the gallery wall. */
function ProjectsWalk() {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const track = trackRef.current;
    if (!section || !track) return;
    let travel = 0;
    let raf = 0;
    let cur = -1;
    let last = 0;
    const target = () => {
      const r = section.getBoundingClientRect();
      return Math.max(0, Math.min(1, -r.top / Math.max(1, r.height - window.innerHeight)));
    };
    // ease toward the scroll position so the wall glides rather than jumps
    const update = () => {
      raf = 0;
      const t = target();
      const now = performance.now();
      const dt = last ? Math.min(64, now - last) : 16;
      last = now;
      if (cur < 0) cur = t;
      else cur += (t - cur) * (1 - Math.exp(-dt / 240));
      if (Math.abs(t - cur) * travel < 0.5) {
        cur = t;
        last = 0;
      } else raf = requestAnimationFrame(update);
      track.style.transform = `translate3d(${(-cur * travel).toFixed(1)}px, 0, 0)`;
    };
    const measure = () => {
      travel = Math.max(0, track.scrollWidth - window.innerWidth);
      // a touch more runway than travel, so the walk along the wall is unhurried
      section.style.height = `${travel * 1.25 + window.innerHeight}px`;
      cur = -1;
      update();
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    const ro = new ResizeObserver(measure);
    ro.observe(track);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', measure);
    measure();
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', measure);
      section.style.height = '';
    };
  }, []);

  return (
    <section id="projects" className="section gallery" ref={sectionRef} aria-labelledby="projects-title">
      <div className="gallery__pin">
        <ul className="gallery__track" ref={trackRef}>
          <li className="gallery__intro">
            <h2 id="projects-title" className="section__title">
              Projects
            </h2>
            <p className="section__note">Keep scrolling to walk along the wall. Hover a painting to see the original.</p>
          </li>
          {projects.map((p) => (
            <li key={p.title} className="gallery__item" style={{ width: `min(${(p.ratio * 48).toFixed(1)}vh, 40vw)` }}>
              <Work p={p} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function Papers() {
  return (
    <section id="papers" className="section" aria-labelledby="papers-title">
      <h2 id="papers-title" className="section__title">
        Papers
      </h2>
      <ul className="papers">
        {papers.map((p) => (
          <li key={p.url}>
            <a className="paper" href={p.url} target="_blank" rel="noopener noreferrer">
              <PaintedImage src={p.image} alt="" ratio={p.ratio} fit="cover" />
              <div className="paper__text">
                <p className="paper__venue">{p.cite}</p>
                <h3 className="paper__title">{p.title}</h3>
                <span className="label__link">Read the paper</span>
              </div>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function Experience() {
  return (
    <section id="experience" className="section" aria-labelledby="experience-title">
      <h2 id="experience-title" className="section__title">
        Experience
      </h2>
      <ol className="chrono">
        {roles.map((r) => (
          <li key={r.org} className="chrono__item">
            <p className="chrono__when">{r.period}</p>
            <div className="chrono__body">
              <h3 className="chrono__role">{r.title}</h3>
              <p className="chrono__org">{r.org}</p>
              {r.bullets.length > 0 && (
                <ul className="chrono__notes">
                  {r.bullets.map((b) => (
                    <li key={b}>{b}</li>
                  ))}
                </ul>
              )}
              {r.stack.length > 0 && <p className="chrono__stack">{r.stack.join(', ')}</p>}
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

export function Contact({ onResume }: { onResume: (e: React.MouseEvent<HTMLAnchorElement>) => void }) {
  return (
    <section id="contact" className="section contact" aria-labelledby="contact-title">
      <h2 id="contact-title" className="section__title">
        Say hello
      </h2>
      <a className="contact__email" href={`mailto:${EMAIL}`}>
        {EMAIL}
      </a>
      <ul className="contact__links">
        {socials.map((s) => (
          <li key={s.label}>
            <a href={s.href} target="_blank" rel="noopener noreferrer">
              {SOCIAL_LABEL[s.label] ?? s.label}
            </a>
          </li>
        ))}
        <li>
          <a href={RESUME_URL} target="_blank" rel="noopener" onClick={onResume}>
            Résumé
          </a>
        </li>
      </ul>
    </section>
  );
}
