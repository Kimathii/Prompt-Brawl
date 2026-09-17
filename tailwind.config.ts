import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        void: "#0a0a12",
        panel: "#12121e",
        line: "#23233a",
        fighterA: "#5ee6ff",
        fighterB: "#ff3e7f",
        ink: "#f1eefa",
        muted: "#7d7a99",
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
      },
      boxShadow: {
        glowA: "0 0 24px 0 rgba(94, 230, 255, 0.35)",
        glowB: "0 0 24px 0 rgba(255, 62, 127, 0.35)",
      },
      keyframes: {
        "pulse-slow": {
          "0%, 100%": { opacity: "0.5" },
          "50%": { opacity: "0.9" },
        },
        shake: {
          "0%, 100%": { transform: "translateX(0)" },
          "25%": { transform: "translateX(-6px)" },
          "75%": { transform: "translateX(6px)" },
        },
      },
      animation: {
        "pulse-slow": "pulse-slow 3.5s ease-in-out infinite",
        shake: "shake 0.22s ease",
      },
    },
  },
  plugins: [],
};

export default config;
