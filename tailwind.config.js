/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        pastel: {
          green: '#D1FAE5',
          'green-dark': '#065F46',
          'green-border': '#A7F3D0',
          blue: '#DBEAFE',
          'blue-dark': '#1E40AF',
          'blue-border': '#BFDBFE',
          red: '#FEE2E2',
          'red-dark': '#991B1B',
          'red-border': '#FECACA',
          amber: '#FEF3C7',
          'amber-dark': '#92400E',
          'amber-border': '#FDE68A',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
