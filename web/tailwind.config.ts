import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx,mdx}",
    "./components/**/*.{ts,tsx}",
    "./content/**/*.{md,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: "#05070d",
          surface: "#0a0d18",
          elevated: "#0f1424",
          ridge: "#161c30",
        },
        ink: {
          DEFAULT: "#e7ecf5",
          muted: "#9aa3b9",
          dim: "#5b6478",
          faint: "#2c3346",
        },
        cyan: {
          glow: "#22e6ff",
          neon: "#00d4ff",
          DEFAULT: "#0bbedc",
          deep: "#0a7a8a",
        },
        accent: {
          blue: "#3a7afe",
          violet: "#7b5cff",
          amber: "#ffb547",
          rose: "#ff6b8a",
          green: "#3ddc97",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "ui-sans-serif", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "Menlo", "monospace"],
      },
      boxShadow: {
        glow: "0 0 60px -10px rgba(34, 230, 255, 0.45)",
        "glow-sm": "0 0 30px -5px rgba(34, 230, 255, 0.35)",
        ring: "0 0 0 1px rgba(255,255,255,0.06), 0 8px 30px rgba(0,0,0,0.4)",
      },
      backgroundImage: {
        "grid-faint":
          "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
        "radial-glow":
          "radial-gradient(800px circle at 20% 0%, rgba(34,230,255,0.10), transparent 50%), radial-gradient(700px circle at 90% 30%, rgba(123,92,255,0.08), transparent 60%)",
      },
      animation: {
        "pulse-soft": "pulse 4s cubic-bezier(0.4,0,0.6,1) infinite",
        "scan": "scan 8s linear infinite",
        "float": "float 6s ease-in-out infinite",
        "fade-up": "fadeUp 0.6s ease-out both",
        "blink": "blink 1.1s steps(2) infinite",
        "spotlight": "spotlight 2s ease .75s 1 forwards",
      },
      keyframes: {
        scan: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100%)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        blink: {
          "0%": { opacity: "1" },
          "50%": { opacity: "0" },
        },
        spotlight: {
          "0%": { opacity: "0", transform: "translate(-72%, -62%) scale(0.5)" },
          "100%": { opacity: "1", transform: "translate(-50%,-40%) scale(1)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
