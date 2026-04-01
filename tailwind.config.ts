import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        heading: ["Inter Tight", "Inter", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      fontSize: {
        micro: ["11px", "14px"],
        "xs-dense": ["12px", "16px"],
        "sm-dense": ["13px", "20px"],
      },
      colors: {
        canvas: "#f5f5f3",
        surface: {
          DEFAULT: "#ffffff",
          light: "#fafaf9",
          lighter: "#f0f0ee",
        },
        "border-subtle": {
          DEFAULT: "#d7d7d7",
          light: "#e5e5e5",
        },
        glass: {
          50: "rgba(0, 0, 0, 0.02)",
          100: "rgba(0, 0, 0, 0.04)",
          200: "rgba(0, 0, 0, 0.06)",
        },
        primary: "#111111",
        muted: "#6b6b6b",
        tertiary: "#999999",
        hover: "rgba(0, 0, 0, 0.03)",
        accent: "#007a4d",
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
