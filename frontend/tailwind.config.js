/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Dark dashboard palette: sleek, professional
        surface: {
          800: '#1e293b',
          700: '#334155',
          600: '#475569',
          500: '#64748b',
        },
        accent: {
          DEFAULT: '#38bdf8',
          dim: '#0ea5e9',
        },
      },
    },
  },
  plugins: [],
};
