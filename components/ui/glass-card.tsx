/**
 * Primitivo #5 — Glassmorphism sutil.
 * Fondo semi-transparente + backdrop-blur + borde claro + sombras en capas.
 */
export function GlassCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-foreground/[0.08] bg-glass/85 shadow-card backdrop-blur-xl ${
        className ?? ""
      }`}
    >
      {children}
    </div>
  );
}
