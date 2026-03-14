/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#4B4D6D',
          light: '#6B6E94',
          dark: '#32344A',
          50: '#EEEEF5',
          100: '#D5D6E8',
        },
        surface: {
          light: '#F4F4F9',
          dark: '#1A1B2E',
        },
        card: {
          light: '#FFFFFF',
          dark: '#252640',
        },
        accent: {
          blue: '#5B5EA6',
          purple: '#7B6FA0',
          coral: '#E8896A',
          teal: '#4EADA0',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        card: '12px',
      },
      boxShadow: {
        card: '0 2px 8px rgba(75, 77, 109, 0.08)',
      },
    },
  },
  plugins: [],
}
