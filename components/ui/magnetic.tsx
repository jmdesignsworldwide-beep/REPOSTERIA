"use client";

import { useRef } from "react";
import { motion, useMotionValue, useSpring, useReducedMotion } from "framer-motion";

/**
 * Primitivo #2 — Magnetic hover (sutil).
 * El elemento sigue al cursor MUY levemente (desplazamiento limitado) y se
 * eleva apenas (scale 1.01), con springs muy amortiguados: nada de rebotes
 * ni saltos. Premium = calmado.
 */
export function Magnetic({
  children,
  className,
  strength = 0.1,
  glow = true,
}: {
  children: React.ReactNode;
  className?: string;
  strength?: number;
  glow?: boolean;
}) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 140, damping: 30, mass: 0.5 });
  const sy = useSpring(y, { stiffness: 140, damping: 30, mass: 0.5 });

  // Desplazamiento máximo (px) para que ningún botón "vuele".
  const MAX = 5;
  const clamp = (v: number) => Math.max(-MAX, Math.min(MAX, v));

  function handleMove(e: React.MouseEvent) {
    if (reduce || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    x.set(clamp((e.clientX - (r.left + r.width / 2)) * strength));
    y.set(clamp((e.clientY - (r.top + r.height / 2)) * strength));
  }

  function handleLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      style={{ x: reduce ? 0 : sx, y: reduce ? 0 : sy }}
      whileHover={reduce ? {} : { scale: 1.01 }}
      whileTap={reduce ? {} : { scale: 0.99 }}
      transition={{ type: "spring", stiffness: 200, damping: 30 }}
      className={`${glow ? "transition-shadow duration-300 hover:shadow-glow" : ""} ${
        className ?? ""
      }`}
    >
      {children}
    </motion.div>
  );
}
