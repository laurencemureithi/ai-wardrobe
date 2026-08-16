/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          50: '#f6f6f4',
          100: '#e9e8e3',
          200: '#d3d1c9',
          300: '#b3b0a4',
          400: '#8e8a7b',
          500: '#736f60',
          600: '#5c594d',
          700: '#4a483f',
          800: '#3b3a33',
          900: '#2a2925',
          950: '#1a1916',
        },
        accent: {
          50: '#f0f9f6',
          100: '#daf2e9',
          200: '#b8e5d4',
          300: '#86d1b8',
          400: '#4fb696',
          500: '#2f9a7c',
          600: '#227d63',
          700: '#1d6450',
          800: '#1a5042',
          900: '#164235',
        },
        sand: {
          50: '#faf8f4',
          100: '#f3eee3',
          200: '#e7dcc8',
          300: '#d6c4a3',
          400: '#c2a878',
          500: '#b09058',
          600: '#9a7a48',
          700: '#7e623b',
          800: '#664f33',
          900: '#4d3b27',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        serif: ['"Fraunces"', 'Georgia', 'serif'],
      },
      fontSize: {
        '2xs': ['0.6875rem', { lineHeight: '1rem' }],
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        'shimmer': 'shimmer 1.5s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
};
