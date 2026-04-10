import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const RESUME_URL = '/contents/Nate.pdf';

const links = [
  { label: 'About', href: '#about' },
  { label: 'Experience', href: '#experience' },
  { label: 'Work', href: '#projects' },
  { label: 'Research', href: '#publications' },
  { label: 'Contact', href: '#contact' },
];

function ResumeModal({ onClose }: { onClose: () => void }) {
  // Close on Escape
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
      transition={{ duration: 0.25 }}
      className="fixed inset-0 z-[100] flex items-center justify-center"
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.3, ease: [0.25, 0.1, 0, 1] }}
        className="relative z-10 w-[90vw] max-w-4xl h-[85vh] bg-cream rounded-lg shadow-2xl flex flex-col overflow-hidden"
      >
        {/* Header bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-warm-border">
          <span className="font-sans text-sm text-ink-muted">Resume</span>
          <div className="flex items-center gap-3">
            <a
              href={RESUME_URL}
              download
              className="px-4 py-2 text-xs font-sans border border-ink rounded-sm text-ink hover:bg-ink hover:text-cream transition-all duration-300"
            >
              Download
            </a>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center text-ink-muted hover:text-ink transition-colors"
              aria-label="Close"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M2 2L14 14M14 2L2 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </div>

        {/* PDF embed */}
        <div className="flex-1 bg-neutral-200">
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

export default function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [showResume, setShowResume] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  return (
    <>
      <motion.header
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.8 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled ? 'py-4 bg-cream/90 backdrop-blur-sm' : 'py-6'
        }`}
      >
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 flex items-center justify-between">
          <a href="#" className="font-serif text-2xl font-semibold text-ink tracking-tight hover-line">
            Nate Hu
          </a>

          <nav className="hidden md:flex items-center gap-10">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="font-sans text-sm text-ink-muted hover:text-ink transition-colors duration-300 hover-line"
              >
                {l.label}
              </a>
            ))}
            <button
              onClick={() => setShowResume(true)}
              className="ml-4 px-5 py-2.5 text-sm font-sans border border-ink rounded-sm text-ink hover:bg-ink hover:text-cream transition-all duration-400"
            >
              Resume
            </button>
          </nav>

          <button
            onClick={() => setOpen(!open)}
            className="md:hidden w-10 h-10 flex flex-col items-end justify-center gap-1.5"
            aria-label="Menu"
          >
            <motion.span
              animate={open ? { rotate: 45, y: 5, width: 24 } : { rotate: 0, y: 0, width: 24 }}
              className="h-[1.5px] bg-ink block origin-center"
            />
            <motion.span
              animate={open ? { opacity: 0 } : { opacity: 1 }}
              className="w-4 h-[1.5px] bg-ink block"
            />
            <motion.span
              animate={open ? { rotate: -45, y: -7, width: 24 } : { rotate: 0, y: 0, width: 16 }}
              className="h-[1.5px] bg-ink block origin-center"
            />
          </button>
        </div>
      </motion.header>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ clipPath: 'circle(0% at calc(100% - 40px) 40px)' }}
            animate={{ clipPath: 'circle(150% at calc(100% - 40px) 40px)' }}
            exit={{ clipPath: 'circle(0% at calc(100% - 40px) 40px)' }}
            transition={{ duration: 0.6, ease: [0.25, 0.1, 0, 1] }}
            className="fixed inset-0 z-40 bg-cream flex flex-col items-start justify-center px-12 gap-6"
          >
            {links.map((l, i) => (
              <motion.a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 + i * 0.06 }}
                className="font-serif text-5xl font-light text-ink hover:text-rust transition-colors"
              >
                {l.label}
              </motion.a>
            ))}
            <motion.button
              onClick={() => { setOpen(false); setShowResume(true); }}
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 + links.length * 0.06 }}
              className="font-serif text-5xl font-light text-ink hover:text-rust transition-colors"
            >
              Resume
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Resume modal */}
      <AnimatePresence>
        {showResume && <ResumeModal onClose={() => setShowResume(false)} />}
      </AnimatePresence>
    </>
  );
}
