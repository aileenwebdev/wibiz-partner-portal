/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./client/index.html", "./client/src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        orange: {
          50:  "#fdf4ec",
          100: "#fae3cc",
          200: "#f4c499",
          300: "#ec9c5e",
          400: "#c06800",
          500: "#824600",
          600: "#6d3a00",
          700: "#572e00",
        },
        navy: {
          DEFAULT: "#15283A",
          50:  "#e8ecf1",
          100: "#c5cfd9",
          200: "#9eafbf",
          300: "#778ea5",
          400: "#3d5a72",
          500: "#15283A",
          600: "#112132",
          700: "#0d1a27",
          800: "#090f1a",
        },
      },
      backgroundImage: {
        "brand-gradient": "linear-gradient(154deg, #15283A 0%, #824600 100%)",
      },
    },
  },
  plugins: [],
};
