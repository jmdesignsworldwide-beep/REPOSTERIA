"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Stagger, StaggerItem } from "@/components/ui/stagger";

/* ════════ Los 7 postres ilustrados (SVG exactos) ════════ */

function Pastel({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 70 80" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden>
      <defs>
        <linearGradient id="cakeBody" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#e8b886" /><stop offset="100%" stopColor="#c89248" />
        </linearGradient>
        <linearGradient id="frosting" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fbe8d4" /><stop offset="100%" stopColor="#f0cba8" />
        </linearGradient>
      </defs>
      <ellipse cx="25" cy="62" rx="30" ry="6" fill="#c89248" opacity="0.25" />
      <rect x="2" y="32" width="46" height="30" rx="4" fill="url(#cakeBody)" />
      <path d="M2,36 Q14,46 25,38 Q36,46 48,36 L48,32 Q25,24 2,32 Z" fill="url(#frosting)" />
      <path d="M2,35 Q14,45 25,37 Q36,45 48,35" fill="none" stroke="#fbe8d4" strokeWidth="3" strokeLinecap="round" />
      <rect x="23" y="12" width="3" height="14" rx="1.5" fill="#d98a8a" />
      <path d="M24.5,12 Q21,6 24.5,4 Q28,6 24.5,12" fill="#f5a623" />
      <circle cx="14" cy="46" r="1.5" fill="#d98a8a" /><circle cx="34" cy="48" r="1.5" fill="#a3c585" /><circle cx="25" cy="50" r="1.5" fill="#7eb6d9" />
    </svg>
  );
}

function Cupcake({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 64" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden>
      <defs>
        <linearGradient id="cupTop" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f5d9bf" /><stop offset="100%" stopColor="#e8b886" />
        </linearGradient>
      </defs>
      <ellipse cx="24" cy="60" rx="22" ry="4" fill="#c89248" opacity="0.25" />
      <path d="M4,30 L44,30 L39,58 Q38,60 36,60 L12,60 Q10,60 9,58 Z" fill="#e0a878" />
      <path d="M9,30 L11,60 M18,30 L18,60 M27,30 L27,60 M36,30 L37,60" stroke="#c98c52" strokeWidth="2" opacity="0.5" />
      <path d="M2,30 Q2,8 24,8 Q46,8 46,30 Q40,24 36,30 Q30,22 24,30 Q18,22 12,30 Q8,24 2,30 Z" fill="url(#cupTop)" />
      <circle cx="24" cy="4" r="4" fill="#d98a8a" />
      <circle cx="16" cy="18" r="1.5" fill="#fff" opacity="0.8" /><circle cx="30" cy="16" r="1.5" fill="#d98a8a" /><circle cx="24" cy="22" r="1.5" fill="#a3c585" />
    </svg>
  );
}

function Dona({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 60 56" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden>
      <defs>
        <linearGradient id="donutG" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#d99a5c" /><stop offset="100%" stopColor="#b87333" />
        </linearGradient>
      </defs>
      <ellipse cx="30" cy="52" rx="28" ry="5" fill="#c89248" opacity="0.25" />
      <circle cx="30" cy="28" r="26" fill="url(#donutG)" />
      <path d="M8,20 Q14,8 30,6 Q48,6 52,20 Q44,30 30,28 Q16,30 8,20 Z" fill="#f0cba8" />
      <circle cx="30" cy="28" r="9" fill="#f7ede0" />
      <path d="M18,16 l3,4 M40,14 l-2,4 M44,24 l-4,1 M22,26 l3,2 M34,12 l1,4" stroke="#d98a8a" strokeWidth="2" strokeLinecap="round" />
      <path d="M26,18 l2,3 M38,22 l-3,2" stroke="#7eb6d9" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function Pan({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 80 95" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden>
      <defs>
        <linearGradient id="breadG" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#e0a878" /><stop offset="100%" stopColor="#b87333" /></linearGradient>
        <linearGradient id="breadTop" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#f0cba8" /><stop offset="100%" stopColor="#d99a5c" /></linearGradient>
      </defs>
      <ellipse cx="40" cy="68" rx="42" ry="7" fill="#c89248" opacity="0.22" />
      <path d="M6,66 Q0,30 40,30 Q80,30 74,66 Z" fill="url(#breadG)" />
      <path d="M6,40 Q40,18 74,40 Q70,30 40,28 Q12,30 6,40 Z" fill="url(#breadTop)" />
      <path d="M18,38 Q24,30 30,38 M38,36 Q44,28 50,36 M58,38 Q64,30 70,38" stroke="#a86a32" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.6" />
    </svg>
  );
}

function Rebanada({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 70 80" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden>
      <defs>
        <linearGradient id="sliceBody" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#f5d9bf" /><stop offset="100%" stopColor="#e8b886" /></linearGradient>
      </defs>
      <ellipse cx="35" cy="72" rx="34" ry="6" fill="#c89248" opacity="0.22" />
      <path d="M10,30 L60,30 L54,68 Q53,70 51,70 L19,70 Q17,70 16,68 Z" fill="url(#sliceBody)" />
      <path d="M16,42 L54,42 M18,54 L52,54" stroke="#d9a96e" strokeWidth="3" opacity="0.5" />
      <path d="M10,30 Q10,18 35,18 Q60,18 60,30 Q52,24 46,30 Q40,22 35,30 Q30,22 24,30 Q18,24 10,30 Z" fill="#fbe8d4" />
      <circle cx="35" cy="15" r="4" fill="#d98a8a" />
      <circle cx="24" cy="26" r="1.4" fill="#d98a8a" /><circle cx="46" cy="25" r="1.4" fill="#a3c585" />
    </svg>
  );
}

function Croissant({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 84 64" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden>
      <defs>
        <linearGradient id="croissG" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#e8b886" /><stop offset="100%" stopColor="#c2823f" /></linearGradient>
      </defs>
      <ellipse cx="42" cy="58" rx="40" ry="6" fill="#c89248" opacity="0.22" />
      <path d="M8,40 Q4,22 20,22 Q30,22 34,34 Q42,20 50,34 Q54,22 64,22 Q80,22 76,40 Q70,52 50,48 Q42,54 34,48 Q14,52 8,40 Z" fill="url(#croissG)" />
      <path d="M22,30 Q26,40 24,46 M36,28 Q38,40 36,48 M50,28 Q52,40 50,48 M62,30 Q60,40 62,46" stroke="#a86a32" strokeWidth="1.6" fill="none" opacity="0.55" strokeLinecap="round" />
    </svg>
  );
}

function Galleta({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 68 64" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden>
      <defs>
        <linearGradient id="cookieG" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#d99a5c" /><stop offset="100%" stopColor="#b87333" /></linearGradient>
      </defs>
      <ellipse cx="34" cy="58" rx="30" ry="6" fill="#c89248" opacity="0.22" />
      <circle cx="34" cy="32" r="26" fill="url(#cookieG)" />
      <circle cx="34" cy="32" r="26" fill="none" stroke="#a86a32" strokeWidth="1.5" opacity="0.4" />
      <circle cx="26" cy="24" r="3.5" fill="#5c3a23" /><circle cx="42" cy="22" r="3" fill="#4a2e18" />
      <circle cx="44" cy="38" r="3.5" fill="#5c3a23" /><circle cx="24" cy="40" r="3" fill="#4a2e18" />
      <circle cx="34" cy="34" r="2.5" fill="#5c3a23" /><circle cx="36" cy="46" r="2.5" fill="#4a2e18" />
    </svg>
  );
}

/* ════════ Flotación lenta (respeta reduce-motion) ════════ */
function Float({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      animate={reduce ? undefined : { y: [0, -4, 0] }}
      transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay }}
    >
      {children}
    </motion.div>
  );
}

/* ════════ Distribución alrededor de la tarjeta ════════
   Esquinas (1-4): siempre visibles, incluso en móvil 390px.
   Laterales / centro (5-7): solo desde sm/lg para no saturar en móvil.
   Opacidad baja (más baja aún en tema oscuro). El centro queda despejado. */
const POSTRES = [
  { C: Pastel, pos: "left-[5%] top-[7%] w-[80px]", op: "opacity-[0.6] dark:opacity-[0.4]", delay: 0 },
  { C: Galleta, pos: "right-[6%] top-[9%] w-[64px]", op: "opacity-[0.55] dark:opacity-[0.38]", delay: 0.4 },
  { C: Croissant, pos: "left-[6%] bottom-[9%] w-[86px]", op: "opacity-[0.55] dark:opacity-[0.36]", delay: 0.8 },
  { C: Cupcake, pos: "right-[6%] bottom-[8%] w-[60px]", op: "opacity-[0.6] dark:opacity-[0.4]", delay: 0.6 },
  { C: Dona, pos: "left-[3%] top-[46%] w-[64px] hidden sm:block", op: "opacity-[0.5] dark:opacity-[0.34]", delay: 1.0 },
  { C: Rebanada, pos: "right-[3%] top-[44%] w-[64px] hidden sm:block", op: "opacity-[0.5] dark:opacity-[0.34]", delay: 1.2 },
  { C: Pan, pos: "left-[42%] top-[4%] w-[78px] hidden lg:block", op: "opacity-[0.45] dark:opacity-[0.3]", delay: 0.2 },
];

export function PostresDecor() {
  return (
    <Stagger className="pointer-events-none absolute inset-0 select-none" delay={0.1}>
      {POSTRES.map(({ C, pos, op, delay }, i) => (
        <StaggerItem key={i} className={`absolute ${pos}`}>
          <Float delay={delay} className={op}>
            <C className="h-auto w-full" />
          </Float>
        </StaggerItem>
      ))}
    </Stagger>
  );
}
