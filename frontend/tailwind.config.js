/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#f0fafb',
          100: '#d9f2f4',
          200: '#b6e4e9',
          300: '#84cfd7',
          400: '#4ab0bc',
          500: '#2e94a2',
          600: '#267788',
          700: '#245f6e',
          800: '#244e5b',
          900: '#22414d',
          950: '#102a34',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
