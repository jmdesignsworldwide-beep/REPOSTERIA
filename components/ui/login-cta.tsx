import Link from "next/link";
import { GlassCard } from "./glass-card";

export function LoginCTA({ modulo }: { modulo: string }) {
  return (
    <div className="mx-auto max-w-md py-16">
      <GlassCard className="p-8 text-center">
        <div className="text-4xl">🔒</div>
        <h1 className="mt-3 font-display text-2xl font-bold">Inicia sesión</h1>
        <p className="mt-2 text-sm text-muted">
          El módulo de {modulo} guarda datos reales protegidos. Inicia sesión
          para gestionarlos.
        </p>
        <Link
          href="/login"
          className="mt-5 inline-block rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-glow"
        >
          Ir al login
        </Link>
      </GlassCard>
    </div>
  );
}
