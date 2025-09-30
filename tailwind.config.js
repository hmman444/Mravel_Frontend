/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Poppins', 'ui-sans-serif', 'system-ui'],
      },
      colors:{
        primary: "#07689F",
        secondary: "#A2D5F2",
        neutral: "#FAFAFA",
        accent: "#FF7E67"
      }
    },
  },
  plugins: [],
}
