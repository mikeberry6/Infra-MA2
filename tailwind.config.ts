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
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
        // Legacy alias — orphan components (Ticker, Earnings) still reference
        // `font-heading`. Resolves to the same Geist sans as the rest of the
        // site so legacy code renders correctly without restating the typeface.
        heading: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      fontSize: {
        "2xs": ["11px", "16px"],
        // Legacy aliases — same reasoning as `font-heading`.
        micro: ["11px", "16px"],
        "xs-dense": ["12px", "16px"],
        "sm-dense": ["13px", "18px"],
      },
      colors: {
        "bg-app": "var(--bg-app)",
        "bg-surface": "var(--bg-surface)",
        "bg-subtle": "var(--bg-subtle)",
        "bg-hover": "var(--bg-hover)",
        "text-primary": "var(--text-primary)",
        "text-secondary": "var(--text-secondary)",
        "text-tertiary": "var(--text-tertiary)",
        "accent-soft": "var(--accent-soft)",
        "accent-hover": "var(--accent-hover)",
        accent: "var(--accent)",
        "bg-overlay": "var(--bg-overlay)",
      },
      boxShadow: {
        card: "0 1px 2px rgba(17, 17, 20, 0.04), 0 4px 12px rgba(17, 17, 20, 0.04)",
        "card-hover": "0 1px 2px rgba(17, 17, 20, 0.05), 0 6px 16px rgba(17, 17, 20, 0.06)",
        "card-elevated": "0 1px 3px rgba(17, 17, 20, 0.06), 0 8px 24px rgba(17, 17, 20, 0.06)",
        overlay: "0 8px 32px rgba(17, 17, 20, 0.08), 0 2px 8px rgba(17, 17, 20, 0.04)",
        "focus-ring": "0 0 0 2px var(--accent-soft)",
      },
      animation: {
        "fade-in": "fade-in 0.4s var(--ease-out, ease-out) forwards",
        "fade-in-up": "fade-in-up 0.5s var(--ease-out, ease-out) forwards",
        "slide-in-right": "slide-in-right 0.3s var(--ease-out, ease-out) forwards",
        "scale-in": "scale-in 0.2s var(--ease-out, ease-out) forwards",
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
      },
      transitionTimingFunction: {
        "out-expo": "cubic-bezier(0.16, 1, 0.3, 1)",
      },
    },
  },
  plugins: [],
};

export default config;
