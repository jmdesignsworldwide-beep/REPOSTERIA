"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useTheme } from "./theme-provider";

export function ThemeToggle() {
  const { theme, toggle, mounted } = useTheme();

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Cambiar tema"
      className="relative inline-flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-foreground/10 bg-glass/60 text-base backdrop-blur transition-colors hover:border-primary/40"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={mounted ? theme : "placeholder"}
          initial={{ y: 14, opacity: 0, rotate: -40 }}
          animate={{ y: 0, opacity: 1, rotate: 0 }}
          exit={{ y: -14, opacity: 0, rotate: 40 }}
          transition={{ duration: 0.2 }}
        >
          {!mounted ? "•" : theme === "dark" ? "🌙" : "☀️"}
        </motion.span>
      </AnimatePresence>
    </button>
  );
}
