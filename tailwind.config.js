/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}"], // Update paths to match your project
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: {
          100: "#E6E8F0",
          200: "#BCC1D6",
          300: "#929ABE",
          400: "#6873A5",
          500: "#232D59", // Base color
          600: "#1E284F",
          700: "#191F3E",
          800: "#14172E",
          900: "#0F101F",
        },
        secondary: {
          100: "#FFF9F3",
          200: "#FFF2E6",
          300: "#FDEBD9",
          400: "#FCE5CC",
          500: "#FBEDDA", // Base color
          600: "#E2D1BD",
          700: "#C8B5A1",
          800: "#AF9985",
          900: "#957D69",
        },
        accent: {
          100: "#FFF5E6",
          200: "#FFE4BF",
          300: "#FFD299",
          400: "#FFC173",
          500: "#FF9900", // Base color
          600: "#E68A00",
          700: "#CC7A00",
          800: "#B36B00",
          900: "#995C00",
        },
        neutral: {
          100: "#F9F9F9",
          200: "#F5F5F5", // Base neutral
          300: "#E0E0E0",
          400: "#C4C4C4",
          500: "#A8A8A8",
          600: "#8C8C8C",
          700: "#707070",
          800: "#545454",
          900: "#383838",
        },
        dark: {
          100: "#F2F2F2",
          200: "#D9D9D9",
          300: "#BFBFBF",
          400: "#A6A6A6",
          500: "#1A1A1A", // Base dark gray
          600: "#171717",
          700: "#141414",
          800: "#101010",
          900: "#0D0D0D",
        },
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui"],
        display: ["Merriweather", "serif"], // Elegant for headings
        body: ["Roboto", "sans-serif"], // Modern and clean for readability
      },
      borderRadius: {
        none: "0px",
        sm: "0.25rem",
        md: "0.5rem",
        lg: "0.75rem",
        xl: "1rem",
        '2xl': "1.5rem",
        full: "9999px",
      },
      boxShadow: {
        soft: "0 2px 4px rgba(0, 0, 0, 0.1)", // Light shadow
        medium: "0 4px 6px rgba(0, 0, 0, 0.15)", // Stronger emphasis
        strong: "0 6px 8px rgba(0, 0, 0, 0.2)", // Strong shadow for depth
      },
      spacing: {
        px: "1px",
        0: "0px",
        1: "0.25rem",
        2: "0.5rem",
        3: "0.75rem",
        4: "1rem",
        5: "1.25rem",
        6: "1.5rem",
        8: "2rem",
        10: "2.5rem",
        12: "3rem",
        16: "4rem",
        20: "5rem",
        24: "6rem",
        32: "8rem",
        40: "10rem",
        48: "12rem",
        56: "14rem",
        64: "16rem",
        96: "24rem",
        128: "32rem",
      },
      typography: {
        DEFAULT: {
          css: {
            color: "#1A1A1A",
            h1: { color: "#232D59" },
            h2: { color: "#232D59" },
            h3: { color: "#232D59" },
            a: { color: "#FF9900", textDecoration: "none" },
            strong: { color: "#1A1A1A" },
          },
        },
      },
      screens: {
        xs: "480px", // Small devices
        sm: "640px",
        md: "768px",
        lg: "1024px",
        xl: "1280px",
        '2xl': "1536px",
      },
    },
  },

};
