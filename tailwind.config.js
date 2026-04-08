/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        serif: ['Cormorant Garamond', 'Georgia', 'serif'],
        sans: ['Outfit', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        cream: '#F5F2ED',
        ink: '#1a1a1a',
        'ink-light': '#3a3a3a',
        'ink-muted': '#888',
        'ink-faint': '#bbb',
        rust: '#C2542D',
        'warm-border': '#e5e0d8',
        'warm-hover': '#ece8e1',
      },
    },
  },
  plugins: [],
};
