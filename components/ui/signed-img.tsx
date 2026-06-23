"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

/**
 * Muestra una imagen del bucket privado "referencias" generando una URL
 * firmada temporal. Acepta tanto una RUTA de Storage como una URL http
 * (compatibilidad). Solo funciona con sesión (RLS de Storage).
 */
export function SignedImg({
  src,
  alt = "",
  className,
}: {
  src: string;
  alt?: string;
  className?: string;
}) {
  const [url, setUrl] = useState<string | null>(
    src.startsWith("http") ? src : null,
  );

  useEffect(() => {
    if (src.startsWith("http")) {
      setUrl(src);
      return;
    }
    let activo = true;
    createClient()
      .storage.from("referencias")
      .createSignedUrl(src, 3600)
      .then(({ data }) => {
        if (activo && data?.signedUrl) setUrl(data.signedUrl);
      });
    return () => {
      activo = false;
    };
  }, [src]);

  if (!url) return <div className={`bg-foreground/5 ${className ?? ""}`} />;
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={url} alt={alt} className={className} />;
}
