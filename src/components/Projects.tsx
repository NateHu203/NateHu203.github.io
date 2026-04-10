import RevealText from './RevealText';
import { useEffect, useRef, type MutableRefObject } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import ProjectTitleCanvas from './ProjectTitleCanvas';

gsap.registerPlugin(ScrollTrigger);

interface Project {
  title: string;
  type: string;
  desc: string;
  tech: string[];
  image?: string;
  fit?: 'contain' | 'cover';
  github: string;
  num: string;
}

const projects: Project[] = [
  {
    title: 'TechBridge HomeBridger',
    type: 'Data Science · Capstone',
    desc: 'Analyzed nonprofit service delivery data to maximize community impact through ML-driven insights and interactive Streamlit dashboards.',
    tech: ['Python', 'Machine Learning', 'Streamlit'],
    image: '/contents/Techbridge-Homebridger-Primary.svg',
    fit: 'contain',
    github: 'https://github.com/NateHu203/Capstone-Project-TechBridge',
    num: '01',
  },
  {
    title: 'EmaiLLM',
    type: 'AI · NLP',
    desc: 'AI-powered intelligent email filtering system using LLMs and prompt engineering for automated bulk email classification and cleanup.',
    tech: ['Python', 'LLM', 'Prompt Engineering'],
    image: '/contents/emaillm.png',
    github: 'https://github.com/NateHu203/EmaiLLM',
    num: '02',
  },
  {
    title: 'Anime Rec System',
    type: 'Machine Learning',
    desc: 'Personalized recommendation engine using collaborative filtering and content-based approaches, served via Flask.',
    tech: ['Python', 'Scikit-learn', 'Flask'],
    image: '/contents/anime.png',
    github: 'https://github.com/NateHu203/CS-470-Anime-Recommendation-System',
    num: '03',
  },
  {
    title: 'Career Path Prediction',
    type: 'Transformers · ML',
    desc: 'Transformer-based model for analyzing and forecasting professional career trajectories using Hugging Face.',
    tech: ['Python', 'Transformers', 'Hugging Face'],
    image: '/contents/career-path-la-gi.jpg',
    github: 'https://github.com/NateHu203/Career-Path-Prediction-QTM347',
    num: '04',
  },
];

const TOTAL = projects.length;

const TAG_COLORS: Record<string, string> = {
  'Python': '#e8f0fe',
  'Machine Learning': '#fce8f0',
  'Streamlit': '#fff0e6',
  'LLM': '#f0e8fe',
  'Prompt Engineering': '#e8fef0',
  'Scikit-learn': '#e6f7ff',
  'Flask': '#f5f0e8',
  'Transformers': '#fee8e8',
  'Hugging Face': '#fff8e6',
};

const TAG_TEXT: Record<string, string> = {
  'Python': '#1a56db',
  'Machine Learning': '#b8336a',
  'Streamlit': '#c4560a',
  'LLM': '#6b21a8',
  'Prompt Engineering': '#15803d',
  'Scikit-learn': '#0c7dba',
  'Flask': '#7c6a3e',
  'Transformers': '#c53030',
  'Hugging Face': '#a16207',
};

function CardContent({
  project,
  progressRef,
}: {
  project: Project;
  progressRef: MutableRefObject<{ value: number }>;
}) {
  return (
    <a
      href={project.github}
      target="_blank"
      rel="noopener noreferrer"
      className="group w-full max-w-[1200px] mx-auto grid md:grid-cols-2 gap-8 md:gap-14 items-center"
    >
      <div className="overflow-hidden rounded-lg bg-warm-hover aspect-[4/3]">
        {project.image ? (
          <img
            src={project.image}
            alt={project.title}
            className={`w-full h-full ${project.fit === 'contain' ? 'object-contain' : 'object-cover'} transition-transform duration-700 ease-[cubic-bezier(0.25,0.1,0,1)] group-hover:scale-105`}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-warm-hover">
            <span className="font-serif text-[10rem] font-light text-warm-border select-none">
              {project.title.charAt(0)}
            </span>
          </div>
        )}
      </div>

      <div>
        <p className="font-mono text-xs text-ink-faint tracking-wider mb-4">
          {project.num} / {String(TOTAL).padStart(2, '0')}
        </p>
        <p className="font-sans text-xs text-ink-muted uppercase tracking-wider mb-3">
          {project.type}
        </p>
        <ProjectTitleCanvas
          text={project.title}
          progressRef={progressRef}
          className="mb-6"
        />
        <p className="font-sans text-base text-ink-muted leading-relaxed mb-8 max-w-lg">
          {project.desc}
        </p>
        <div className="flex flex-wrap gap-2 mb-8">
          {project.tech.map((t) => (
            <span
              key={t}
              className="px-3 py-1 font-sans text-xs rounded-full bg-transparent"
              style={{
                border: `1px solid ${TAG_TEXT[t] ?? '#2b6b7f'}`,
                color: TAG_TEXT[t] ?? '#2b6b7f',
              }}
            >
              {t}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-2 font-sans text-sm text-ink-muted group-hover:text-rust transition-colors duration-400">
          <span>View project</span>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="transition-transform duration-400 group-hover:translate-x-1 group-hover:-translate-y-1">
            <path d="M1 13L13 1M13 1H5M13 1V9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>
    </a>
  );
}

export default function Projects() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  // Progress refs for each card's title animation (0→1)
  const progressRefs = useRef<{ value: number }[]>(
    projects.map((_, i) => ({ value: i === 0 ? 1 : 0 })) // first card starts revealed
  );

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    const cards = wrapper.querySelectorAll<HTMLElement>('.project-card');
    const count = cards.length;

    // All cards after the first start off-screen below
    gsap.set(Array.from(cards).slice(1), { yPercent: 100 });

    const tl = gsap.timeline();

    for (let i = 0; i < count - 1; i++) {
      // Current card scales down + fades
      tl.to(cards[i], {
        scale: 0.88,
        opacity: 0.4,
        duration: 1,
      });
      // Next card slides up
      tl.to(
        cards[i + 1],
        {
          yPercent: 0,
          duration: 1,
        },
        '<'
      );
      // Title draws in as card arrives (overlapping the slide)
      tl.to(
        progressRefs.current[i + 1],
        {
          value: 1,
          duration: 0.4,
          ease: 'power2.out',
        },
        '-=0.3'
      );
      // Small pause between transitions
      tl.to({}, { duration: 0.3 });
    }

    const st = ScrollTrigger.create({
      trigger: wrapper,
      pin: true,
      start: 'top top',
      end: () => `+=${count * 100}%`,
      scrub: 0.6,
      animation: tl,
    });

    return () => {
      st.kill();
    };
  }, []);

  return (
    <section id="projects">
      <div ref={wrapperRef} className="h-screen overflow-hidden">
        {/* Header */}
        <div className="absolute top-0 left-0 w-full z-50 pt-10 pb-6 px-6 md:px-12 pointer-events-none">
          <div className="max-w-[1400px] mx-auto flex items-center gap-6">
            <RevealText className="font-mono text-xs tracking-[0.25em] uppercase text-ink-muted">
              Projects
            </RevealText>
          </div>
        </div>

        {/* Stacking cards */}
        {projects.map((project, i) => (
          <div
            key={i}
            className="project-card absolute inset-0 flex items-center justify-center px-6 md:px-12"
            style={{ zIndex: i + 1 }}
          >
            <div className="w-full bg-card-bg backdrop-blur-sm shadow-[0_4px_60px_rgba(0,0,0,0.08)] p-8 md:p-14">
              <CardContent
                project={project}
                progressRef={{ current: progressRefs.current[i] }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
