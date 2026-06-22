/**
 * Nota de demostración elegante. Para avisos fiscales/financieros simulados
 * sin romper el diseño premium.
 */
export function Disclaimer({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2 rounded-xl border border-amber-500/25 bg-amber-500/[0.07] px-3 py-2 text-xs text-amber-700 dark:text-amber-300/90">
      <span aria-hidden>ⓘ</span>
      <span>{children}</span>
    </div>
  );
}
