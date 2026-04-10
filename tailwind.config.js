/** @type {import('tailwindcss').Config} */
export default {
  content: ["./client/index.html", "./client/src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        orange: {
          50:  "#fff7ed",
          100: "#ffedd5",
          200: "#fed7aa",
          300: "#fdba74",
          400: "#fb923c",
          500: "#E8620A", // Wibiz/Scale360 brand orange
          600: "#c2500a",
          700: "#9a3f08",
        },
      },
    },
  },
  plugins: [],
};
