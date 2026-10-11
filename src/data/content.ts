export const EMAIL = 'natehu2003@gmail.com';
export const RESUME_URL = '/contents/Nate.pdf';

export const socials = [
  { label: 'github', href: 'https://github.com/NateHu203' },
  { label: 'linkedin', href: 'https://www.linkedin.com/in/xinyuanhu03204/' },
  { label: 'scholar', href: 'https://scholar.google.com/citations?user=v-W5zIYAAAAJ&hl=en' },
];

export interface Role {
  title: string;
  org: string;
  period: string;
  bullets: string[];
  stack: string[];
}

export const roles: Role[] = [
  {
    title: 'Founding AI Engineer',
    org: 'Huddle',
    period: 'Now',
    bullets: [],
    stack: [],
  },
  {
    title: 'AI Software Engineering Intern',
    org: 'Électricité de France, Beijing',
    period: 'Jun–Aug 2025',
    bullets: [
      'Cut analyst review time by 60% by shipping an AI-native news monitoring pipeline — combining LLM classification, agentic workflows, and prompt engineering to surface industrial electrification projects at 95%+ accuracy',
      'Drove a 21% reduction in processing costs by designing a self-correcting feedback loop that analyzed analyst corrections to continuously refine classification logic and optimize token usage',
      'Delivered a production-ready AI data service with Firecrawl/Crawl4AI web scraping, structured JSON schema validation, and real-time search API enrichment',
    ],
    stack: ['Python', 'LLMs', 'Firecrawl', 'Crawl4AI', 'Harness Engineering', 'Data Scraping'],
  },
  {
    title: 'Research Assistant',
    org: 'Future Intelligence Lab, Tsinghua University',
    period: 'Jun 2024–Jan 2025',
    bullets: [
      'Developed an edge-cloud LLM collaboration framework: 66% less reasoning time, 83% lower API cost',
      "Published 3 research papers including one accepted at ACM Web Conference (WWW'25)",
      'Focus: large reasoning models, small and large model collaboration, on-device AI agents',
    ],
    stack: ['Python', 'NLP', 'LLMs', 'Workflow Orchestration'],
  },
  {
    title: 'Research & Teaching Assistant',
    org: 'QTM Department, Emory University',
    period: '2023–2025',
    bullets: [
      'NLP research on StackExchange posts (2014–2022) to surface linguistic trends',
      'Email dataset preprocessing and syntactic analysis with Prof. Sandeep Soni',
      'TA for QTM 340: Approaches to Data Science with Text',
    ],
    stack: ['Python', 'NLP', 'Teaching'],
  },
  {
    title: 'Data Intelligence Intern',
    org: 'YSTen Technology Co., Ltd.',
    period: 'May–Jul 2023',
    bullets: [
      'Designed the URNAU and MANU metrics for measuring TV streaming engagement',
      'Cut computing time by 21% and memory use by 15%',
    ],
    stack: ['Hive', 'MySQL'],
  },
  {
    title: 'Data Analyst Intern',
    org: 'HireBeat Inc.',
    period: 'Feb–Apr 2023',
    bullets: [
      'Analyzed JOLTS and CES data for employment trends in the HR SaaS market',
      'Tuned Google Analytics funnels: 18% more traffic, 8% more revenue',
    ],
    stack: ['SQL', 'BigQuery', 'Data Analytics'],
  },
];

export interface Project {
  title: string;
  type: string;
  desc: string;
  tech: string[];
  image?: string;
  fit?: 'contain' | 'cover';
  github: string;
  /** width / height of the hung painting */
  ratio: number;
}

export const projects: Project[] = [
  {
    title: 'TechBridge HomeBridger',
    type: 'Data science capstone',
    desc: 'Analyzed nonprofit service delivery data to maximize community impact through ML-driven insights and interactive Streamlit dashboards.',
    tech: ['Python', 'Machine Learning', 'Streamlit'],
    image: '/contents/Techbridge-Homebridger-Primary.svg',
    fit: 'contain',
    github: 'https://github.com/NateHu203/Capstone-Project-TechBridge',
    ratio: 4 / 3,
  },
  {
    title: 'EmaiLLM',
    type: 'AI and NLP',
    desc: 'AI-powered intelligent email filtering system using LLMs and prompt engineering for automated bulk email classification and cleanup.',
    tech: ['Python', 'LLM', 'Prompt Engineering'],
    image: '/contents/emaillm.png',
    github: 'https://github.com/NateHu203/EmaiLLM',
    ratio: 1,
  },
  {
    title: 'Anime Rec System',
    type: 'Machine learning',
    desc: 'Personalized recommendation engine using collaborative filtering and content-based approaches, served via Flask.',
    tech: ['Python', 'Scikit-learn', 'Flask'],
    image: '/contents/anime.png',
    github: 'https://github.com/NateHu203/CS-470-Anime-Recommendation-System',
    ratio: 1240 / 705,
  },
  {
    title: 'Career Path Prediction',
    type: 'Transformers',
    desc: 'Transformer-based model for analyzing and forecasting professional career trajectories using Hugging Face.',
    tech: ['Python', 'Transformers', 'Hugging Face'],
    image: '/contents/career-path-la-gi.jpg',
    github: 'https://github.com/NateHu203/Career-Path-Prediction-QTM347',
    ratio: 1200 / 628,
  },
];

export interface Paper {
  title: string;
  venue: string;
  venueTag: string;
  year: string;
  /** how the venue reads on the page */
  cite: string;
  image: string;
  url: string;
  ratio: number;
}

export const papers: Paper[] = [
  {
    title: 'Division-of-Thoughts: Harnessing Hybrid Language Model Synergy for Efficient On-Device Agents',
    venue: 'ACM Web Conference 2025',
    venueTag: "WWW '25",
    year: '2025',
    cite: 'The ACM Web Conference 2025 (WWW ’25)',
    image: '/contents/DoT.png',
    ratio: 823 / 471,
    url: 'https://dl.acm.org/doi/abs/10.1145/3696410.3714765',
  },
  {
    title: 'Towards Large Reasoning Models: A Survey of Reinforced Reasoning with Large Language Models',
    venue: 'Patterns',
    venueTag: 'Cell Press',
    year: '2025',
    cite: 'Patterns, Cell Press, 2025',
    image: '/contents/LRM.png',
    ratio: 874 / 363,
    url: 'https://www.cell.com/patterns/fulltext/S2666-3899(25)00218-1',
  },
  {
    title: 'LIMP: Large Language Model Enhanced Intent-aware Mobility Prediction',
    venue: 'arXiv preprint',
    venueTag: 'arXiv',
    year: '2024',
    cite: 'arXiv preprint, 2024',
    image: '/contents/LIMP.png',
    ratio: 932 / 465,
    url: 'https://arxiv.org/abs/2408.12832',
  },
];
