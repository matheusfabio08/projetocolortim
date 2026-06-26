/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#f0f9fa',
          100: '#d9f0f2',
          200: '#b3e2e6',
          300: '#7dccd2',
          400: '#44adb5',
          500: '#2a919a',
          600: '#267481',
          700: '#1f5c68',
          800: '#1c4c57',
          900: '#1a3f48',
          950: '#0d2730',
        },
        sidebar: '#1a2332',
        'sidebar-hover': '#253347',
        'sidebar-active': '#2d3e52',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
