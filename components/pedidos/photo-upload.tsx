"use client";

import { useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { SignedImg } from "@/components/ui/signed-img";

/**
 * Subida REAL de fotos a Supabase Storage (bucket PRIVADO "referencias").
 * Guarda la RUTA del archivo (no una URL pública); las fotos se muestran con
 * URL firmada temporal. Los botones sobre las fotos llevan fondo sólido.
 */
export function PhotoUpload({
  value,
  onChange,
}: {
  value: string[];
  onChange: (paths: string[]) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [subiendo, setSubiendo] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setError(null);
    setSubiendo(true);
    const supabase = createClient();
    const nuevas: string[] = [];
    try {
      for (const file of Array.from(files)) {
        if (!file.type.startsWith("image/")) continue;
        const ext = file.name.split(".").pop() || "jpg";
        const path = `${crypto.randomUUID()}.${ext}`;
        const { error: upErr } = await supabase.storage
          .from("referencias")
          .upload(path, file, { cacheControl: "3600", upsert: false });
        if (upErr) {
          setError(upErr.message);
          continue;
        }
        nuevas.push(path); // guardamos la ruta, no una URL pública
      }
      if (nuevas.length) onChange([...value, ...nuevas]);
    } finally {
      setSubiendo(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function remove(path: string) {
    onChange(value.filter((u) => u !== path));
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {value.map((path) => (
          <div
            key={path}
            className="relative h-20 w-20 overflow-hidden rounded-xl border border-foreground/10"
          >
            <SignedImg src={path} alt="Referencia" className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => remove(path)}
              aria-label="Quitar foto"
              className="absolute right-1 top-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-black/70 text-xs text-white shadow-md"
            >
              ✕
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={subiendo}
          className="flex h-20 w-20 flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-foreground/20 bg-background/40 text-xs text-muted transition-colors hover:border-primary/40 disabled:opacity-60"
        >
          {subiendo ? "Subiendo…" : <>📷<span>Agregar</span></>}
        </button>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={(e) => handleFiles(e.target.files)}
        className="hidden"
      />

      {error && (
        <p className="text-xs text-red-600 dark:text-red-400">⚠️ {error}</p>
      )}
    </div>
  );
}
