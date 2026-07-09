/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class', '.theme-dark'],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        mabi: {
          red: '#e63946',
          dark: '#1d3557',
          light: '#f1faee',
          accent: '#457b9d'
        }
      }
    },
  },
  plugins: [],
}
