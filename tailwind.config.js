/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        cyber: {
          bg: "#070B14",
          surface: "#0D1424",
          card: "#0F172A",
          deeper: "#060A12",
        },
        neon: {
          blue: "#2563EB",
          "blue-light": "#3B82F6",
          cyan: "#06B6D4",
          "cyan-light": "#22D3EE",
          orange: "#F97316",
          purple: "#8B5CF6",
          green: "#10B981",
          red: "#EF4444",
        },
        // Keep brand colors for backward-compat with visualizers (mapped to cyan)
        brand: {
          50: "#ecfeff",
          100: "#cffafe",
          200: "#a5f3fc",
          300: "#67e8f9",
          400: "#22d3ee",
          500: "#06b6d4",
          600: "#0891b2",
          700: "#0e7490",
          800: "#155e75",
          900: "#164e63",
          950: "#083344",
        },
        accent: {
          50: "#fff7ed",
          100: "#ffedd5",
          200: "#fed7aa",
          300: "#fdba74",
          400: "#fb923c",
          500: "#f97316",
          600: "#ea580c",
        },
        surface: {
          light: "#ffffff",
          dark: "#070B14",
          depth: "#0D1424",
          card: "#0F172A",
        },
        background: "var(--background)",
        foreground: "var(--foreground)",
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
        popover: {
          DEFAULT: "var(--popover)",
          foreground: "var(--popover-foreground)",
        },
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        destructive: {
          DEFAULT: "var(--destructive)",
          foreground: "var(--destructive-foreground)",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "Consolas", "monospace"],
        display: ["Orbitron", "sans-serif"],
      },
      borderRadius: {
        button: "0.5rem",
        card: "0.75rem",
      },
      spacing: {
        navbar: "4rem",
      },
      animation: {
        "grid-move": "grid-move 25s linear infinite",
        "pulse-cyan": "pulse-cyan 3s ease-in-out infinite",
        "pulse-blue": "pulse-blue 3s ease-in-out infinite",
        "glow-border": "glow-border 3s ease-in-out infinite",
        "fade-in-up": "fade-in-up 0.6s ease-out forwards",
        "fade-in": "fade-in 0.4s ease-out forwards",
        "float": "float 6s ease-in-out infinite",
        "float-delayed": "float 6s ease-in-out 2s infinite",
        "float-slow": "float 8s ease-in-out 4s infinite",
        "flicker": "flicker 5s linear infinite",
        "scan-line": "scan-line 4s linear infinite",
        "spin-slow": "spin 8s linear infinite",
      },
      keyframes: {
        "grid-move": {
          "0%": { backgroundPosition: "0 0" },
          "100%": { backgroundPosition: "60px 60px" },
        },
        "pulse-cyan": {
          "0%, 100%": { boxShadow: "0 0 8px rgba(6,182,212,0.2), 0 0 16px rgba(6,182,212,0.05)" },
          "50%": { boxShadow: "0 0 20px rgba(6,182,212,0.5), 0 0 40px rgba(6,182,212,0.2)" },
        },
        "pulse-blue": {
          "0%, 100%": { boxShadow: "0 0 8px rgba(37,99,235,0.2)" },
          "50%": { boxShadow: "0 0 20px rgba(37,99,235,0.5), 0 0 40px rgba(37,99,235,0.15)" },
        },
        "glow-border": {
          "0%, 100%": { borderColor: "rgba(6,182,212,0.2)" },
          "50%": { borderColor: "rgba(6,182,212,0.6)" },
        },
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-14px)" },
        },
        "flicker": {
          "0%, 96%, 100%": { opacity: "1" },
          "97%": { opacity: "0.7" },
          "98%": { opacity: "1" },
          "99%": { opacity: "0.85" },
        },
        "scan-line": {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(200vh)" },
        },
      },
      boxShadow: {
        "neon-blue": "0 0 20px rgba(37,99,235,0.5), 0 0 40px rgba(37,99,235,0.2)",
        "neon-cyan": "0 0 20px rgba(6,182,212,0.5), 0 0 40px rgba(6,182,212,0.2)",
        "neon-orange": "0 0 20px rgba(249,115,22,0.5), 0 0 40px rgba(249,115,22,0.2)",
        "neon-purple": "0 0 20px rgba(139,92,246,0.5), 0 0 40px rgba(139,92,246,0.2)",
        "glass": "0 8px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.04)",
        "glass-lg": "0 20px 60px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.04)",
        "nav": "0 4px 30px rgba(0,0,0,0.4), 0 0 0 1px rgba(6,182,212,0.1)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
