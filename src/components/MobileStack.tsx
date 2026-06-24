import { motion } from 'framer-motion';
import { LAYOUT, MOBILE_ORDER, type NoteId, type SheetId } from './notes/layout';
import NoteShell from './notes/NoteShell';
import { TEASERS } from './notes/teasers';

interface Props {
  onOpenSheet: (id: SheetId) => void;
  onOpenResume: () => void;
}

const NOTE_LABELS: Partial<Record<NoteId, string>> = {
  about: 'Open about me',
  experience: 'Open experience',
  projects: 'Open projects',
  publications: 'Open publications',
  resume: 'Open résumé',
};

export default function MobileStack({ onOpenSheet, onOpenResume }: Props) {
  const notes = MOBILE_ORDER.map((id) => LAYOUT.find((n) => n.id === id)!);

  return (
    <main className="px-5 pt-24 pb-14 max-w-[460px] mx-auto">
      {notes.map((def, i) => {
        const interactive = !!def.sheet || !!def.action;
        const open = () => {
          if (def.sheet) onOpenSheet(def.sheet);
          else if (def.action === 'resume') onOpenResume();
        };
        return (
          <motion.div
            key={def.id}
            initial={{ opacity: 0, y: 26, rotate: def.rot * 1.5 }}
            whileInView={{ opacity: 1, y: 0, rotate: i % 2 ? 1 : -1 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ type: 'spring', stiffness: 220, damping: 22 }}
            className={`note-focus mb-8 rounded-[24px] ${def.id === 'resume' ? 'w-44 mx-auto' : ''}`}
            role={interactive ? 'button' : undefined}
            tabIndex={interactive ? 0 : undefined}
            aria-label={interactive ? NOTE_LABELS[def.id] : undefined}
            onClick={interactive ? open : undefined}
            onKeyDown={
              interactive
                ? (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      open();
                    }
                  }
                : undefined
            }
          >
            <NoteShell variant={def.variant} tone={def.tone} tape={def.tape} clickable={interactive}>
              {TEASERS[def.id]}
            </NoteShell>
          </motion.div>
        );
      })}

      <footer className="mt-12 text-center">
        <p className="font-mono text-[10px] text-ink-faint">
          © {new Date().getFullYear()} xinyuan (nate) hu
        </p>
      </footer>
    </main>
  );
}
