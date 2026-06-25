import type { ReactNode } from 'react';
import type { Variant, Tone } from './layout';

// large, slightly uneven radii — hand-cut paper, not geometry
const RADII: Record<Variant, string> = {
  blob1: '42px 58px 46px 62px / 52px 44px 60px 48px',
  blob2: '50px 40px 56px 44px / 44px 54px 42px 58px',
  blob3: '46px 56px 42px 60px / 56px 44px 58px 46px',
  rect1: '20px 26px 18px 28px',
  rect2: '26px 18px 28px 20px',
  sticky: '8px 12px 8px 12px',
  photo: '4px 6px 4px 5px',
};

const TONES: Record<Tone, string> = {
  cream: '#FEFEFB',
  warm: '#F8F7F0',
  blush: '#F2F4F5',
  sticky: '#F8EFC5',
};

interface Props {
  variant: Variant;
  tone?: Tone;
  tape?: boolean;
  clickable?: boolean;
  children: ReactNode;
}

export default function NoteShell({ variant, tone = 'cream', tape, clickable, children }: Props) {
  const sticky = variant === 'sticky';
  const photo = variant === 'photo';
  const padding = photo ? 'p-2.5 pb-1.5' : sticky ? 'px-5 py-5' : 'px-8 py-7';
  const bg = photo ? '#FFFFFF' : TONES[sticky ? 'sticky' : tone];
  return (
    <div
      data-hover={clickable || undefined}
      className={`note-grain relative shadow-note transition-[box-shadow,transform] duration-300 ease-out hover:shadow-note-lg hover:scale-[1.015] ring-1 ring-ink/[0.04] ${padding}`}
      style={{ borderRadius: RADII[variant], background: bg }}
    >
      {tape && <span className="tape" aria-hidden="true" />}
      {children}
    </div>
  );
}
