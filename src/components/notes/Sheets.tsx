import { useEffect } from 'react';
import { motion } from 'framer-motion';
import type { SheetId } from './layout';
import { roles, projects, papers } from '../../data/content';

function SheetHeading({ children }: { children: string }) {
  return (
    <div className="mb-8">
      <h2 className="font-hand text-4xl text-ink">{children}</h2>
      <svg width="120" height="9" viewBox="0 0 120 9" aria-hidden="true" className="mt-1">
        <path
          d="M2 6 C 32 2.5, 84 2.5, 118 5"
          fill="none"
          stroke="#2D4F9E"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}

function AboutSheet() {
  return (
    <>
      <SheetHeading>about me</SheetHeading>
      <div className="space-y-5 font-serif text-base leading-[1.85] text-ink-soft max-w-prose">
        <p>
          I'm Xinyuan — everyone calls me Nate. I just finished my B.S. in
          Computer Science &amp; Data Science at Emory University ('26), and
          I'm headed to Harvard next for an S.M. in Data Science ('28).
        </p>
        <p>
          Most of my work lives where language models meet the real world:
          on-device agents, model collaboration, and systems that read so
          humans don't have to.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-8 mt-10 pt-8 border-t border-dashed border-line">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-mute mb-3">
            Education
          </p>
          <p className="font-serif text-lg text-ink">Emory University</p>
          <p className="font-serif text-sm text-ink-mute mt-1">
            B.S. Data Science &amp; Computer Science · Class of 2026
          </p>
          <p className="font-serif text-lg text-ink mt-4">Harvard University</p>
          <p className="font-serif text-sm text-ink-mute mt-1">
            S.M. Data Science · Class of 2028
          </p>
        </div>
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-mute mb-3">
            Recognition
          </p>
          <ul className="space-y-2 font-serif text-sm text-ink-soft">
            <li>Dean's List, 2022–2024</li>
            <li>DataFest 2025 — Best Insight</li>
          </ul>
          <p className="font-hand text-xl text-pen mt-6">
            off the clock: piano, tennis, video games
          </p>
        </div>
      </div>
    </>
  );
}

function ExperienceSheet() {
  return (
    <>
      <SheetHeading>experience</SheetHeading>
      <div>
        {roles.map((role, i) => (
          <div
            key={role.org}
            className={`py-7 ${i > 0 ? 'border-t border-dashed border-line' : 'pt-0'}`}
          >
            <div className="flex items-baseline justify-between gap-4 flex-wrap">
              <h3 className="font-serif text-xl text-ink">{role.title}</h3>
              <span className="font-mono text-[11px] text-ink-mute shrink-0">
                {role.period}
              </span>
            </div>
            <p className="font-hand text-xl text-pen mt-1">{role.org}</p>
            <ul className="mt-4 space-y-2.5 max-w-prose">
              {role.bullets.map((b) => (
                <li
                  key={b}
                  className="font-serif text-sm leading-relaxed text-ink-soft pl-4 relative"
                >
                  <span className="absolute left-0 top-[0.7em] w-1.5 h-px bg-ink-mute" />
                  {b}
                </li>
              ))}
            </ul>
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-mute mt-4">
              {role.stack.join(' · ')}
            </p>
          </div>
        ))}
      </div>
    </>
  );
}

function ProjectsSheet() {
  return (
    <>
      <SheetHeading>projects</SheetHeading>
      <div className="space-y-10">
        {projects.map((p, i) => (
          <a
            key={p.num}
            href={p.github}
            target="_blank"
            rel="noopener noreferrer"
            data-hover
            className="group grid sm:grid-cols-[180px_1fr] gap-5 sm:gap-7 items-start"
          >
            <div
              className={`relative bg-paper border border-ink/30 rounded-lg overflow-hidden aspect-[4/3] shadow-note ${
                i % 2 ? 'rotate-[1.2deg]' : '-rotate-[1.2deg]'
              } transition-transform duration-300 group-hover:rotate-0`}
            >
              {p.image && (
                <img
                  src={p.image}
                  alt={p.title}
                  loading="lazy"
                  className={`w-full h-full ${
                    p.fit === 'contain' ? 'object-contain p-2' : 'object-cover'
                  }`}
                />
              )}
            </div>
            <div>
              <p className="font-mono text-[10px] text-ink-faint mb-1">
                {p.num} — {p.type}
              </p>
              <h3 className="font-serif text-xl text-ink group-hover:text-pen transition-colors">
                {p.title}
              </h3>
              <p className="font-serif text-sm leading-relaxed text-ink-soft mt-2 max-w-prose">
                {p.desc}
              </p>
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-mute mt-3">
                {p.tech.join(' · ')}
              </p>
              <span className="inline-block font-hand text-lg text-pen mt-2">
                view on github →
              </span>
            </div>
          </a>
        ))}
      </div>
    </>
  );
}

function PublicationsSheet() {
  return (
    <>
      <SheetHeading>papers</SheetHeading>
      <div className="space-y-9">
        {papers.map((p, i) => (
          <div
            key={p.venueTag}
            className="grid sm:grid-cols-[160px_1fr] gap-5 sm:gap-7 items-start"
          >
            <div
              className={`bg-paper border border-ink/30 rounded-lg overflow-hidden aspect-[4/3] shadow-note ${
                i % 2 ? '-rotate-[1.2deg]' : 'rotate-[1.2deg]'
              }`}
            >
              <img
                src={p.image}
                alt={p.title}
                loading="lazy"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <p className="font-hand text-lg text-pen">
                {p.venueTag}
                <span className="font-mono text-[10px] text-ink-mute ml-3">{p.year}</span>
              </p>
              <h3 className="font-serif text-lg leading-snug text-ink mt-1">{p.title}</h3>
              <p className="font-serif text-sm text-ink-mute mt-2">
                {p.venue} — Xinyuan Hu et al.
              </p>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

const CONTENT: Record<SheetId, () => JSX.Element> = {
  about: AboutSheet,
  experience: ExperienceSheet,
  projects: ProjectsSheet,
  publications: PublicationsSheet,
};

export default function Sheet({ id, onClose }: { id: SheetId; onClose: () => void }) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const Content = CONTENT[id];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.22 }}
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-8"
    >
      <div
        className="absolute inset-0 bg-ink/25 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95, rotate: -1.6 }}
        animate={{ opacity: 1, y: 0, scale: 1, rotate: -0.4 }}
        exit={{ opacity: 0, y: 20, scale: 0.96, rotate: -1.2 }}
        transition={{ type: 'spring', stiffness: 280, damping: 26 }}
        className="relative z-10 w-[min(94vw,780px)] max-h-[88vh] overflow-y-auto bg-card ring-1 ring-ink/[0.05] shadow-sheet px-7 sm:px-12 py-10 sm:py-12"
        style={{ borderRadius: '24px 30px 22px 32px' }}
      >
        <span className="tape" aria-hidden="true" />
        <button
          onClick={onClose}
          data-hover
          aria-label="Close"
          className="sticky top-0 float-right -mt-4 -mr-2 sm:-mr-6 font-hand text-xl text-ink-mute hover:text-pen transition-colors bg-card/90 rounded-full px-3 py-1"
        >
          close ✕
        </button>
        <Content />
      </motion.div>
    </motion.div>
  );
}
