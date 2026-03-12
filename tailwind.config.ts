import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      colors: {
        surface: {
          DEFAULT: "#141917",
          light: "#1c2321",
          lighter: "#243029",
        },
        brand: {
          DEFAULT: "#34B27B",
          light: "#3ecf8e",
          dark: "#2a9468",
        },
        "border-subtle": {
          DEFAULT: "#1f2a25",
          light: "#2a3730",
        },
        glass: {
          50: "rgba(255, 255, 255, 0.03)",
          100: "rgba(255, 255, 255, 0.05)",
          200: "rgba(255, 255, 255, 0.08)",
        },
      },
      animation: {
        "fade-in": "fade-in 0.5s ease-out forwards",
        "slide-in-right": "slide-in-right 0.3s ease-out forwards",
        "pulse-slow": "pulse-slow 8s ease-in-out infinite",
        "pulse-slower": "pulse-slower 12s ease-in-out infinite",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in-right": {
          "0%": { transform: "translateX(100%)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        "pulse-slow": {
          "0%, 100%": {
            transform: "scale(1) translate(0, 0)",
            opacity: "0.07",
          },
          "50%": {
            transform: "scale(1.1) translate(5%, -5%)",
            opacity: "0.1",
          },
        },
        "pulse-slower": {
          "0%, 100%": {
            transform: "scale(1) translate(0, 0)",
            opacity: "0.04",
          },
          "50%": {
            transform: "scale(1.15) translate(-5%, 5%)",
            opacity: "0.06",
          },
        },
      },
    },
  },
  plugins: [],
};

export default config;
