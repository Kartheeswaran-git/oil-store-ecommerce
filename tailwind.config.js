/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        obsidian: {
          950: '#050505',
          900: '#0a0a0a',
          850: '#0f0f0f',
          800: '#141414',
          700: '#1f1f1f',
          600: '#2e2e2e',
        },
        olive: {
          900: '#1e241e',
          800: '#2b332b',
          700: '#384238',
          600: '#475347',
          500: '#5d6b5d',
          400: '#7b8c7b',
          300: '#9eb09e',
          200: '#c4d1c4',
          100: '#e2ede2',
          50: '#f2f7f2',
        },
        gold: {
          500: '#d4af37',
          400: '#e5c158',
          300: '#f3d57b',
          600: '#b8962b',
          700: '#997a1f',
        },
        primary: 'var(--bg-primary)',
        secondary: 'var(--bg-secondary)',
        'text-main': 'var(--text-primary)',
        'text-sub': 'var(--text-secondary)',
        'glass-bg': 'var(--glass-bg)',
        'glass-border': 'var(--glass-border)'
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Outfit', 'sans-serif'],
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },
      animation: {
        'blob': 'blob 7s infinite',
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out forwards',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        blob: {
          '0%': { transform: 'translate(0px, 0px) scale(1)' },
          '33%': { transform: 'translate(30px, -50px) scale(1.1)' },
          '66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
          '100%': { transform: 'translate(0px, 0px) scale(1)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      }
    },
  },
  plugins: [],
}
