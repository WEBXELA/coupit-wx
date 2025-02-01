/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#62d84e',
        secondary: '#002131',
        light: '#f7f7f7',
      },
    },
  },
  plugins: [],
}