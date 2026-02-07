/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Darker black-gray aesthetic; keep teal accents
        aurora: {
          bg: '#0f1114',
          header: '#12151a',
          card: '#181b20',
          cardHover: '#1e2228',
          muted: '#6B7280',
          border: 'rgba(255,255,255,0.06)',
          navInactive: '#3f4349',
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
