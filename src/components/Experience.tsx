import RevealText, { FadeIn } from './RevealText';
import { motion, useInView } from 'framer-motion';
import { useRef, useState } from 'react';

interface Role {
  title: string;
  org: string;
  period: string;
  bullets: string[];
  stack: string[];
}

const roles: Role[] = [
  {
    title: 'AI Software Engineering Intern',
    org: 'Électricité de France — Beijing',
    period: 'Jun — Aug 2025',
    bullets: [
      'Cut analyst review time by 60% by shipping an AI-native news monitoring pipeline — combining LLM classification, agentic workflows, and prompt engineering to surface industrial electrification projects at 95%+ accuracy',
      'Drove a 21% reduction in processing costs by designing a self-correcting feedback loop that analyzed analyst corrections to continuously refine classification logic and optimize token usage',
      'Delivered a production-ready AI data service with Firecrawl/Crawl4AI web scraping, structured JSON schema validation, and real-time search API enrichment',
    ],
    stack: ['Python', 'LLMs', 'Firecrawl', 'Crawl4AI', 'Harness Engineering', 'Data Scraping'],
  },
  {
    title: 'Research Assistant',
    org: 'Tsinghua University — Future Intelligence Lab',
    period: 'Jun 2024 — Jan 2025',
    bullets: [
      'Developing edge-cloud LLM collaboration framework — 66% reasoning time reduction, 83% API cost savings',
      'Published 3 research papers including one accepted at ACM Web Conference (WWW\'25)',
      'Focus: Large Reasoning Models, Small/Large Model Collaboration, On-Device AI Agents',
    ],
    stack: ['Python', 'NLP', 'LLMs', 'Workflow Orchestration'],
  },
  {
    title: 'Research & Teaching Assistant',
    org: 'Emory University — QTM Department',
    period: '2023 — 2025',
    bullets: [
      'NLP research analyzing StackExchange posts (2014–2022) for linguistic trend discovery',
      'Email dataset preprocessing and syntactic analysis under Prof. Sandeep Soni',
      'TA for QTM 340: Approaches to Data Science with Text',
    ],
    stack: ['Python', 'NLP', 'Teaching'],
  },
  {
    title: 'Data Intelligence Intern',
    org: 'YSTen Technology Co., Ltd.',
    period: 'May — Jul 2023',
    bullets: [
      'Designed URNAU and MANU metrics for TV streaming user engagement measurement',
      'Achieved 21% computing time reduction and 15% memory usage optimization',
    ],
    stack: ['Hive', 'MySQL'],
  },
  {
    title: 'Data Analyst Intern',
    org: 'HireBeat Inc.',
    period: 'Feb — Apr 2023',
    bullets: [
      'JOLTS/CES database analysis for employment trend insights in the HR SaaS market',
      'Google Analytics optimization — 18% traffic increase, 8% revenue growth',
    ],
    stack: ['SQL', 'BigQuery', 'Data Analytics'],
  },
];

function RoleRow({ role, index }: { role: Role; index: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });
  const [expanded, setExpanded] = useState(index === 0);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0 }}
      animate={isInView ? { opacity: 1 } : {}}
      transition={{ duration: 0.6, delay: index * 0.08 }}
      className="border-t border-warm-border"
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full py-8 flex items-start md:items-center justify-between gap-4 text-left group"
        data-hover
      >
        <div className="flex-1 grid md:grid-cols-12 gap-2 md:gap-6 items-baseline">
          <p className="md:col-span-5 font-serif text-2xl md:text-3xl font-light text-ink group-hover:text-rust transition-colors duration-400">
            {role.title}
          </p>
          <p className="md:col-span-4 font-sans text-sm text-ink-muted">
            {role.org}
          </p>
          <p className="md:col-span-3 font-mono text-xs text-ink-faint tracking-wider text-right">
            {role.period}
          </p>
        </div>
        <motion.span
          animate={{ rotate: expanded ? 45 : 0 }}
          transition={{ duration: 0.3 }}
          className="text-ink-muted text-2xl font-light shrink-0 mt-1 md:mt-0"
        >
          +
        </motion.span>
      </button>

      <motion.div
        initial={false}
        animate={{
          height: expanded ? 'auto' : 0,
          opacity: expanded ? 1 : 0,
        }}
        transition={{ duration: 0.4, ease: [0.25, 0.1, 0, 1] }}
        className="overflow-hidden"
      >
        <div className="pb-8 md:pl-0">
          <div className="md:ml-[calc(41.666%+1.5rem)] max-w-xl">
            <ul className="space-y-2 mb-5">
              {role.bullets.map((b, i) => (
                <li key={i} className="font-sans text-sm text-ink-light leading-relaxed pl-4 relative">
                  <span className="absolute left-0 top-2.5 w-1.5 h-px bg-ink-faint" />
                  {b}
                </li>
              ))}
            </ul>
            <div className="flex flex-wrap gap-2">
              {role.stack.map((s) => (
                <span
                  key={s}
                  className="px-3 py-1 font-mono text-[11px] text-ink-muted border border-warm-border rounded-sm"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function Experience() {
  return (
    <section id="experience" className="py-32 md:py-40 px-6 md:px-12">
      <div className="max-w-[1400px] mx-auto">
        <div className="flex items-center gap-6 mb-20">
          <RevealText className="font-mono text-xs tracking-[0.25em] uppercase text-ink-muted">
            Experience
          </RevealText>
        </div>

        <div>
          {roles.map((role, i) => (
            <RoleRow key={i} role={role} index={i} />
          ))}
          <div className="border-t border-warm-border" />
        </div>
      </div>
    </section>
  );
}
