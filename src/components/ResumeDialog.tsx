import { useEffect, useRef } from 'react';
import { RESUME_URL } from '../data/content';

export default function ResumeDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      className="resume"
      aria-label="Résumé"
      onClose={onClose}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
    >
      <div className="resume__bar">
        <p className="resume__title">Résumé</p>
        <a href={RESUME_URL} download>
          Download PDF
        </a>
        <button type="button" onClick={onClose}>
          Close
        </button>
      </div>
      {open && <iframe className="resume__doc" src={`${RESUME_URL}#toolbar=0&navpanes=0`} title="Résumé of Xinyuan (Nate) Hu" />}
    </dialog>
  );
}
