"use client";

import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

async function firmar(path: string): Promise<string | null> {
  if (path.startsWith("http")) return path;
  const { data } = await createClient()
    .storage.from("referencias")
    .createSignedUrl(path, 3600);
  return data?.signedUrl ?? null;
}

/**
 * Visor de imagen ampliada (lightbox). Resuelve la URL firmada al abrir
 * (Storage privado). Cierra con X, clic fuera o Escape; flechas ← → si hay
 * varias. Respeta prefers-reduced-motion.
 */
export function Lightbox({
  paths,
  index,
  onClose,
  onIndex,
}: {
  paths: string[];
  index: number | null;
  onClose: () => void;
  onIndex: (i: number) => void;
}) {
  const reduce = useReducedMotion();
  const [url, setUrl] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const open = index !== null && index >= 0 && index < paths.length;

  useEffect(() => setMounted(true), []);

  const prev = useCallback(() => {
    if (index === null) return;
    onIndex((index - 1 + paths.length) % paths.length);
  }, [index, paths.length, onIndex]);

  const next = useCallback(() => {
    if (index === null) return;
    onIndex((index + 1) % paths.length);
  }, [index, paths.length, onIndex]);

  // Resolver URL firmada de la imagen actual.
  useEffect(() => {
    if (!open || index === null) return;
    let activo = true;
    setUrl(null);
    firmar(paths[index]).then((u) => {
      if (activo) setUrl(u);
    });
    return () => {
      activo = false;
    };
  }, [open, index, paths]);

  // Teclado.
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowLeft" && paths.length > 1) prev();
      else if (e.key === "ArrowRight" && paths.length > 1) next();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose, prev, next, paths.length]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && index !== null && (
        <motion.div
          className="fixed inset-0 z-[120] flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm sm:p-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
        >
          <button
            onClick={onClose}
            aria-label="Cerrar"
            className="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white shadow-md backdrop-blur hover:bg-white/20"
          >
            <X className="h-5 w-5" />
          </button>

          {paths.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  prev();
                }}
                aria-label="Anterior"
                className="absolute left-3 top-1/2 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white shadow-md backdrop-blur hover:bg-white/20 sm:left-6"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  next();
                }}
                aria-label="Siguiente"
                className="absolute right-3 top-1/2 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white shadow-md backdrop-blur hover:bg-white/20 sm:right-6"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </>
          )}

          <motion.div
            onClick={(e) => e.stopPropagation()}
            initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="relative flex flex-col items-center"
          >
            <div className="overflow-hidden rounded-2xl border border-foreground/10 bg-surface p-2 shadow-2xl">
              {url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={url}
                  alt="Foto de referencia"
                  className="block max-h-[72vh] w-auto max-w-[min(680px,86vw)] rounded-lg object-contain"
                />
              ) : (
                <div className="h-64 w-64 max-w-[80vw] animate-pulse rounded-lg bg-foreground/10" />
              )}
            </div>
            {paths.length > 1 && (
              <span className="mt-3 text-xs text-white/80">
                {index + 1} / {paths.length}
              </span>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
