"use client";

import { useEffect } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

/**
 * Primitivo — Modal / panel premium.
 * Hoja inferior en móvil, tarjeta centrada en escritorio. Glass + spring.
 * Cierra con Escape, clic en el fondo o el botón ✕. Bloquea el scroll.
 */
export function Modal({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  const reduce = useReducedMotion();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <button
            aria-label="Cerrar"
            onClick={onClose}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            className="relative z-10 max-h-[88vh] w-full overflow-y-auto rounded-t-3xl border border-foreground/10 bg-glass/80 shadow-card backdrop-blur-2xl sm:max-w-lg sm:rounded-3xl"
            initial={
              reduce ? { opacity: 0 } : { opacity: 0, y: 40, scale: 0.98 }
            }
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: 40, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 320, damping: 30 }}
          >
            <div className="sticky top-0 flex items-start justify-between gap-4 border-b border-foreground/10 bg-glass/40 p-5 backdrop-blur-xl">
              <div>
                <h2 className="font-display text-xl font-semibold leading-tight">
                  {title}
                </h2>
                {subtitle && (
                  <p className="mt-0.5 text-sm text-muted">{subtitle}</p>
                )}
              </div>
              <button
                onClick={onClose}
                aria-label="Cerrar"
                className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-foreground/10 bg-glass/60 text-sm hover:border-primary/40"
              >
                ✕
              </button>
            </div>

            <div className="p-5">{children}</div>

            {footer && (
              <div className="sticky bottom-0 border-t border-foreground/10 bg-glass/40 p-4 backdrop-blur-xl">
                {footer}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
