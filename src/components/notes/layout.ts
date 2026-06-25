export type NoteId =
  | 'hero'
  | 'about'
  | 'photo'
  | 'experience'
  | 'projects'
  | 'publications'
  | 'contact'
  | 'resume';

export type SheetId = 'about' | 'experience' | 'projects' | 'publications';

export type Variant = 'blob1' | 'blob2' | 'blob3' | 'rect1' | 'rect2' | 'sticky' | 'photo';

export type Tone = 'cream' | 'warm' | 'blush' | 'sticky';

export interface NoteDef {
  id: NoteId;
  /** home position, as fraction of canvas width/height (note center) */
  x: number;
  y: number;
  /** width in px at the 1440×950 reference size */
  w: number;
  /** resting rotation, degrees */
  rot: number;
  variant: Variant;
  tone?: Tone;
  tape?: boolean;
  sheet?: SheetId;
  action?: 'resume';
}

export const LAYOUT: NoteDef[] = [
  { id: 'hero', x: 0.23, y: 0.42, w: 430, rot: -1.5, variant: 'blob1' },
  { id: 'about', x: 0.53, y: 0.17, w: 320, rot: 2.2, variant: 'blob2', tone: 'warm', sheet: 'about' },
  { id: 'experience', x: 0.8, y: 0.3, w: 330, rot: -2.2, variant: 'rect1', tape: true, sheet: 'experience' },
  { id: 'projects', x: 0.57, y: 0.59, w: 340, rot: -2.5, variant: 'rect2', tape: true, sheet: 'projects' },
  { id: 'publications', x: 0.84, y: 0.72, w: 320, rot: 1.8, variant: 'blob3', tone: 'warm', sheet: 'publications' },
  { id: 'contact', x: 0.2, y: 0.82, w: 320, rot: 2, variant: 'rect1', tone: 'blush', tape: true },
  { id: 'photo', x: 0.4, y: 0.8, w: 188, rot: 3, variant: 'photo', tape: true },
  { id: 'resume', x: 0.91, y: 0.1, w: 180, rot: -4, variant: 'sticky' , action: 'resume' },
];

/** stacking order for the mobile single-column fallback */
export const MOBILE_ORDER: NoteId[] = [
  'hero',
  'about',
  'photo',
  'projects',
  'experience',
  'publications',
  'contact',
  'resume',
];
