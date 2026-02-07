/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Aurora-style dark dashboard: deep charcoal base, softer cards
        aurora: {
          bg: '#1A1E24',
          card: '#22262E',
          cardHover: '#282d36',
          muted: '#6B7280',
          border: 'rgba(255,255,255,0.06)',
        },
        accent: {
          DEFAULT: '#14b8a6',
          hover: '#0d9488',
          dim: '#0f766e',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        card: '0.75rem',
        input: '0.5rem',
      },
      boxShadow: {
        card: '0 1px 3px 0 rgba(0,0,0,0.2)',
      },
    },
  },
  plugins: [],
};
