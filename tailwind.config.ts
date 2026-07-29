import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        void: "#0A0E1A",
        panel: "#111729",
        "panel-2": "#161D33",
        line: "#232B45",
        cyan: {
          DEFAULT: "#22D3EE",
          soft: "#67E8F9",
        },
        violet: {
          DEFAULT: "#A78BFA",
          soft: "#C4B5FD",
        },
        amber: "#FBBF24",
        mint: "#34D399",
        rose: "#FB7185",
        ink: {
          DEFAULT: "#E7EBF7",
          dim: "#8891AC",
          faint: "#565F80",
        },
      },
      fontFamily: {
        display: ["var(--font-display)"],
        body: ["var(--font-body)"],
        mono: ["var(--font-mono)"],
      },
      backgroundImage: {
        "nova-gradient": "linear-gradient(135deg, #22D3EE 0%, #A78BFA 100%)",
        "nova-radial": "radial-gradient(circle at 50% 0%, rgba(34,211,238,0.15), transparent 60%)",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px) rotate(0deg)" },
          "50%": { transform: "translateY(-18px) rotate(4deg)" },
        },
        "float-slow": {
          "0%, 100%": { transform: "translateY(0px) translateX(0px)" },
          "50%": { transform: "translateY(-24px) translateX(10px)" },
        },
        blob: {
          "0%, 100%": { transform: "scale(1) translate(0,0)" },
          "33%": { transform: "scale(1.1) translate(20px,-10px)" },
          "66%": { transform: "scale(0.95) translate(-15px,15px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "morph-cycle": {
          "0%, 22%": { opacity: "1" },
          "28%, 100%": { opacity: "0" },
        },
        ring: {
          "0%": { strokeDashoffset: "283" },
          "100%": { strokeDashoffset: "0" },
        },
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        "float-slow": "float-slow 10s ease-in-out infinite",
        blob: "blob 12s ease-in-out infinite",
        shimmer: "shimmer 2.5s linear infinite",
        ring: "ring 1.2s ease-out forwards",
      },
    },
  },
  plugins: [],
};
export default config;
