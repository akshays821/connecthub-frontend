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
        heading: ['Outfit', 'sans-serif'],
      },
      colors: {
        dark: {
          900: '#000000',
          800: '#0f172a', // Main bg
          700: '#1e293b', // Secondary bg
          600: '#334155', // Borders
        },
        primary: {
          500: '#8b5cf6', // Violet 500
          600: '#7c3aed', // Violet 600
        },
        accent: {
          500: '#06b6d4', // Cyan 500
          600: '#ec4899', // Pink 500
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'pulse-slow': 'pulse 3s infinite',
        'text-shimmer': 'text-shimmer 2.5s ease-out infinite alternate',
        'spin-slow': 'spin 15s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}