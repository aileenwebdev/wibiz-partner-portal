/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./client/index.html", "./client/src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sora:   ["Sora", "sans-serif"],
        dm:     ["DM Sans", "sans-serif"],
      },
      colors: {
        amber: {
          DEFAULT: "#FF8900",
          dark:    "#824600",
          pale:    "#FFF3E0",
          glow:    "rgba(255,137,0,0.1)",
        },
        navy: {
          DEFAULT: "#15283A",
          deep:    "#0d1c28",
          light:   "#1e3550",
          60:      "#2a4a6b",
          50:      "#e8ecf1",
          100:     "#c5cfd9",
          200:     "#9eafbf",
          300:     "#778ea5",
          400:     "#3d5a72",
          500:     "#15283A",
          600:     "#112132",
          700:     "#0d1a27",
        },
        surface: "#F5F7FA",
        border:  "#E4E9EF",
        muted:   "#7A8FA6",
        light:   "#B0BFCC",
      },
      backgroundImage: {
        "brand-gradient": "linear-gradient(154deg, #15283A 0%, #824600 100%)",
      },
      boxShadow: {
        card: "0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.06)",
      },
    },
  },
  plugins: [],
};
