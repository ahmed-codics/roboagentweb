import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx,mdx}",
    "./components/**/*.{ts,tsx}",
    "./content/**/*.{md,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        /* Instrument-panel palette. TerminalPreview / ROSGraph render on a
           near-black surface (#0a1424) and were written against these tokens,
           which had never been defined — every label was falling back to the
           inherited body slate-600 and rendering dark-on-dark. */
        ink: {
          DEFAULT: "#e8eefb",
          dim: "#8ba0bd",
          muted: "#5b7091",
        },
        "cyan-glow": "#22e6ff",
        accent: {
          green: "#3ddc84",
          violet: "#a78bfa",
        },
        slate: {
          50: "#f8fafc",
          100: "#f1f5f9",
          200: "#e2e8f0",
          300: "#cbd5e1",
          400: "#94a3b8",
          500: "#64748b",
          600: "#475569",
          700: "#334155",
          800: "#1e293b",
          900: "#0f172a",
        },
        cyan: {
          50: "#ecfeff",
          100: "#cffafe",
          200: "#a5f3fc",
          300: "#67e8f9",
          400: "#22d3ee",
          500: "#06b6d4",
          600: "#0891b2",
          700: "#0e7490",
        },
        emerald: {
          500: "#10b981",
          600: "#059669",
        },
      },
      fontFamily: {
        sans: ["Geist", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["Geist Mono", "ui-monospace", "Menlo", "monospace"],
        // Wordmark/logotype only — Unbounded is a display face and gets wide fast.
        display: ["Unbounded", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      boxShadow: {
        /* Inset hairline + soft ambient lift, for the dark instrument panels. */
        ring: "0 0 0 1px rgba(255,255,255,0.07) inset, 0 24px 60px -18px rgba(8,15,30,0.55)",
        /* Colored ambient shadow — the cheapest premium signal there is. */
        panel: "0 40px 100px -28px rgba(13,148,136,0.30)",
      },
      animation: {
        "fade-in-up": "fadeInUp 0.8s ease-out forwards",
        "pulse-glow": "pulseGlow 4s infinite",
        "fade-in": "fadeIn 0.5s ease-in-out",
        "bounce-in": "bounceIn 0.6s ease-out", // still used by app/contact/page.tsx
        "pulse-soft": "pulseSoft 2.4s cubic-bezier(0.4,0,0.6,1) infinite",
        "fade-up": "fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) forwards",
      },
      keyframes: {
        pulseSoft: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.35" },
        },
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(6px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(30px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        pulseGlow: {
          "0%, 100%": { opacity: "0.8" },
          "50%": { opacity: "0.4" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(20px)" },
          "100%": { transform: "translateY(0)" },
        },
        bounceIn: {
          "0%": { transform: "scale(0.3)", opacity: "0" },
          "50%": { transform: "scale(1.05)", opacity: "1" },
          "70%": { transform: "scale(0.9)" },
          "100%": { transform: "scale(1)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-12px)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
