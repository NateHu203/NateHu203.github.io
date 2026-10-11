import type { Mood } from '../paint/scene';

export type { Mood };

export const MOODS: Mood[] = ['morning', 'noon', 'breeze', 'rain'];

export const MOOD_LABEL: Record<Mood, string> = {
  morning: 'Morning',
  noon: 'Noon',
  breeze: 'Breeze',
  rain: 'After rain',
};

/** Wall-label titles for each version of the painting. */
export const PAINTING_TITLE: Record<Mood, string> = {
  morning: 'Young wheat, morning mist',
  noon: 'Wheat field in spring',
  breeze: 'Wind in the green wheat',
  rain: 'The field after rain',
};

/** Browser chrome colour per mood (matches the wall). */
export const THEME_COLOR: Record<Mood, string> = {
  morning: '#dfe8ea',
  noon: '#e0ebe5',
  breeze: '#dbe9e2',
  rain: '#dbe3e8',
};

/** Keep in sync with the inline script in index.html. */
export function moodAt(d: Date): Mood {
  const h = d.getHours();
  return h >= 4 && h < 10 ? 'morning' : 'noon';
}

export function initialMood(): Mood {
  const set = document.documentElement.dataset.mood as Mood | undefined;
  return set && MOODS.includes(set) ? set : moodAt(new Date());
}
