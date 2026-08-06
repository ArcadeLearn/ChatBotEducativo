/**
 * Tailwind — tema alineado con campusdemo (slate oscuro + cyan primario).
 */
import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#0284c7",
          foreground: "#f8fafc",
        },
        secondary: {
          DEFAULT: "#14b8a6",
          foreground: "#f8fafc",
        },
        accent: {
          DEFAULT: "#f59e0b",
          foreground: "#0f172a",
        },
      },
      keyframes: {
        "typing-dot": {
          "0%, 100%": { opacity: "0.35", transform: "translateY(0)" },
          "50%": { opacity: "1", transform: "translateY(-3px)" },
        },
        "fade-in": {
          from: { opacity: "0", transform: "translateY(6px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "typing-dot": "typing-dot 1.2s ease-in-out infinite",
        "fade-in": "fade-in 0.25s ease-out",
      },
    },
  },
  plugins: [],
};

export default config;
