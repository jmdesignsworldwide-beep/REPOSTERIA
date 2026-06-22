"use client";

import { useTheme } from "./theme-provider";

export function ThemeToggle() {
  const { theme, toggle, mounted } = useTheme();

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Cambiar tema"
      className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-1.5 text-sm font-medium transition-colors hover:bg-background"
    >
      {/* Hasta montar, texto neutro para evitar desajustes de hidratación */}
      {!mounted ? "Tema" : theme === "dark" ? "🌙 Oscuro" : "☀️ Claro"}
    </button>
  );
}
