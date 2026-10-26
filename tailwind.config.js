/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#14213D',
          dark: '#0B132B',
          light: '#1F3158',
        },
        primary: {
          DEFAULT: '#14213D',
          foreground: '#FFFFFF',
        },
        electric: {
          DEFAULT: '#2563EB',
          dark: '#1D4ED8',
          light: '#3B82F6',
          subtle: '#EFF6FF',
        },
        accent: {
          teal: '#14B8A6',
          'teal-light': '#CCFBF1',
          'teal-dark': '#0F766E',
        },
        surface: {
          DEFAULT: '#F7F9FC',
          card: '#FFFFFF',
          muted: '#F1F5F9',
        },
        brand: {
          main: '#172033',
          secondary: '#64748B',
          muted: '#94A3B8',
          border: '#E2E8F0',
        },
        status: {
          success: '#16A34A',
          warning: '#F59E0B',
          error: '#DC2626',
          info: '#2563EB',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      borderRadius: {
        'card': '14px',
      },
      boxShadow: {
        'subtle': '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.03)',
        'card': '0 4px 6px -1px rgba(20, 33, 61, 0.04), 0 2px 4px -1px rgba(20, 33, 61, 0.02)',
        'elevated': '0 10px 15px -3px rgba(20, 33, 61, 0.07), 0 4px 6px -2px rgba(20, 33, 61, 0.03)',
      }
    },
  },
  plugins: [],
}
