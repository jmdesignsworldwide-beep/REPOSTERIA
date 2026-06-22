"use client";

import { motion } from "framer-motion";

/**
 * Primitivo #8 (a nivel de ruta) — Transición entre vistas.
 * Cada navegación dentro del panel entra con un fundido + slide suave.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}
