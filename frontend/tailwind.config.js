/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Aurora dark, darker + desaturated; bright pops for selected/sparklines
        aurora: {
          bg: '#060809',
          header: '#060809',
          card: '#0A0C0E',
          cardHover: '#0E1114',
          muted: '#6B7280',
          border: 'rgba(255,255,255,0.04)',
          navInactive: '#A8B0BB',
          navActiveBg: '#12161A',
        },
        accent: {
          DEFAULT: '#5C6B7A',
          hover: '#6B7886',
          dim: '#4A5663',
          pop: '#5B9CFE',
          popHover: '#7AB0FF',
        },
        auroraPositive: '#4A5F52',
        auroraNegative: '#7A5A5A',
        auroraWarning: '#7A6B4A',
      },
      fontFamily: {
        sans: ['Quicksand', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        card: '0.75rem',
        input: '0.5rem',
      },
      boxShadow: {
        card: '0 1px 3px 0 rgba(0,0,0,0.25)',
      },
    },
  },
  plugins: [],
};
