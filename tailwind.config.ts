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
        sans: ["Geist", "Inter", "system-ui", "sans-serif"],
        mono: ["Geist Mono", "JetBrains Mono", "monospace"],
      },
      fontSize: {
        micro: ["11px", "14px"],
        "xs-dense": ["12px", "16px"],
        "sm-dense": ["13px", "20px"],
      },
      colors: {
        canvas: "#09090B",
        surface: {
          DEFAULT: "#18181B",
          light: "#1f1f23",
          lighter: "#27272A",
        },
        "border-subtle": {
          DEFAULT: "#27272A",
          light: "#3f3f46",
        },
        glass: {
          50: "rgba(255, 255, 255, 0.03)",
          100: "rgba(255, 255, 255, 0.05)",
          200: "rgba(255, 255, 255, 0.08)",
        },
        primary: "#EDEDED",
        muted: "#A1A1AA",
        tertiary: "#52525B",
        hover: "rgba(255, 255, 255, 0.03)",
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
