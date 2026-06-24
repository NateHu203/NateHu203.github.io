import { useEffect, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import NotesCanvas from './components/notes/NotesCanvas';
import MobileStack from './components/MobileStack';
import Sheet from './components/notes/Sheets';
import ResumeModal from './components/ResumeModal';
import InkCursor from './components/InkCursor';
import type { SheetId } from './components/notes/layout';

const COMPACT_QUERY = '(max-width: 900px), (pointer: coarse)';

function useIsCompact() {
  const [compact, setCompact] = useState(
    () => window.matchMedia(COMPACT_QUERY).matches
  );
  useEffect(() => {
    const mq = window.matchMedia(COMPACT_QUERY);
    const onChange = (e: MediaQueryListEvent) => setCompact(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  return compact;
}

export default function App() {
  const compact = useIsCompact();
  const [sheet, setSheet] = useState<SheetId | null>(null);
  const [resumeOpen, setResumeOpen] = useState(false);

  const openResume = () => setResumeOpen(true);

  return (
    <>
      {compact ? (
        <>
          <header className="fixed top-0 inset-x-0 z-40 flex items-center justify-between px-5 py-4 bg-paper/85 backdrop-blur-sm">
            <a href="/" className="font-script text-sm text-ink">
              Nate Hu
            </a>
            <button
              onClick={openResume}
              className="font-hand text-lg leading-none text-pen"
            >
              resume ↓
            </button>
          </header>
          <MobileStack onOpenSheet={setSheet} onOpenResume={openResume} />
        </>
      ) : (
        <NotesCanvas onOpenSheet={setSheet} onOpenResume={openResume} />
      )}

      <AnimatePresence>
        {sheet && <Sheet id={sheet} onClose={() => setSheet(null)} />}
      </AnimatePresence>

      <AnimatePresence>
        {resumeOpen && <ResumeModal onClose={() => setResumeOpen(false)} />}
      </AnimatePresence>

      {!compact && <InkCursor />}
    </>
  );
}
