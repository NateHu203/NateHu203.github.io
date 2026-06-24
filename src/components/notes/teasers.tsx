import type { ReactNode } from 'react';
import type { NoteId } from './layout';
import { EMAIL, socials, projects, papers } from '../../data/content';

function More({ label }: { label: string }) {
  return (
    <span className="inline-block mt-3 font-hand text-lg leading-none text-pen">
      {label} →
    </span>
  );
}

const hero = (
  <div>
    <h1 className="font-script text-[2.3rem] leading-[1.5] text-ink">Nate Hu</h1>
    <svg
      className="underline-draw mt-1"
      width="150"
      height="10"
      viewBox="0 0 150 10"
      aria-hidden="true"
    >
      <path pathLength={1} d="M3 7 C 40 2.5, 105 3, 147 5.5" />
    </svg>
    <p className="font-mono text-[10px] tracking-[0.22em] uppercase text-ink-mute mt-4 mb-4">
      Data Science · LLM Research
    </p>
    <p className="font-serif text-[15px] leading-relaxed text-ink-soft">
      I build things with language models — and occasionally teach them to
      reason. Emory&nbsp;&rsquo;26&nbsp;→ Harvard&nbsp;&rsquo;28.
    </p>
    <div className="flex items-center justify-center flex-wrap gap-x-3 gap-y-1 mt-6">
      <span className="font-mono text-[10px] text-ink-mute">Atlanta, GA</span>
      <span className="text-ink-faint" aria-hidden="true">·</span>
      <a
        href={`mailto:${EMAIL}`}
        data-hover
        className="font-hand text-base leading-none text-pen hover:text-ink transition-colors"
      >
        {EMAIL}
      </a>
    </div>
  </div>
);

const about = (
  <div>
    <h2 className="font-hand text-2xl text-ink mb-2">about me</h2>
    <p className="font-serif text-sm leading-relaxed text-ink-soft">
      CS &amp; data science at Emory, data science at Harvard next. Piano,
      tennis, and an unreasonable number of video games.
    </p>
    <More label="the longer version" />
  </div>
);

const experience = (
  <div>
    <h2 className="font-hand text-2xl text-ink mb-3">experience</h2>
    <ul className="space-y-2">
      {[
        ['EDF — AI engineering', "'25"],
        ['Tsinghua — LLM research', "'24–25"],
        ['Emory QTM — research & TA', "'23–25"],
      ].map(([org, yr]) => (
        <li key={org} className="flex items-baseline justify-between gap-3">
          <span className="font-serif text-sm text-ink-soft">{org}</span>
          <span className="font-mono text-[10px] text-ink-mute shrink-0">{yr}</span>
        </li>
      ))}
    </ul>
    <More label="the full story" />
  </div>
);

const projectsTeaser = (
  <div>
    <h2 className="font-hand text-2xl text-ink mb-3">projects</h2>
    <ul className="space-y-2">
      {projects.map((p) => (
        <li key={p.num} className="flex items-baseline gap-3">
          <span className="font-mono text-[10px] text-ink-faint">{p.num}</span>
          <span className="font-serif text-sm text-ink-soft">{p.title}</span>
        </li>
      ))}
    </ul>
    <More label="open the stack" />
  </div>
);

const publications = (
  <div>
    <h2 className="font-hand text-2xl text-ink mb-2">papers</h2>
    <p className="font-serif italic text-sm leading-snug text-ink-soft">
      “Division-of-Thoughts: Hybrid Language Model Synergy for On-Device
      Agents”
    </p>
    <p className="font-mono text-[10px] tracking-wider text-ink-mute mt-2">
      WWW '25 · Patterns (Cell Press) · arXiv
    </p>
    <More label="read them" />
  </div>
);

const contact = (
  <div>
    <h2 className="font-hand text-2xl text-ink mb-2">say hi</h2>
    <a
      href={`mailto:${EMAIL}`}
      data-hover
      className="font-serif text-lg text-ink hover:text-pen transition-colors"
    >
      {EMAIL}
    </a>
    <div className="flex items-center gap-5 mt-3">
      {socials.map((s) => (
        <a
          key={s.label}
          href={s.href}
          target="_blank"
          rel="noopener noreferrer"
          data-hover
          className="font-hand text-lg leading-none text-ink-soft underline decoration-1 underline-offset-4 decoration-line hover:text-pen hover:decoration-pen transition-colors"
        >
          {s.label}
        </a>
      ))}
    </div>
  </div>
);

const resume = (
  <div className="text-center">
    <span className="font-hand text-xl text-ink">resume ↓</span>
    <span className="block font-hand text-sm text-ink-mute mt-0.5">
      (one click...)
    </span>
  </div>
);

export const TEASERS: Record<NoteId, ReactNode> = {
  hero,
  about,
  experience,
  projects: projectsTeaser,
  publications,
  contact,
  resume,
};
