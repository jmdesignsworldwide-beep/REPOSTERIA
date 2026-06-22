"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

type View = { id: string; label: string; content: React.ReactNode };

/**
 * Primitivo #8 — Transiciones entre vistas.
 * Al cambiar de pestaña/módulo, la vista actual sale y la nueva entra con
 * AnimatePresence (sin cortes secos).
 */
export function ViewSwitcher({ views }: { views: View[] }) {
  const reduce = useReducedMotion();
  const [active, setActive] = useState(views[0]?.id);
  const current = views.find((v) => v.id === active) ?? views[0];

  return (
    <div>
      <div className="mb-4 inline-flex rounded-xl border border-foreground/10 bg-glass/50 p-1 backdrop-blur">
        {views.map((v) => (
          <button
            key={v.id}
            type="button"
            onClick={() => setActive(v.id)}
            className={`relative rounded-lg px-4 py-1.5 text-sm font-medium transition-colors ${
              active === v.id ? "text-primary-foreground" : "text-muted hover:text-foreground"
            }`}
          >
            {active === v.id && (
              <motion.span
                layoutId="view-switcher-pill"
                className="absolute inset-0 -z-10 rounded-lg bg-primary"
                transition={{ type: "spring", stiffness: 350, damping: 30 }}
              />
            )}
            {v.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={current?.id}
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, y: -10 }}
          transition={{ duration: reduce ? 0 : 0.25, ease: "easeOut" }}
        >
          {current?.content}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
