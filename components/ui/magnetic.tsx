"use client";

import { useRef } from "react";
import { motion, useMotionValue, useSpring, useReducedMotion } from "framer-motion";

/**
 * Primitivo #2 — Magnetic hover.
 * El elemento se "imanta" al cursor (lo sigue sutilmente), se eleva (scale 1.02)
 * y proyecta un glow del color de acento. Todo con spring.
 */
export function Magnetic({
  children,
  className,
  strength = 0.15,
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
  const sx = useSpring(x, { stiffness: 150, damping: 22, mass: 0.6 });
  const sy = useSpring(y, { stiffness: 150, damping: 22, mass: 0.6 });

  function handleMove(e: React.MouseEvent) {
    if (reduce || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    x.set((e.clientX - (r.left + r.width / 2)) * strength);
    y.set((e.clientY - (r.top + r.height / 2)) * strength);
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
      whileTap={reduce ? {} : { scale: 0.995 }}
      transition={{ type: "spring", stiffness: 180, damping: 26 }}
      className={`${glow ? "transition-shadow duration-300 hover:shadow-glow" : ""} ${
        className ?? ""
      }`}
    >
      {children}
    </motion.div>
  );
}
