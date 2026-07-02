/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        display: ['Fraunces', 'Georgia', 'serif'],
        sans: ['Manrope', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        // Crème / anthracite avec accent tabac
        cream: {
          50: '#fdfcf8',
          100: '#fafaf5',
          200: '#f5f3ec',
          300: '#ebe8dc',
        },
        ink: {
          50: '#f6f6f5',
          100: '#e7e7e5',
          200: '#cecdca',
          300: '#a9a8a3',
          400: '#7e7c76',
          500: '#5e5c57',
          600: '#454440',
          700: '#363533',
          800: '#1f1e1d',
          900: '#0f0e0d',
          950: '#080808',
        },
        ember: {
          50: '#fff4ed',
          100: '#ffe6d4',
          200: '#ffc7a8',
          300: '#ff9f70',
          400: '#fe6f37',
          500: '#fc4a17',
          600: '#ed3008',
          700: '#c42008',
          800: '#9c1c10',
          900: '#7e1b10',
          950: '#440a05',
        },
      },
      letterSpacing: {
        tightest: '-0.04em',
        tighter: '-0.025em',
      },
      boxShadow: {
        'soft': '0 1px 2px rgb(0 0 0 / 0.04), 0 4px 12px rgb(0 0 0 / 0.04)',
        'soft-lg': '0 1px 2px rgb(0 0 0 / 0.04), 0 8px 24px rgb(0 0 0 / 0.06)',
        'glow-ember': '0 0 0 1px rgb(252 74 23 / 0.2), 0 4px 24px rgb(252 74 23 / 0.15)',
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-up': 'slideUp 0.5s cubic-bezier(0.22, 1, 0.36, 1)',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
        slideUp: {
          '0%': { opacity: 0, transform: 'translateY(12px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      backgroundImage: {
        'grain': "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.4'/%3E%3C/svg%3E\")",
      },
    },
  },
  plugins: [],
};
