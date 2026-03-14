/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'lt-bg': '#FAFAF8',
        'lt-bg-secondary': '#F0EDE6',
        'lt-dark': '#1A1A2E',
        'lt-text': '#1A1A2E',
        'lt-text-secondary': '#5C5C6F',
        'lt-green': '#2D6A4F',
        'lt-green-light': '#40916C',
        'lt-amber': '#E76F51',
        'lt-blue': '#264653',
        'lt-gold': '#E9C46A',
        'lt-border': '#D4D0C8',
      },
      fontFamily: {
        serif: ['"DM Serif Display"', 'serif'],
        sans: ['"DM Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
}
