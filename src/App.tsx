import { useCallback, useEffect, useState } from 'react';
import Hero from './components/Hero';
import { About, Contact, Experience, Papers, Projects } from './components/Sections';
import ResumeDialog from './components/ResumeDialog';
import { initialMood, THEME_COLOR, type Mood } from './lib/mood';
import { wallTile } from './paint/wall';
import { RESUME_URL } from './data/content';

const PHONE_QUERY = '(max-width: 760px), (pointer: coarse)';

export default function App() {
  const [mood, setMood] = useState<Mood>(initialMood);
  const [resumeOpen, setResumeOpen] = useState(false);

  useEffect(() => {
    document.documentElement.dataset.mood = mood;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', THEME_COLOR[mood]);
  }, [mood]);

  // paint the gallery wall once the hero has had the main thread to itself
  useEffect(() => {
    let url: string | null = null;
    let cancelled = false;
    const run = () =>
      wallTile().then((u) => {
        if (cancelled || !u) return;
        url = u;
        document.documentElement.style.setProperty('--wall-tile', `url("${u}")`);
      });
    const t = window.setTimeout(run, 5200);
    return () => {
      cancelled = true;
      window.clearTimeout(t);
      if (url) URL.revokeObjectURL(url);
    };
  }, []);

  // phones get the PDF itself; larger screens get it in a dialog
  const openResume = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
    if (window.matchMedia(PHONE_QUERY).matches) return;
    e.preventDefault();
    setResumeOpen(true);
  }, []);

  return (
    <>
      <a className="skip" href="#content">
        Skip to content
      </a>
      <header className="topbar" aria-label="Site">
        <a className="topbar__name" href="#top">
          Xinyuan Hu
        </a>
        <nav aria-label="Rooms">
          <a href="#about">About</a>
          <a href="#projects">Projects</a>
          <a href="#papers">Papers</a>
          <a href="#experience">Experience</a>
          <a href={RESUME_URL} target="_blank" rel="noopener" onClick={openResume}>
            Résumé
          </a>
        </nav>
      </header>
      <Hero mood={mood} onMood={setMood} onResume={openResume} />
      <main className="wall" id="content">
        <About />
        <Projects />
        <Papers />
        <Experience />
        <Contact onResume={openResume} />
      </main>
      <footer className="colophon">
        <p>© {new Date().getFullYear()} Xinyuan (Nate) Hu</p>
        <p>
          Every painting here is generated in your browser when you visit, so no two visits hang the
          same pictures. Set in Mona Sans.
        </p>
      </footer>
      <ResumeDialog open={resumeOpen} onClose={() => setResumeOpen(false)} />
    </>
  );
}
