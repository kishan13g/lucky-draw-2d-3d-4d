import animate from "tailwindcss-animate";

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["index.html", "src/**/*.{js,ts,jsx,tsx,html,css}"],
  theme: {
    extend: {
      colors: {
        "ld-bg": "#07070f",
        "ld-panel": "#0f0f22",
        "ld-card": "#161630",
        "ld-border": "#252550",
        "ld-gold": "#ffd700",
        "ld-red": "#ff3355",
        "ld-green": "#00e87a",
        "ld-cyan": "#00d4ff",
        "ld-orange": "#ff8c00",
        "ld-text": "#d5d5ff",
        "ld-muted": "#8888aa",
      },
      fontFamily: {
        orbitron: ["Orbitron", "monospace"],
        rajdhani: ["Rajdhani", "sans-serif"],
        mono: ["Share Tech Mono", "monospace"],
      },
      keyframes: {
        pulse: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
        pop: {
          from: { transform: "scale(0.6)", opacity: "0" },
          to: { transform: "scale(1)", opacity: "1" },
        },
        slideUp: {
          from: { transform: "translateY(80px)", opacity: "0" },
          to: { transform: "translateY(0)", opacity: "1" },
        },
        glow: {
          "0%, 100%": { boxShadow: "0 0 10px rgba(0,212,255,0.3)" },
          "50%": { boxShadow: "0 0 25px rgba(0,212,255,0.8)" },
        },
      },
      animation: {
        "pulse-slow": "pulse 1s infinite",
        pop: "pop 0.3s ease",
        "slide-up": "slideUp 0.3s ease",
        glow: "glow 2s ease-in-out infinite",
      },
    },
  },
  plugins: [animate],
};
