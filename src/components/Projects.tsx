import RevealText, { FadeIn } from './RevealText';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';

interface Project {
  title: string;
  type: string;
  desc: string;
  tech: string[];
  image?: string;
  github: string;
  num: string;
}

const projects: Project[] = [
  {
    title: 'TechBridge HomeBridger',
    type: 'Data Science · Capstone',
    desc: 'Analyzed nonprofit service delivery data to maximize community impact through ML-driven insights and interactive Streamlit dashboards.',
    tech: ['Python', 'Machine Learning', 'Streamlit'],
    image: '/contents/tbcapstone.png',
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
    github: 'https://github.com/NateHu203/CS-470-Anime-Recommendation-System',
    num: '03',
  },
  {
    title: 'Career Path Prediction',
    type: 'Transformers · ML',
    desc: 'Transformer-based model for analyzing and forecasting professional career trajectories using Hugging Face.',
    tech: ['Python', 'Transformers', 'Hugging Face'],
    github: 'https://github.com/NateHu203/Career-Path-Prediction-QTM347',
    num: '04',
  },
];

function ProjectCard({ project }: { project: Project }) {
  return (
    <a
      href={project.github}
      target="_blank"
      rel="noopener noreferrer"
      className="group block shrink-0 w-[85vw] md:w-[42vw] lg:w-[36vw]"
    >
      {/* Image */}
      <div className="overflow-hidden rounded-sm bg-warm-hover aspect-[4/3] mb-5">
        {project.image ? (
          <img
            src={project.image}
            alt={project.title}
            className="w-full h-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.25,0.1,0,1)] group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-warm-hover">
            <span className="font-serif text-[8rem] font-light text-warm-border select-none">
              {project.title.charAt(0)}
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <p className="font-sans text-xs text-ink-muted mb-2">
        {project.num} — {project.type}
      </p>
      <h3 className="font-serif text-2xl md:text-3xl font-light text-ink group-hover:text-rust transition-colors duration-500 mb-3">
        {project.title}
      </h3>
      <p className="font-sans text-sm text-ink-muted leading-relaxed mb-4 max-w-md">
        {project.desc}
      </p>
      <div className="flex flex-wrap gap-2 mb-4">
        {project.tech.map((t) => (
          <span
            key={t}
            className="px-3 py-1 font-sans text-xs text-ink-muted border border-warm-border rounded-full"
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
    </a>
  );
}

export default function Projects() {
  const containerRef = useRef<HTMLElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  // Map vertical scroll to horizontal translate
  const x = useTransform(scrollYProgress, [0, 1], ['0%', '-65%']);

  return (
    <section id="projects" ref={containerRef} className="relative" style={{ height: '300vh' }}>
      <div className="sticky top-0 h-screen flex flex-col justify-center overflow-hidden">
        {/* Header */}
        <div className="px-6 md:px-12 mb-10">
          <div className="max-w-[1400px] mx-auto flex items-center gap-6">
            <RevealText className="font-mono text-xs tracking-[0.25em] uppercase text-ink-muted">
              Selected Work
            </RevealText>
          </div>
        </div>

        {/* Horizontal scroll strip */}
        <motion.div
          ref={scrollRef}
          style={{ x }}
          className="flex gap-8 md:gap-12 pl-6 md:pl-12 pr-[20vw]"
        >
          {projects.map((project, i) => (
            <ProjectCard key={i} project={project} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
