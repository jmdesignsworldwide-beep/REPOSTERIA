/**
 * Primitivo #7 — Skeleton elegante con shimmer.
 * Placeholder de carga con brillo suave (no spinner genérico).
 */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={`shimmer relative overflow-hidden rounded-lg bg-foreground/10 ${
        className ?? ""
      }`}
    />
  );
}
