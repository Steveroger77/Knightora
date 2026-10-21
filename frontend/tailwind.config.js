/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        obsidian: {
          950: '#050510',
          900: '#0c0c1d',
          800: '#14142b',
          700: '#1e1e3a',
        },
        aurora: {
          300: '#E0F2FE',
          400: '#7DD3FC',
          500: '#38BDF8',
          600: '#0284C7',
          700: '#0369A1',
        },
        teal: {
          300: '#5EEAD4',
          400: '#3ECFCF',
          500: '#14B8A6',
          600: '#0D9488',
        },
        rose: {
          400: '#FB7185',
          500: '#F43F5E',
          600: '#E11D48',
        },
        emerald: {
          400: '#34D399',
          500: '#10B981',
        },
        slate: {
          100: '#FFFFFF',
          200: '#F8FAFC',
          300: '#F1F5F9',
          400: '#E2E8F0',
          500: '#94A3B8',
        },
        glass: {
          light: 'rgba(56, 189, 248, 0.08)',
          medium: 'rgba(56, 189, 248, 0.12)',
          heavy: 'rgba(56, 189, 248, 0.18)',
          border: 'rgba(56, 189, 248, 0.15)',
          white: 'rgba(255, 255, 255, 0.06)',
        },
        brass: {
          300: '#F8FAFC',
          400: '#E2E8F0',
          500: '#94A3B8',
          600: '#64748B',
        },
        crimson: {
          500: '#F43F5E',
          600: '#E11D48',
          700: '#BE123C',
        },
        stone: {
          100: '#FFFFFF',
          200: '#F8FAFC',
          300: '#F1F5F9',
          400: '#E2E8F0',
        },
        ink: {
          500: '#1e1e3a',
          600: '#14142b',
          700: '#0c0c1d',
        },
        parchment: {
          100: '#EAEAFF',
          200: '#D0D0E8',
          300: '#B0B4CC',
        },
      },
      fontFamily: {
        serif: ['Fraunces', 'Newsreader', 'Georgia', 'serif'],
        screenplay: ['"Courier Prime"', 'Courier', 'monospace'],
        prose: ['"Source Serif 4"', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glass': '0 8px 32px rgba(5, 5, 16, 0.4), inset 0 0 0 1px rgba(124, 106, 237, 0.08)',
        'glass-hover': '0 12px 40px rgba(124, 106, 237, 0.15), inset 0 0 0 1px rgba(124, 106, 237, 0.15)',
        'glass-active': '0 4px 16px rgba(124, 106, 237, 0.1), inset 0 0 0 1px rgba(124, 106, 237, 0.2)',
        'glow-sm': '0 0 12px rgba(124, 106, 237, 0.25)',
        'glow-md': '0 0 24px rgba(124, 106, 237, 0.3)',
        'glow-lg': '0 0 48px rgba(124, 106, 237, 0.35)',
        'glow-teal': '0 0 24px rgba(62, 207, 207, 0.2)',
        'wax-seal': '0 4px 20px rgba(124, 106, 237, 0.25), inset 0 1px 0 rgba(255,255,255,0.1)',
        'wax-seal-active': '0 2px 12px rgba(124, 106, 237, 0.2), inset 0 2px 4px rgba(0,0,0,0.3)',
        'parchment-card': '0 8px 32px rgba(5, 5, 16, 0.5), inset 0 0 0 1px rgba(124, 106, 237, 0.1)',
      },
      backgroundImage: {
        'paper-grain': "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.02'/%3E%3C/svg%3E\")",
        'aurora-gradient': 'linear-gradient(135deg, rgba(124,106,237,0.15) 0%, rgba(62,207,207,0.08) 50%, rgba(124,106,237,0.1) 100%)',
      },
      keyframes: {
        'ambient-float': {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)', opacity: '0.08' },
          '33%': { transform: 'translate(30px, -20px) scale(1.1)', opacity: '0.12' },
          '66%': { transform: 'translate(-20px, 15px) scale(0.95)', opacity: '0.06' },
        },
        'ambient-float-alt': {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)', opacity: '0.06' },
          '33%': { transform: 'translate(-25px, 25px) scale(1.15)', opacity: '0.1' },
          '66%': { transform: 'translate(20px, -10px) scale(0.9)', opacity: '0.04' },
        },
        'pulse-glow': {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '0.8' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        'ambient-float': 'ambient-float 20s ease-in-out infinite',
        'ambient-float-alt': 'ambient-float-alt 25s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 3s ease-in-out infinite',
        'shimmer': 'shimmer 2s ease-in-out infinite',
      },
      transitionTimingFunction: {
        'expo-out': 'cubic-bezier(0.16, 1, 0.3, 1)',
        'spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
    },
  },
  plugins: [],
}
