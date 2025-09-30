/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ['Roboto', 'ui-sans-serif', 'system-ui'],
        heading: ['Montserrat', 'ui-sans-serif', 'system-ui'],
      },
      colors: {
        primary: "#07689F",
        primaryHover: "#055072",
        secondary: "#A2D5F2",
        secondaryDark: "#7abedf",
        neutral: "#FAFAFA",
        accent: {
          DEFAULT: "#FF7E67",
          light: "#FF9985",
        },
      },
    },
  },
  plugins: [],
}
