# Canvas Polish Pass — Design

**Date:** 2026-07-06
**Status:** Approved by Nate

## Context

The June 2026 "canvas of notes" portfolio works, but an audit (code review +
screenshots at 390px, 1440px, 1728px) found five weak spots. This pass makes
the existing concept feel finished without touching the approved restraint
rules: pen-blue (`#2D4F9E`) on cool stationery whites, no cream/rust, max ~7
content notes, rotations within ±4°, handwriting as accent only, no outlines
on notes, no connector lines, notes never collide with each other.

Decisions made during brainstorming:

- GSAP is added as a dependency and used only where it genuinely helps
  (hover micro-interactions, sheet transitions). matter-js physics and the
  overall motion system stay.
- Dragging is an intentional easter egg: the "(go on — drag them)" nudge
  stays removed (the currently uncommitted deletion in `NotesCanvas.tsx` is
  kept) and gets **no** replacement hint.
- The blurry polaroid photo stays as-is; lean into the lo-fi look rather
  than replacing or styling against it.

## 1. Composition rebalance (`src/components/notes/layout.ts`)

**Problem:** Note homes are fractions of the full viewport, so wide screens
stretch the cluster apart, and the bottom-center of the canvas is a dead
zone (the circle doodle floats in emptiness). The layout reads top-heavy.

**Fix:**

- Position notes within a **centered content box** capped at ~1560×1000.
  Above that size the box stays fixed and centers; below it, positions scale
  proportionally as today. Note fractions become fractions of the box, not
  the viewport.
- Retune the eight home positions so the cluster balances around the visual
  center: hero remains the left-side anchor; the bottom-center void is
  absorbed by tightening the constellation. No new notes.
- Reposition the `DeskEphemera` doodles (asterisk, squiggle, circle) into
  the margins around the cluster — never in holes inside it.
- Verify with screenshots at 1440×950 and 1728×1000 (headless Chrome with
  `--force-prefers-reduced-motion` to capture the settled layout).

## 2. Hierarchy & depth

**Problem:** Notes are near-white on light greige; cohesive but washed out.
The hero note doesn't clearly claim the first read.

**Fix:**

- Hero note: slightly larger (~430 → ~460 reference width) and a marginally
  deeper shadow so it reads nearest.
- Desk background: keep the exact palette; darken only the outer stop of
  the existing radial gradient in `index.css` for a whisper of vignette.
- No new colors. Design tokens in `tailwind.config.js` untouched.

## 3. Hover micro-interactions (GSAP)

**Problem:** Clickable notes give no hover response beyond the cursor dot;
clickability is only signaled by the handwritten links.

**Fix:**

- Add `gsap` to dependencies.
- On hover of a clickable note, the **inner** `NoteShell` (not the
  physics-driven outer element — nothing may fight matter-js's transform)
  lifts ~3px with a deepened shadow over ~180ms ease-out; on leave it
  settles back slightly slower (~260ms).
- `prefers-reduced-motion`: shadow change only, no translation.
- Non-clickable notes (hero, contact, photo) get no hover lift.

## 4. Sheet continuity (GSAP)

**Problem:** Sheets fade in from nowhere; no continuity with the clicked
note.

**Fix:**

- On open, the sheet **grows out of the clicked note**: it starts at the
  note's screen rect and rotation and expands to its centered resting
  place (final rotation −0.4° as today) while the backdrop fades in.
  Sheet content fades in just after the paper arrives.
- On close (button, backdrop click, or Escape), the sheet shrinks back
  toward the originating note.
- Total open duration ≈ 0.45s; keep the paper-settling feel.
- The résumé modal (`ResumeModal.tsx`) gets the same treatment, originating
  from the yellow sticky note.
- `prefers-reduced-motion`: fall back to the current simple opacity fade.
- Existing behavior preserved: Escape closes, backdrop click closes, body
  scroll locked while open, keyboard/ARIA unchanged.

## 5. Mobile fixes (`src/components/MobileStack.tsx`)

**Problem:** At 390px the hero/about cards bleed off the right edge
mid-sentence — reads as broken.

**Fix:**

- Diagnose and fix the right-edge clipping; ensure consistent gutters
  across the stack at 320–900px widths.
- Add subtle press-down feedback on tappable cards (small scale on
  `:active` or pointer-down).
- No layout redesign; same tokens.

## Out of scope

No new notes, no dark mode, no photo replacement, no palette changes, no
og-image regeneration (the hero's visual identity doesn't change), no
replacement of framer-motion or matter-js.

## Verification

- `npm run lint` and `npm run build` pass.
- Screenshots at 390×844, 1440×950, 1728×1000 confirm composition, mobile
  gutters, and settled layout.
- Manual check: hover lift, sheet open/close from each note, Escape/backdrop
  close, reduced-motion fallbacks, keyboard activation of notes.
