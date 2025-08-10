/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Enable dark mode with class strategy
  theme: {
    extend: {
      colors: {
        // TrustChain Brand Colors
        navy: {
          500: '#1E3A8A',
          600: '#1e40af',
          700: '#1d4ed8',
        },
        emerald: {
          500: '#10B981',
          400: '#34d399',
          600: '#059669',
        },
        sky: {
          500: '#0EA5E9',
          400: '#38bdf8',
          600: '#0284c7',
        },
        light: {
          50: '#FFFFFF',
          100: '#F4F6F8',
          200: '#E8ECF0',
          300: '#DDE3E8',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        'card': '0 4px 20px -2px rgba(10, 37, 64, 0.1)',
      }
    },
  },
  plugins: [],
}
