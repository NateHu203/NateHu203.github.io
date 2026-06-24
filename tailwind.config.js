/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        script: ['"Homemade Apple"', 'cursive'],
        hand: ['Caveat', 'cursive'],
        serif: ['Newsreader', 'Georgia', 'serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        paper: '#F2F1EB',
        card: '#FEFEFB',
        sticky: '#F8EFC5',
        ink: '#24262B',
        'ink-soft': '#44474E',
        'ink-mute': '#80838B',
        'ink-faint': '#B3B5BC',
        line: '#D8D9D2',
        pen: '#2D4F9E',
      },
      boxShadow: {
        note: '0 1px 2px rgba(33,35,41,0.04), 0 10px 24px -8px rgba(33,35,41,0.16)',
        'note-lg': '0 2px 4px rgba(33,35,41,0.05), 0 18px 38px -10px rgba(33,35,41,0.22)',
        sheet: '0 8px 18px rgba(33,35,41,0.1), 0 30px 64px -16px rgba(33,35,41,0.3)',
      },
    },
  },
  plugins: [],
};
