// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['Cinzel', 'serif'],
      },
      colors: {
        digi: {
          dark: '#0a0f16',
          darker: '#05080b',
          gold: '#d4af37',
          goldHover: '#f9d77e',
          cyan: '#00e5ff',
          panel: '#111827',
        }
      },
      boxShadow: {
        'glow-cyan': '0 0 10px rgba(0, 229, 255, 0.5)',
        'glow-gold': '0 0 15px rgba(212, 175, 55, 0.4)',
      }
    },
  },
  plugins: [],
}