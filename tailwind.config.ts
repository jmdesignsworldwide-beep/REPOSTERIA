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
        glow: "0 0 0 1px rgb(var(--primary) / 0.14), 0 6px 24px -10px rgb(var(--primary) / 0.28)",
        card: "0 1px 2px rgb(0 0 0 / 0.04), 0 10px 28px -14px rgb(0 0 0 / 0.18)",
      },
    },
  },
  plugins: [],
};

export default config;
