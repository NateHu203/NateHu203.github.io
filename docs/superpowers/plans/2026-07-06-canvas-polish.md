# Canvas Polish Pass Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the existing "canvas of notes" portfolio feel finished: balanced composition, clear hero hierarchy, GSAP hover/sheet micro-interactions, mobile tap feedback.

**Architecture:** The site is a Vite + React 18 + Tailwind SPA. Desktop renders `NotesCanvas` (matter-js physics positions the outer note wrappers); `NoteShell` is the shared visual shell (desktop + mobile). Sheets/modals mount via `AnimatePresence` in `App.tsx`. This plan adds GSAP for micro-interactions only — matter-js and framer-motion stay. All geometry animation for modals is driven by a new shared hook `useGrowFromOrigin`.

**Tech Stack:** React 18, TypeScript, Tailwind 3, matter-js, framer-motion, **gsap (new)**, Vite 5.

**Spec:** `docs/superpowers/specs/2026-07-06-canvas-polish-design.md`

## Global Constraints

- Palette: pen-blue `#2D4F9E` on cool stationery whites. Never introduce warm cream + terracotta. Tokens in `tailwind.config.js` stay unchanged except where a task says otherwise.
- Rotations within ±4°. Max ~7 content notes — add **no** new notes.
- No outlines on notes, no connector lines, notes never collide with each other.
- Dragging is an unhinted easter egg — do not add any drag hint or nudge copy.
- Every animation respects `prefers-reduced-motion` (fall back to opacity-only or nothing).
- **Testing:** this repo has no unit-test framework and gets none in this plan. Each task verifies with `npm run lint`, `npm run build`, and Playwright probe scripts run from the scratchpad (`playwright-core` is already installed there, driving installed Chrome). The dev server must be running (`npm run dev`, port 5173).
- Scratchpad dir (probes live here, never committed): `/private/tmp/claude-501/-Users-nate-Desktop-Nate-NateHu203-NateHu203-github-io/39f78cf8-fdb8-4f5f-a5d4-47553124ad87/scratchpad`

---

### Task 1: Finish the drag-nudge removal

The working tree already deletes the "(go on — drag them)" div from `NotesCanvas.tsx`, which orphans the `settled`/`dragged` state. Finish the cleanup and commit.

**Files:**
- Modify: `src/components/notes/NotesCanvas.tsx`

**Interfaces:**
- Produces: `NotesCanvas` with no `settled`/`dragged` state; `onStartDrag` still raises z-index on drag.

- [ ] **Step 1: Remove the orphaned state**

In `src/components/notes/NotesCanvas.tsx`:

1. Delete both state lines:
```tsx
  const [settled, setSettled] = useState(false);
  const [dragged, setDragged] = useState(false);
```
2. In the resize handler, delete the line `setSettled(false);` (keep `setLayoutKey((k) => k + 1);`).
3. In the reduced-motion branch, delete the line `setSettled(true);` (keep `setReady(true);`).
4. Delete the `setDragged(true);` line inside `onStartDrag` (keep the z-index loop).
5. Delete the `settleTimer` block:
```tsx
      const settleTimer = window.setTimeout(
        () => setSettled(true),
        250 + LAYOUT.length * 110 + 900
      );
```
   and the matching `window.clearTimeout(settleTimer);` inside `cleanups.push`.

- [ ] **Step 2: Verify**

Run: `npm run lint && npm run build`
Expected: both pass, no unused-variable warnings for this file.

- [ ] **Step 3: Commit**

```bash
git add src/components/notes/NotesCanvas.tsx
git commit -m "Remove drag nudge — dragging stays an unhinted easter egg"
```

---

### Task 2: GSAP hover lift + press feedback in NoteShell

Replace the current CSS `hover:scale-[1.015]` (which fires on every note) with a GSAP paper lift on **clickable notes only**, plus press-down feedback that also serves mobile tap feedback (spec §3, §5).

**Files:**
- Modify: `package.json` (add gsap)
- Modify: `src/components/notes/NoteShell.tsx`

**Interfaces:**
- Consumes: nothing new.
- Produces: `NoteShell` props unchanged (`variant`, `tone?`, `tape?`, `clickable?`, `children`) — Task 4 adds `near?`. The lift animates the NoteShell root (inner element), never the physics-driven outer wrapper.

- [ ] **Step 1: Install gsap**

Run: `npm install gsap`
Expected: `gsap` appears in `package.json` dependencies.

- [ ] **Step 2: Rewrite NoteShell**

Replace the full contents of `src/components/notes/NoteShell.tsx` with:

```tsx
import { useRef, type ReactNode } from 'react';
import gsap from 'gsap';
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

const reduced = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const canHover = () => window.matchMedia('(hover: hover)').matches;

interface Props {
  variant: Variant;
  tone?: Tone;
  tape?: boolean;
  clickable?: boolean;
  children: ReactNode;
}

export default function NoteShell({ variant, tone = 'cream', tape, clickable, children }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLSpanElement>(null);

  // paper lift: shadow deepens (crossfaded via the glow overlay) and the
  // shell rises a touch — only ever on the inner shell, never the
  // physics-driven outer wrapper
  const lift = (on: boolean) => {
    if (!clickable || !canHover() || !ref.current || !glowRef.current) return;
    const d = on ? 0.18 : 0.26;
    gsap.to(glowRef.current, { opacity: on ? 1 : 0, duration: d, ease: 'power2.out' });
    if (!reduced()) gsap.to(ref.current, { y: on ? -3 : 0, duration: d, ease: 'power2.out' });
  };

  const press = (down: boolean) => {
    if (!clickable || !ref.current || reduced()) return;
    gsap.to(ref.current, { scale: down ? 0.985 : 1, duration: 0.12, ease: 'power2.out' });
  };

  const sticky = variant === 'sticky';
  const photo = variant === 'photo';
  const padding = photo ? 'p-2.5 pb-1.5' : sticky ? 'px-5 py-5' : 'px-8 py-7';
  const bg = photo ? '#FFFFFF' : TONES[sticky ? 'sticky' : tone];
  return (
    <div
      ref={ref}
      data-hover={clickable || undefined}
      onPointerEnter={() => lift(true)}
      onPointerLeave={() => {
        lift(false);
        press(false);
      }}
      onPointerDown={() => press(true)}
      onPointerUp={() => press(false)}
      className={`note-grain relative shadow-note ring-1 ring-ink/[0.04] ${padding}`}
      style={{ borderRadius: RADII[variant], background: bg }}
    >
      <span
        ref={glowRef}
        aria-hidden="true"
        className="absolute inset-0 shadow-note-lg opacity-0 pointer-events-none"
        style={{ borderRadius: RADII[variant] }}
      />
      {tape && <span className="tape" aria-hidden="true" />}
      {children}
    </div>
  );
}
```

Note what changed: the old `transition-[box-shadow,transform] duration-300 ease-out hover:shadow-note-lg hover:scale-[1.015]` classes are gone; the glow overlay span is new.

- [ ] **Step 3: Verify behavior with a probe**

Write to `<scratchpad>/probe-hover.mjs`:

```js
import { chromium } from 'playwright-core';

const browser = await chromium.launch({
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  headless: true,
});
const page = await browser.newPage({ viewport: { width: 1440, height: 950 } });
await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
await page.waitForTimeout(3500); // let physics settle

const shellOf = (label) => page.locator(`[aria-label="${label}"] .note-grain`);

// clickable note lifts on hover
const about = shellOf('Open about me');
const before = await about.evaluate((el) => getComputedStyle(el).transform);
await about.hover();
await page.waitForTimeout(350);
const after = await about.evaluate((el) => getComputedStyle(el).transform);
const glow = await about
  .locator('span[aria-hidden]')
  .first()
  .evaluate((el) => getComputedStyle(el).opacity);
console.log('clickable transform changed:', before !== after);
console.log('glow opacity ~1:', Number(glow) > 0.9);

// non-clickable note (hero) must NOT lift
const hero = page.locator('.note-grain', { hasText: 'Nate Hu' }).first();
const hBefore = await hero.evaluate((el) => getComputedStyle(el).transform);
await hero.hover();
await page.waitForTimeout(350);
const hAfter = await hero.evaluate((el) => getComputedStyle(el).transform);
console.log('hero unchanged:', hBefore === hAfter);

await browser.close();
```

Run: `cd <scratchpad> && node probe-hover.mjs`
Expected output: all three lines `true`.

- [ ] **Step 4: Lint, build, commit**

```bash
npm run lint && npm run build
git add package.json package-lock.json src/components/notes/NoteShell.tsx
git commit -m "Add GSAP paper-lift hover and press feedback to clickable notes"
```

---

### Task 3: Composition — centered content box + rebalanced constellation

Notes currently position as fractions of the full viewport; wide screens stretch the cluster and the bottom-center is a dead zone (spec §1).

**Files:**
- Modify: `src/components/notes/layout.ts`
- Modify: `src/components/notes/NotesCanvas.tsx`
- Modify: `src/components/notes/DeskEphemera.tsx`

**Interfaces:**
- Consumes: `NotesCanvas` as left by Task 1.
- Produces: `LAYOUT` fractions now mean "fraction of the centered content box (max 1560×1000)", not of the viewport. `NoteDef` shape unchanged in this task.

- [ ] **Step 1: Content box in NotesCanvas**

In `src/components/notes/NotesCanvas.tsx`, inside `init()`, replace:

```tsx
      const cw = container.clientWidth;
      const ch = container.clientHeight;
      const scale = Math.min(Math.max(Math.min(cw / 1440, ch / 950), 0.8), 1.12);
```

with:

```tsx
      const cw = container.clientWidth;
      const ch = container.clientHeight;
      // notes live in a centered content box so ultra-wide screens don't
      // stretch the constellation apart
      const bw = Math.min(cw, 1560);
      const bh = Math.min(ch, 1000);
      const ox = (cw - bw) / 2;
      const oy = (ch - bh) / 2;
      const scale = Math.min(Math.max(Math.min(bw / 1440, bh / 950), 0.8), 1.12);
```

and in the `LAYOUT.forEach` that fills `homes`, replace:

```tsx
        homes.set(def.id, {
          x: def.x * cw,
          y: def.y * ch,
          rot: (def.rot * Math.PI) / 180,
        });
```

with:

```tsx
        homes.set(def.id, {
          x: ox + def.x * bw,
          y: oy + def.y * bh,
          rot: (def.rot * Math.PI) / 180,
        });
```

- [ ] **Step 2: Constrain DeskEphemera to the same box**

In `NotesCanvas.tsx`'s JSX, replace `<DeskEphemera />` with:

```tsx
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="relative w-full h-full max-w-[1560px] max-h-[1000px]">
          <DeskEphemera />
        </div>
      </div>
```

(`DeskEphemera`'s root is `absolute inset-0`, so it fills the inner box.)

- [ ] **Step 3: Rebalance the home positions**

In `src/components/notes/layout.ts`, replace the `LAYOUT` array with this starting point:

```ts
export const LAYOUT: NoteDef[] = [
  { id: 'hero', x: 0.22, y: 0.42, w: 430, rot: -1.5, variant: 'blob1' },
  { id: 'about', x: 0.53, y: 0.18, w: 320, rot: 2.2, variant: 'blob2', tone: 'warm', sheet: 'about' },
  { id: 'experience', x: 0.81, y: 0.3, w: 330, rot: -2.2, variant: 'rect1', tape: true, sheet: 'experience' },
  { id: 'projects', x: 0.55, y: 0.57, w: 340, rot: -2.5, variant: 'rect2', tape: true, sheet: 'projects' },
  { id: 'publications', x: 0.82, y: 0.74, w: 320, rot: 1.8, variant: 'blob3', tone: 'warm', sheet: 'publications' },
  { id: 'contact', x: 0.19, y: 0.8, w: 320, rot: 2, variant: 'rect1', tone: 'blush', tape: true },
  { id: 'photo', x: 0.45, y: 0.82, w: 188, rot: 3, variant: 'photo', tape: true },
  { id: 'resume', x: 0.9, y: 0.1, w: 180, rot: -4, variant: 'sticky', action: 'resume' },
];
```

- [ ] **Step 4: Move the doodles into margins**

In `src/components/notes/DeskEphemera.tsx`, update the inline positions (starting point):

- pen ring: `left: '66%', top: '82%'` (sits in the gap below projects, right of photo)
- asterisk: `left: '31%', top: '10%'`
- squiggle: `left: '9%', top: '58%'`
- dots: keep, but move the `47%/46%` dot to `48%/44%`.

- [ ] **Step 5: Screenshot iteration loop (judgment step)**

Write to `<scratchpad>/probe-desktop.mjs`:

```js
import { chromium } from 'playwright-core';

const sizes = [
  [1440, 950],
  [1728, 1000],
  [2560, 1300],
];
const browser = await chromium.launch({
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  headless: true,
});
for (const [w, h] of sizes) {
  const page = await browser.newPage({ viewport: { width: w, height: h } });
  await page.emulateMedia({ reducedMotion: 'reduce' }); // settled layout instantly
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);
  await page.screenshot({ path: `desktop-${w}.png` });
  await page.close();
}
await browser.close();
console.log('done');
```

Run: `cd <scratchpad> && node probe-desktop.mjs`, then **look at all three screenshots** and iterate on Step 3/4 values until:

- No empty region larger than roughly 1.5 note-widths anywhere inside the cluster's bounding area.
- The cluster reads centered at 1728 and 2560 (equal side margins; constellation does not stretch).
- No note or doodle clips the viewport edge at 1440×950.
- Doodles sit in margins around notes, never in holes between them.

- [ ] **Step 6: Lint, build, commit**

```bash
npm run lint && npm run build
git add src/components/notes/layout.ts src/components/notes/NotesCanvas.tsx src/components/notes/DeskEphemera.tsx
git commit -m "Rebalance canvas composition inside a centered content box"
```

---

### Task 4: Hierarchy & depth — hero prominence + desk vignette

Spec §2: the hero note should claim the first read; the desk gets a whisper more depth. No palette changes.

**Files:**
- Modify: `src/components/notes/layout.ts`
- Modify: `src/components/notes/NoteShell.tsx`
- Modify: `src/components/notes/NotesCanvas.tsx`
- Modify: `src/components/MobileStack.tsx`
- Modify: `src/index.css`

**Interfaces:**
- Consumes: `NoteShell` from Task 2, `LAYOUT` from Task 3.
- Produces: `NoteDef` gains `near?: boolean`; `NoteShell` gains prop `near?: boolean` (deeper resting shadow).

- [ ] **Step 1: `near` flag on the hero**

In `src/components/notes/layout.ts`, add to the `NoteDef` interface:

```ts
  /** reads "nearest" — larger resting shadow (hero) */
  near?: boolean;
```

and change the hero line to:

```ts
  { id: 'hero', x: 0.22, y: 0.42, w: 460, rot: -1.5, variant: 'blob1', near: true },
```

(width 430 → 460; keep any x/y you tuned in Task 3.)

- [ ] **Step 2: NoteShell honors `near`**

In `src/components/notes/NoteShell.tsx`: add `near?: boolean` to `Props`, destructure it, and change the root className's shadow class from the fixed `shadow-note` to:

```tsx
      className={`note-grain relative ${near ? 'shadow-note-lg' : 'shadow-note'} ring-1 ring-ink/[0.04] ${padding}`}
```

- [ ] **Step 3: Pass it through**

In `src/components/notes/NotesCanvas.tsx` and `src/components/MobileStack.tsx`, add `near={def.near}` to the `<NoteShell ...>` call.

- [ ] **Step 4: Desk vignette**

In `src/index.css`, in the `body` `background-image` stack, change the radial gradient line from:

```css
    radial-gradient(120% 110% at 50% 0%, #f7f6f1 0%, #f0efe9 55%, #e7e7df 100%);
```

to:

```css
    radial-gradient(120% 110% at 50% 0%, #f7f6f1 0%, #f0efe9 52%, #e2e2d8 100%);
```

- [ ] **Step 5: Verify visually, lint, build, commit**

Run `node probe-desktop.mjs` again; confirm the hero is the unambiguous first read at 1440 and the vignette is felt, not seen (edges slightly deeper, no banding).

```bash
npm run lint && npm run build
git add src/components/notes/layout.ts src/components/notes/NoteShell.tsx src/components/notes/NotesCanvas.tsx src/components/MobileStack.tsx src/index.css
git commit -m "Give the hero note near-depth and deepen the desk vignette"
```

---

### Task 5: Sheets grow out of the clicked note

Spec §4. The sheet starts at the clicked note's rect/rotation and expands to center; closing reverses. Origin plumbing runs App-wide; the geometry lives in a shared hook that Task 6 reuses.

**Files:**
- Create: `src/components/useGrowFromOrigin.ts`
- Modify: `src/components/notes/layout.ts` (SheetOrigin type)
- Modify: `src/App.tsx`
- Modify: `src/components/notes/NotesCanvas.tsx`
- Modify: `src/components/MobileStack.tsx`
- Modify: `src/components/notes/Sheets.tsx`

**Interfaces:**
- Consumes: `NoteShell`/`LAYOUT` as of Task 4.
- Produces:
  - `export interface SheetOrigin { x: number; y: number; w: number; h: number; rot: number }` in `layout.ts`.
  - `useGrowFromOrigin(origin: SheetOrigin | null, onClose: () => void): { panelRef: RefObject<HTMLDivElement>; contentRef: RefObject<HTMLDivElement>; close: () => void }` — Task 6 reuses this exact signature.
  - Prop signatures become `onOpenSheet(id: SheetId, origin: SheetOrigin | null)` and `onOpenResume(origin: SheetOrigin | null)` on both `NotesCanvas` and `MobileStack`.

- [ ] **Step 1: SheetOrigin type**

In `src/components/notes/layout.ts` add:

```ts
/** screen-space rect + rotation of the note a sheet grows out of */
export interface SheetOrigin {
  x: number;
  y: number;
  w: number;
  h: number;
  rot: number;
}
```

- [ ] **Step 2: The hook**

Create `src/components/useGrowFromOrigin.ts`:

```ts
import { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import type { SheetOrigin } from './notes/layout';

const reduced = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Grows a fixed, centered panel out of the note that opened it and shrinks
 * it back on close. Attach panelRef to the panel and contentRef to its
 * inner content; route every close path (button, backdrop, Escape) through
 * the returned `close`, which runs the reverse animation before onClose.
 * With no origin or reduced motion it degrades to the caller's plain fade.
 */
export function useGrowFromOrigin(origin: SheetOrigin | null, onClose: () => void) {
  const panelRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const closing = useRef(false);

  useLayoutEffect(() => {
    const panel = panelRef.current;
    if (!panel || !origin || reduced()) return;
    const final = panel.getBoundingClientRect();
    const dx = origin.x + origin.w / 2 - (final.left + final.width / 2);
    const dy = origin.y + origin.h / 2 - (final.top + final.height / 2);
    gsap.set(panel, {
      x: dx,
      y: dy,
      scaleX: origin.w / final.width,
      scaleY: origin.h / final.height,
      rotation: origin.rot,
      opacity: 0.55,
    });
    gsap.to(panel, {
      x: 0,
      y: 0,
      scaleX: 1,
      scaleY: 1,
      rotation: -0.4,
      opacity: 1,
      duration: 0.45,
      ease: 'power3.out',
    });
    if (contentRef.current) {
      gsap.fromTo(
        contentRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.3, delay: 0.16, ease: 'power1.out' }
      );
    }
    // runs once on mount — origin never changes while open
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const close = () => {
    if (closing.current) return;
    closing.current = true;
    const panel = panelRef.current;
    if (!panel || !origin || reduced()) {
      onClose();
      return;
    }
    const final = panel.getBoundingClientRect();
    const dx = origin.x + origin.w / 2 - (final.left + final.width / 2);
    const dy = origin.y + origin.h / 2 - (final.top + final.height / 2);
    if (contentRef.current) {
      gsap.to(contentRef.current, { opacity: 0, duration: 0.14 });
    }
    gsap.to(panel, {
      x: dx,
      y: dy,
      scaleX: origin.w / final.width,
      scaleY: origin.h / final.height,
      rotation: origin.rot,
      opacity: 0,
      duration: 0.3,
      ease: 'power3.in',
      onComplete: onClose,
    });
  };

  return { panelRef, contentRef, close };
}
```

- [ ] **Step 3: Plumb origins through App**

In `src/App.tsx`:

```tsx
import { useEffect, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import NotesCanvas from './components/notes/NotesCanvas';
import MobileStack from './components/MobileStack';
import Sheet from './components/notes/Sheets';
import ResumeModal from './components/ResumeModal';
import InkCursor from './components/InkCursor';
import type { SheetId, SheetOrigin } from './components/notes/layout';

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
  const [sheet, setSheet] = useState<{ id: SheetId; origin: SheetOrigin | null } | null>(null);
  const [resume, setResume] = useState<{ origin: SheetOrigin | null } | null>(null);

  const openSheet = (id: SheetId, origin: SheetOrigin | null) => setSheet({ id, origin });
  const openResume = (origin: SheetOrigin | null) => setResume({ origin });

  return (
    <>
      {compact ? (
        <>
          <header className="fixed top-0 inset-x-0 z-40 flex items-center justify-between px-5 py-4 bg-paper/85 backdrop-blur-sm">
            <a href="/" className="font-script text-sm text-ink">
              Nate Hu
            </a>
            <button
              onClick={(e) => {
                const r = e.currentTarget.getBoundingClientRect();
                openResume({ x: r.left, y: r.top, w: r.width, h: r.height, rot: 0 });
              }}
              className="font-hand text-lg leading-none text-pen"
            >
              resume ↓
            </button>
          </header>
          <MobileStack onOpenSheet={openSheet} onOpenResume={openResume} />
        </>
      ) : (
        <NotesCanvas onOpenSheet={openSheet} onOpenResume={openResume} />
      )}

      <AnimatePresence>
        {sheet && (
          <Sheet id={sheet.id} origin={sheet.origin} onClose={() => setSheet(null)} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {resume && <ResumeModal onClose={() => setResume(null)} />}
      </AnimatePresence>

      {!compact && <InkCursor />}
    </>
  );
}
```

(`ResumeModal` does not receive `origin` yet — its prop lands in Task 6, which updates this mount to `<ResumeModal origin={resume.origin} onClose={...} />`. The `resume` state already stores the origin so Task 6 only touches the modal and this one line.)

- [ ] **Step 4: Capture origins at the call sites**

In `src/components/notes/NotesCanvas.tsx`:

```tsx
interface Props {
  onOpenSheet: (id: SheetId, origin: SheetOrigin | null) => void;
  onOpenResume: (origin: SheetOrigin | null) => void;
}
```

(import `SheetOrigin` from `./layout`), and replace the `open` helper:

```tsx
  const open = (def: (typeof LAYOUT)[number]) => {
    const el = noteEls.current.get(def.id);
    const r = el?.getBoundingClientRect() ?? null;
    const origin = r ? { x: r.left, y: r.top, w: r.width, h: r.height, rot: def.rot } : null;
    if (def.sheet) onOpenSheet(def.sheet, origin);
    else if (def.action === 'resume') onOpenResume(origin);
  };
```

In `src/components/MobileStack.tsx`, same `Props` change, and inside the map replace the `open` closure with a version that reads the card element:

```tsx
        const open = (el: HTMLElement) => {
          const r = el.getBoundingClientRect();
          const origin = { x: r.left, y: r.top, w: r.width, h: r.height, rot: def.rot };
          if (def.sheet) onOpenSheet(def.sheet, origin);
          else if (def.action === 'resume') onOpenResume(origin);
        };
```

and update the handlers: `onClick={interactive ? (e) => open(e.currentTarget) : undefined}` and in `onKeyDown` call `open(e.currentTarget)`.

- [ ] **Step 5: Rewire Sheet**

In `src/components/notes/Sheets.tsx`, replace the default export with:

```tsx
export default function Sheet({
  id,
  origin,
  onClose,
}: {
  id: SheetId;
  origin: SheetOrigin | null;
  onClose: () => void;
}) {
  const { panelRef, contentRef, close } = useGrowFromOrigin(origin, onClose);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    document.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const Content = CONTENT[id];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.22 }}
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-8"
    >
      <div
        className="absolute inset-0 bg-ink/25 backdrop-blur-[2px]"
        onClick={close}
      />
      <div
        ref={panelRef}
        className="relative z-10 w-[min(94vw,780px)] max-h-[88vh] overflow-y-auto bg-card ring-1 ring-ink/[0.05] shadow-sheet px-7 sm:px-12 py-10 sm:py-12"
        style={{ borderRadius: '24px 30px 22px 32px', rotate: origin ? undefined : '-0.4deg' }}
      >
        <span className="tape" aria-hidden="true" />
        <button
          onClick={close}
          data-hover
          aria-label="Close"
          className="sticky top-0 float-right -mt-4 -mr-2 sm:-mr-6 font-hand text-xl text-ink-mute hover:text-pen transition-colors bg-card/90 rounded-full px-3 py-1"
        >
          close ✕
        </button>
        <div ref={contentRef}>
          <Content />
        </div>
      </div>
    </motion.div>
  );
}
```

Imports at top of the file: add `import { useGrowFromOrigin } from '../useGrowFromOrigin';` and `SheetOrigin` to the layout type import. The inner `motion.div` panel (with the spring) is gone — GSAP owns the panel now; framer keeps only the outer fade.

- [ ] **Step 6: Probe open/close**

Write to `<scratchpad>/probe-sheet.mjs`:

```js
import { chromium } from 'playwright-core';

const browser = await chromium.launch({
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  headless: true,
});
const page = await browser.newPage({ viewport: { width: 1440, height: 950 } });
await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
await page.waitForTimeout(3500);

// open: click the about note, panel should end centered at identity transform
await page.locator('[aria-label="Open about me"]').click();
await page.waitForTimeout(200);
await page.screenshot({ path: 'sheet-opening.png' }); // mid-animation
await page.waitForTimeout(600);
const heading = await page.locator('h2', { hasText: 'about me' }).isVisible();
console.log('sheet open:', heading);
await page.screenshot({ path: 'sheet-open.png' });

// close via Escape: sheet should animate out then unmount
await page.keyboard.press('Escape');
await page.waitForTimeout(700);
console.log('sheet closed:', !(await page.locator('h2', { hasText: 'about me' }).isVisible().catch(() => false)));

// reopen and close via backdrop
await page.locator('[aria-label="Open projects"]').click();
await page.waitForTimeout(700);
await page.mouse.click(30, 30);
await page.waitForTimeout(700);
console.log('backdrop close ok:', !(await page.locator('h2', { hasText: 'projects' }).isVisible().catch(() => false)));

await browser.close();
```

Run: `cd <scratchpad> && node probe-sheet.mjs`
Expected: three `true` lines. **Look at `sheet-opening.png`** — the panel should visibly be between the note and center (smaller, offset toward the note), proving the grow effect.

Also check reduced motion: rerun with `await page.emulateMedia({ reducedMotion: 'reduce' })` inserted after `newPage` — open/close must still work (plain fade).

- [ ] **Step 7: Lint, build, commit**

```bash
npm run lint && npm run build
git add src/components/useGrowFromOrigin.ts src/components/notes/layout.ts src/App.tsx src/components/notes/NotesCanvas.tsx src/components/MobileStack.tsx src/components/notes/Sheets.tsx
git commit -m "Sheets grow out of the clicked note (GSAP origin transition)"
```

---

### Task 6: Résumé modal grows from the sticky note

Same treatment for `ResumeModal` via the Task-5 hook.

**Files:**
- Modify: `src/components/ResumeModal.tsx`
- Modify: `src/App.tsx` (pass `origin`)

**Interfaces:**
- Consumes: `useGrowFromOrigin(origin, onClose)` from Task 5, `SheetOrigin` from `layout.ts`.
- Produces: `ResumeModal` props become `{ origin: SheetOrigin | null; onClose: () => void }`.

- [ ] **Step 1: Rewire ResumeModal**

Replace the contents of `src/components/ResumeModal.tsx` with:

```tsx
import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { RESUME_URL } from '../data/content';
import { useGrowFromOrigin } from './useGrowFromOrigin';
import type { SheetOrigin } from './notes/layout';

export default function ResumeModal({
  origin,
  onClose,
}: {
  origin: SheetOrigin | null;
  onClose: () => void;
}) {
  const { panelRef, contentRef, close } = useGrowFromOrigin(origin, onClose);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    document.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.22 }}
      className="fixed inset-0 z-[70] flex items-center justify-center p-4"
    >
      <div className="absolute inset-0 bg-ink/30 backdrop-blur-[2px]" onClick={close} />

      <div
        ref={panelRef}
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
              onClick={close}
              data-hover
              aria-label="Close"
              className="font-hand text-lg text-ink-mute hover:text-pen transition-colors"
            >
              close ✕
            </button>
          </div>
        </div>
        <div ref={contentRef} className="flex-1 bg-paper">
          <iframe
            src={`${RESUME_URL}#toolbar=0&navpanes=0`}
            className="w-full h-full border-0"
            title="Resume"
          />
        </div>
      </div>
    </motion.div>
  );
}
```

Note: the hook animates the panel to `rotation: -0.4`; that is acceptable for this modal too (paper feel, consistent with sheets).

- [ ] **Step 2: Pass origin from App**

In `src/App.tsx`, change the resume mount to:

```tsx
      <AnimatePresence>
        {resume && (
          <ResumeModal origin={resume.origin} onClose={() => setResume(null)} />
        )}
      </AnimatePresence>
```

- [ ] **Step 3: Probe**

Extend/rerun the sheet probe pattern: click `[aria-label="Open résumé"]` (the sticky note), verify the header text `resume` appears, Escape closes. On mobile viewport (390×844) tap the header `resume ↓` button and verify open/close too.

- [ ] **Step 4: Lint, build, commit**

```bash
npm run lint && npm run build
git add src/components/ResumeModal.tsx src/App.tsx
git commit -m "Résumé modal grows out of the sticky note"
```

---

### Task 7: Final verification sweep

**Files:** none modified (fixes go back to the owning task's files if found).

- [ ] **Step 1: Full probe run**

With the dev server running, from the scratchpad run:

```bash
node probe-desktop.mjs && node probe-hover.mjs && node probe-sheet.mjs && node probe-mobile.mjs
```

Expected: all assertions true; look at every screenshot. Additionally probe 320×844 mobile (edit `probe-mobile.mjs` viewport) — cards must keep gutters ≥12px.

- [ ] **Step 2: Reduced-motion sweep**

Rerun `probe-sheet.mjs` and `probe-hover.mjs` with `page.emulateMedia({ reducedMotion: 'reduce' })`: notes appear at rest instantly, hover produces shadow-only change (no transform y), sheets open/close with plain fade.

- [ ] **Step 3: Keyboard pass**

Probe: `Tab` to a note, press `Enter` — sheet opens; `Escape` closes. (Focus ring `.note-focus:focus-visible` unchanged.)

- [ ] **Step 4: Lint + production build + preview**

```bash
npm run lint && npm run build && npm run preview -- --port 4173 &
```

Screenshot `http://localhost:4173/` at 1440×950 — matches dev.

- [ ] **Step 5: Commit any stragglers; done**

```bash
git status   # should be clean except untracked scratch files (none in repo)
```
