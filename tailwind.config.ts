import type { Config } from "tailwindcss";

const rgb = (v: string) => `rgb(var(${v}) / <alpha-value>)`;

const config: Config = {
  darkMode: ["selector", '[data-theme="dark"]'],
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: rgb("--background"),
        surface: rgb("--surface"),
        foreground: rgb("--foreground"),
        muted: rgb("--muted"),
        border: rgb("--border"),
        glass: rgb("--glass"),
        accent: rgb("--accent"),
        primary: {
          DEFAULT: rgb("--primary"),
          foreground: rgb("--primary-foreground"),
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "ui-serif", "Georgia", "serif"],
      },
      boxShadow: {
        glow: "0 0 0 1px rgb(var(--primary) / 0.25), 0 8px 40px -8px rgb(var(--primary) / 0.45)",
        card: "0 10px 30px -12px rgb(0 0 0 / 0.25)",
      },
    },
  },
  plugins: [],
};

export default config;
