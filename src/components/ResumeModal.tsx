import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { RESUME_URL } from '../data/content';

export default function ResumeModal({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.22 }}
      className="fixed inset-0 z-[70] flex items-center justify-center p-4"
    >
      <div className="absolute inset-0 bg-ink/30 backdrop-blur-[2px]" onClick={onClose} />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 24, rotate: -1 }}
        animate={{ opacity: 1, scale: 1, y: 0, rotate: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 18, rotate: -1 }}
        transition={{ type: 'spring', stiffness: 280, damping: 26 }}
        className="relative z-10 w-[min(94vw,900px)] h-[86vh] bg-card ring-1 ring-ink/[0.05] rounded-2xl shadow-sheet flex flex-col overflow-hidden"
      >
        <div className="flex items-center justify-between px-6 py-3.5 border-b border-dashed border-line">
          <span className="font-hand text-xl text-ink">resume</span>
          <div className="flex items-center gap-4">
            <a
              href={RESUME_URL}
              download
              data-hover
              className="font-hand text-lg text-pen hover:text-ink transition-colors"
            >
              download ↓
            </a>
            <button
              onClick={onClose}
              data-hover
              aria-label="Close"
              className="font-hand text-lg text-ink-mute hover:text-pen transition-colors"
            >
              close ✕
            </button>
          </div>
        </div>
        <div className="flex-1 bg-paper">
          <iframe
            src={`${RESUME_URL}#toolbar=0&navpanes=0`}
            className="w-full h-full border-0"
            title="Resume"
          />
        </div>
      </motion.div>
    </motion.div>
  );
}
