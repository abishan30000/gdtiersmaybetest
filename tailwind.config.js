/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        baloo: ['"Baloo 2"', 'system-ui', 'sans-serif']
      },
      colors: {
        bg: {
          DEFAULT: '#0f1115',
          card: '#171a21',
          card2: '#1d2130'
        },
        accent: {
          DEFAULT: '#ff9f3f',
          2: '#ffcc66'
        },
        line: '#2b3143'
      },
      boxShadow: {
        soft: '0 6px 20px rgba(0,0,0,0.35)'
      }
    }
  },
  plugins: []
};
