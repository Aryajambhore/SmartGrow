/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: { sans: ['Figtree', 'system-ui', 'sans-serif'] },
      colors: {
        forest: { 950: '#0C2318', 900: '#123524', 800: '#1A4632', 700: '#245A41' },
        leaf: { 50: '#EEF6F0', 100: '#D9EBDF', 500: '#2F8F5B', 600: '#267A4C', 700: '#1E6340' },
        canvas: '#F4F6F2',
        line: '#E1E7DF',
        ink: { 900: '#14211A', 600: '#4A5A50', 400: '#7B897F' },
        warn: { 50: '#FFF6E5', 600: '#B7791F' },
        danger: { 50: '#FDECEA', 600: '#B42318' },
        water: { 50: '#EAF4FA', 600: '#1F6F9C' },
      },
    },
  },
  plugins: [],
}
