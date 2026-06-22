"use client";

import { motion, useReducedMotion } from "framer-motion";

type Blob = {
  color: string;
  size: number;
  top: string;
  left: string;
  dur: number;
  x: number[];
  y: number[];
};

const BLOBS: Blob[] = [
  {
    color: "rgb(var(--aurora-1) / 0.45)",
    size: 520,
    top: "-8%",
    left: "-6%",
    dur: 22,
    x: [0, 60, -20, 0],
    y: [0, 40, 80, 0],
  },
  {
    color: "rgb(var(--aurora-2) / 0.40)",
    size: 460,
    top: "30%",
    left: "60%",
    dur: 28,
    x: [0, -50, 30, 0],
    y: [0, 60, -30, 0],
  },
  {
    color: "rgb(var(--aurora-3) / 0.35)",
    size: 400,
    top: "60%",
    left: "10%",
    dur: 25,
    x: [0, 40, -40, 0],
    y: [0, -40, 30, 0],
  },
];

/**
 * Primitivo #4 — Aurora background que respira.
 * Manchas de color de marca, muy difuminadas, que se mueven lento y cambian
 * de opacidad en bucle. Va fija detrás de todo el contenido.
 */
export function Aurora() {
  const reduce = useReducedMotion();

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      {BLOBS.map((b, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full blur-[100px]"
          style={{
            width: b.size,
            height: b.size,
            top: b.top,
            left: b.left,
            background: b.color,
          }}
          animate={
            reduce
              ? undefined
              : { x: b.x, y: b.y, opacity: [0.6, 1, 0.7, 0.6] }
          }
          transition={{
            duration: b.dur,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}
