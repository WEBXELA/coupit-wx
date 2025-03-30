/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#F1EFE8',
        secondary: '#2B2C30',
        light: '#f7f7f7',
      },
    },
  },
  plugins: [],
}