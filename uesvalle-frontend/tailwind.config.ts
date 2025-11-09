import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./features/**/*.{js,ts,jsx,tsx,mdx}",
    "./shared/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      colors: {
        primary: {
          DEFAULT: "#FF9B00",
          50: "#FFF4E6",
          100: "#FFE9CC",
          200: "#FFD399",
          300: "#FFBD66",
          400: "#FFA733",
          500: "#FF9B00",
          600: "#E68A00",
          700: "#CC7A00",
          800: "#B36900",
          900: "#995800",
        },
        secondary: {
          DEFAULT: "#BABAB9",
          50: "#F8F8F8",
          100: "#F0F0F0",
          200: "#E5E5E4",
          300: "#D9D9D8",
          400: "#CECECE",
          500: "#BABAB9",
          600: "#A8A8A7",
          700: "#969695",
          800: "#848483",
          900: "#727271",
        },
      },
    },
  },
  plugins: [],
};

export default config;
