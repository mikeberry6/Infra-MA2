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
        heading: ["Roboto Condensed", "Inter Tight", "Inter", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      fontSize: {
        micro: ["11px", "14px"],
        "xs-dense": ["12px", "16px"],
        "sm-dense": ["13px", "20px"],
      },
      colors: {
        canvas: "#f3f3f3",
        surface: {
          DEFAULT: "#ffffff",
          light: "#fafaf9",
          lighter: "#f0f0ee",
        },
        "border-subtle": {
          DEFAULT: "rgba(0, 0, 0, 0.08)",
          light: "rgba(0, 0, 0, 0.05)",
        },
        glass: {
          50: "rgba(0, 0, 0, 0.02)",
          100: "rgba(0, 0, 0, 0.04)",
          200: "rgba(0, 0, 0, 0.06)",
        },
        primary: "#1a1a1a",
        muted: "#6e6e6e",
        tertiary: "#999999",
        hover: "rgba(0, 0, 0, 0.03)",
        accent: "#008253",
      },
      boxShadow: {
        "card": "0 1px 2px rgba(0, 0, 0, 0.04), 0 4px 12px rgba(0, 0, 0, 0.03), inset 0 1px 0 rgba(255, 255, 255, 0.8)",
        "card-hover": "0 2px 4px rgba(0, 0, 0, 0.06), 0 12px 32px rgba(0, 0, 0, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.9)",
        "card-elevated": "0 1px 3px rgba(0, 0, 0, 0.06), 0 8px 24px rgba(0, 0, 0, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.9)",
        "accent-glow": "0 0 16px rgba(0, 130, 83, 0.12), 0 0 4px rgba(0, 130, 83, 0.08)",
        "accent-ring": "0 0 0 3px rgba(0, 130, 83, 0.06)",
      },
      animation: {
        "fade-in": "fade-in 0.5s ease-out forwards",
        "fade-in-up": "fade-in-up 0.6s ease-out forwards",
        "slide-in-right": "slide-in-right 0.3s ease-out forwards",
        "scale-in": "scale-in 0.2s ease-out forwards",
        "pulse-slow": "pulse-slow 8s ease-in-out infinite",
        "pulse-slower": "pulse-slower 12s ease-in-out infinite",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in-right": {
          "0%": { transform: "translateX(100%)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        "scale-in": {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
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
