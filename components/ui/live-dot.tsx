/**
 * Primitivo #9 — Indicador "en vivo" que late.
 * Un punto que pulsa, señalando datos en tiempo real.
 */
export function LiveDot({
  label,
  className,
}: {
  label?: string;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-2 text-xs font-medium ${
        className ?? ""
      }`}
    >
      <span className="relative flex h-2.5 w-2.5">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-70" />
        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-primary" />
      </span>
      {label}
    </span>
  );
}
