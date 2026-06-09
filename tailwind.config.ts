import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#E85D26',
          dark: '#C94E1A',
          light: '#FF7A47',
          50: '#FFF3EE',
          100: '#FFE4D5',
          200: '#FFCAAD',
          300: '#FFA67A',
          400: '#FF7A47',
          500: '#E85D26',
          600: '#C94E1A',
          700: '#A83D12',
          800: '#8A3110',
          900: '#6E270E',
        },
        dark: {
          DEFAULT: '#1A1A2E',
          50: '#F0F0F5',
          100: '#D4D4E8',
          200: '#A8A8CC',
          300: '#7070AA',
          400: '#404085',
          500: '#1A1A2E',
          600: '#141428',
          700: '#0F0F1E',
          800: '#0A0A14',
          900: '#05050A',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 3px 0 rgba(0,0,0,0.08), 0 1px 2px 0 rgba(0,0,0,0.05)',
        'card-hover': '0 4px 12px 0 rgba(0,0,0,0.12)',
        sidebar: '4px 0 24px 0 rgba(0,0,0,0.15)',
      },
      backgroundImage: {
        'auth-gradient': 'linear-gradient(135deg, #1A1A2E 0%, #16213E 50%, #0F3460 100%)',
      },
    },
  },
  plugins: [],
} satisfies Config
