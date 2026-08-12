import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        charcoal: "#1F1F1F",
        orange: "#FF6A1A",
        peach: "#FFB27A",
        stone: "#A89D92",
        dgray: "#4A4A4A",
        cream: "#FFF6E8"
      },
      fontFamily: {
        display: ["var(--font-baloo)", "sans-serif"],
        body: ["var(--font-inter)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"]
      },
      borderRadius: {
        blob: "40% 60% 55% 45% / 50% 45% 55% 50%"
      }
    }
  },
  plugins: []
};
export default config;
