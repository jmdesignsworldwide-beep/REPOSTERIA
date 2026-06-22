"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

/**
 * Bienvenida cinematográfica tras el login.
 * - Se muestra UNA vez por sesión (sessionStorage).
 * - A prueba de fallos: timeouts garantizan el paso al Dashboard pase lo que pase.
 * - El Dashboard ya está montado detrás (este overlay solo lo cubre unos segundos).
 */
export function WelcomeOverlay() {
  const reduce = useReducedMotion();
  const [show, setShow] = useState(false);
  const [nombre, setNombre] = useState("");

  // Detecta el flag puesto por el login (solo en cliente).
  useEffect(() => {
    try {
      const n = sessionStorage.getItem("ac_welcome_name");
      const visto = sessionStorage.getItem("ac_welcome_seen");
      if (n && !visto) {
        setNombre(n);
        setShow(true);
      }
    } catch {
      // si sessionStorage falla, simplemente no se muestra
    }
  }, []);

  function finish() {
    setShow(false);
    try {
      sessionStorage.setItem("ac_welcome_seen", "1");
      sessionStorage.removeItem("ac_welcome_name");
    } catch {}
  }

  // Failsafe: cierra sí o sí (aunque algo falle en la animación).
  useEffect(() => {
    if (!show) return;
    const principal = setTimeout(finish, reduce ? 800 : 2700);
    const failsafe = setTimeout(finish, 5000);
    return () => {
      clearTimeout(principal);
      clearTimeout(failsafe);
    };
  }, [show, reduce]);

  const blurIn = reduce
    ? { initial: { opacity: 0 }, animate: { opacity: 1 } }
    : {
        initial: { opacity: 0, filter: "blur(14px)", y: 10 },
        animate: { opacity: 1, filter: "blur(0px)", y: 0 },
      };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="welcome"
          onClick={finish}
          className="fixed inset-0 z-[100] flex cursor-pointer flex-col items-center justify-center overflow-hidden bg-background px-6 text-center"
          initial={{ opacity: 1 }}
          exit={
            reduce
              ? { opacity: 0 }
              : { opacity: 0, scale: 1.05, filter: "blur(10px)" }
          }
          transition={{ duration: reduce ? 0.3 : 0.7, ease: "easeInOut" }}
        >
          {/* Aurora de fondo (acento caramelo respirando) */}
          {!reduce && (
            <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
              <motion.div
                className="absolute left-1/2 top-1/2 h-[60vmin] w-[60vmin] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[100px]"
                style={{ background: "rgb(var(--aurora-1) / 0.5)" }}
                animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.8, 0.5] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              />
              <motion.div
                className="absolute left-1/3 top-1/3 h-[40vmin] w-[40vmin] rounded-full blur-[90px]"
                style={{ background: "rgb(var(--aurora-2) / 0.4)" }}
                animate={{ x: [0, 30, 0], y: [0, -20, 0], opacity: [0.4, 0.7, 0.4] }}
                transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
              />
            </div>
          )}

          <div className="relative flex flex-col items-center">
            {/* Logo con anillos / glow */}
            <motion.div
              className="relative mb-6 flex h-28 w-28 items-center justify-center"
              initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 18, delay: 0.1 }}
            >
              {!reduce && (
                <>
                  <motion.span
                    className="absolute inset-0 rounded-full border border-primary/30"
                    animate={{ scale: [1, 1.4, 1.8], opacity: [0.5, 0.2, 0] }}
                    transition={{ duration: 2.6, repeat: Infinity, ease: "easeOut" }}
                  />
                  <motion.span
                    className="absolute inset-0 rounded-full border border-primary/40"
                    animate={{ scale: [1, 1.3, 1.6], opacity: [0.6, 0.25, 0] }}
                    transition={{ duration: 2.6, repeat: Infinity, ease: "easeOut", delay: 0.6 }}
                  />
                </>
              )}
              <span className="relative flex h-24 w-24 items-center justify-center rounded-full border border-foreground/10 bg-glass/70 text-5xl shadow-glow backdrop-blur-xl">
                🍮
              </span>
            </motion.div>

            {/* Nombre del negocio (debajo del logo) */}
            <motion.p
              className="mb-10 font-display text-lg font-semibold tracking-wide"
              initial={reduce ? { opacity: 0 } : { opacity: 0, filter: "blur(10px)" }}
              animate={{ opacity: 1, filter: "blur(0px)" }}
              transition={{ delay: reduce ? 0.1 : 0.35, duration: 0.8 }}
            >
              Azúcar <span className="text-primary">&amp;</span> Canela
            </motion.p>

            {/* Mensaje cálido */}
            <motion.p
              className="text-sm text-muted sm:text-base"
              {...blurIn}
              transition={{ delay: reduce ? 0.1 : 0.6, duration: reduce ? 0.3 : 0.9, ease: "easeOut" }}
            >
              Bienvenido de nuevo,
            </motion.p>

            {/* Nombre del usuario en degradado de marca */}
            <motion.h1
              className="mt-2 bg-gradient-to-r from-primary to-accent bg-clip-text font-display text-4xl font-bold text-transparent sm:text-6xl"
              {...blurIn}
              transition={{ delay: reduce ? 0.1 : 0.85, duration: reduce ? 0.3 : 1, ease: "easeOut" }}
            >
              {nombre}
            </motion.h1>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
