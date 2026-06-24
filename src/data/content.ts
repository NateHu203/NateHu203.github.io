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
      "Published 3 research papers including one accepted at ACM Web Conference (WWW'25)",
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

export interface Project {
  title: string;
  type: string;
  desc: string;
  tech: string[];
  image?: string;
  fit?: 'contain' | 'cover';
  github: string;
  num: string;
}

export const projects: Project[] = [
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

export interface Paper {
  title: string;
  venue: string;
  venueTag: string;
  year: string;
  image: string;
}

export const papers: Paper[] = [
  {
    title: 'Division-of-Thoughts: Harnessing Hybrid Language Model Synergy for Efficient On-Device Agents',
    venue: 'ACM Web Conference 2025',
    venueTag: "WWW '25",
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
