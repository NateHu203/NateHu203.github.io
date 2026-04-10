import RevealText, { FadeIn } from './RevealText';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';

interface Paper {
  title: string;
  venue: string;
  venueTag: string;
  year: string;
  image: string;
}

const papers: Paper[] = [
  {
    title: 'Division-of-Thoughts: Harnessing Hybrid Language Model Synergy for Efficient On-Device Agents',
    venue: 'ACM Web Conference 2025',
    venueTag: 'WWW \'25',
    year: '2025',
    image: '/contents/DoT.png',
  },
  {
    title: 'Towards Large Reasoning Models: A Survey of Reinforced Reasoning with Large Language Models',
    venue: 'Patterns',
    venueTag: 'Cell Press',
    year: '2025',
    image: '/contents/LRM.png',
  },
  {
    title: 'LIMP: Large Language Model Enhanced Intent-aware Mobility Prediction',
    venue: 'arXiv preprint',
    venueTag: 'arXiv',
    year: '2024',
    image: '/contents/LIMP.png',
  },
];

function PaperRow({ paper, index }: { paper: Paper; index: number }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });
  const imgY = useTransform(scrollYProgress, [0, 1], [15, -15]);

  return (
    <FadeIn delay={index * 0.1}>
      <div ref={ref} className="group grid md:grid-cols-12 gap-6 md:gap-10 py-10 border-t border-warm-border">
        {/* Image */}
        <div className="md:col-span-4 overflow-hidden rounded-sm bg-warm-hover aspect-[4/3]">
          <motion.img
            src={paper.image}
            alt={paper.title}
            style={{ y: imgY }}
            className="w-full h-[110%] object-cover -mt-[5%] transition-transform duration-700 group-hover:scale-[1.03]"
          />
        </div>

        {/* Content */}
        <div className="md:col-span-8 flex flex-col justify-center">
          <div className="flex items-center gap-3 mb-4">
            <span className="px-3 py-1 font-sans text-xs uppercase text-rust border border-rust/30 rounded-sm">
              {paper.venueTag}
            </span>
            <span className="font-mono text-xs text-ink-faint">{paper.year}</span>
          </div>

          <h3 className="font-serif text-2xl md:text-3xl font-light leading-snug text-ink mb-4">
            {paper.title}
          </h3>

          <p className="font-sans text-sm text-ink-muted">{paper.venue}</p>

          <div className="mt-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-warm-border" />
            <span className="font-sans text-xs text-ink-faint">
              Xinyuan Hu et al.
            </span>
          </div>
        </div>
      </div>
    </FadeIn>
  );
}

export default function Publications() {
  return (
    <section id="publications" className="py-32 md:py-40 px-6 md:px-12">
      <div className="max-w-[1400px] mx-auto">
        <div className="flex items-center gap-6 mb-20">
          <RevealText className="font-mono text-xs tracking-[0.25em] uppercase text-ink-muted">
            Research
          </RevealText>
        </div>

        <div>
          {papers.map((paper, i) => (
            <PaperRow key={i} paper={paper} index={i} />
          ))}
          <div className="border-t border-warm-border" />
        </div>
      </div>
    </section>
  );
}
