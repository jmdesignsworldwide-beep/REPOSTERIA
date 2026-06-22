"use client";

import { fmtRD, getPedidosPorCliente } from "@/lib/data/mock";
import type { Cliente } from "@/lib/clientes/types";

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full bg-primary/12 px-2.5 py-1 text-xs font-medium text-primary">
      {children}
    </span>
  );
}

function diasHasta(fecha: string): number | null {
  const hoy = new Date();
  const f = new Date(fecha);
  if (isNaN(f.getTime())) return null;
  // Próxima ocurrencia este año (o el próximo si ya pasó).
  const prox = new Date(hoy.getFullYear(), f.getMonth(), f.getDate());
  if (prox < new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate())) {
    prox.setFullYear(hoy.getFullYear() + 1);
  }
  return Math.round((prox.getTime() - hoy.setHours(0, 0, 0, 0)) / 86400000);
}

export function ClienteFicha({ cliente }: { cliente: Cliente }) {
  const pedidos = getPedidosPorCliente(cliente.nombre);
  const total = pedidos.reduce((s, p) => s + p.monto, 0);
  const abonado = pedidos.reduce((s, p) => s + p.abono, 0);
  const balance = total - abonado;

  return (
    <div className="space-y-5">
      {/* Datos */}
      <div className="space-y-2 text-sm">
        <Campo label="Teléfono" valor={cliente.telefono} />
        {cliente.cedula && <Campo label="Cédula" valor={cliente.cedula} />}
        {cliente.correo && <Campo label="Correo" valor={cliente.correo} />}
        {cliente.direccion && (
          <Campo label="Dirección" valor={cliente.direccion} />
        )}
      </div>

      {/* Preferencias / alergias */}
      {(cliente.preferencias.length > 0 || cliente.alergias.length > 0) && (
        <div className="space-y-3">
          {cliente.preferencias.length > 0 && (
            <div>
              <p className="mb-1.5 text-xs font-medium text-muted">
                Preferencias
              </p>
              <div className="flex flex-wrap gap-1.5">
                {cliente.preferencias.map((p) => (
                  <Chip key={p}>{p}</Chip>
                ))}
              </div>
            </div>
          )}
          {cliente.alergias.length > 0 && (
            <div>
              <p className="mb-1.5 text-xs font-medium text-muted">
                Alergias ⚠️
              </p>
              <div className="flex flex-wrap gap-1.5">
                {cliente.alergias.map((a) => (
                  <span
                    key={a}
                    className="rounded-full bg-red-500/12 px-2.5 py-1 text-xs font-medium text-red-600 dark:text-red-400"
                  >
                    {a}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Fechas importantes con alerta */}
      {cliente.fechas_importantes.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-medium text-muted">
            Fechas importantes
          </p>
          <div className="space-y-1.5">
            {cliente.fechas_importantes.map((f, i) => {
              const dias = diasHasta(f.fecha);
              const pronto = dias !== null && dias <= 30;
              return (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-lg border border-foreground/5 bg-foreground/[0.03] px-3 py-2 text-sm"
                >
                  <span>
                    {f.tipo} · {f.fecha}
                  </span>
                  {pronto && (
                    <span className="rounded-full bg-primary/15 px-2 py-0.5 text-xs font-medium text-primary">
                      {dias === 0 ? "¡Hoy!" : `en ${dias} días`}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Balance */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="rounded-xl border border-foreground/10 bg-foreground/[0.03] p-3">
          <p className="text-xs text-muted">Pedidos</p>
          <p className="tabular-nums font-semibold">{pedidos.length}</p>
        </div>
        <div className="rounded-xl border border-foreground/10 bg-foreground/[0.03] p-3">
          <p className="text-xs text-muted">Adelantos</p>
          <p className="tabular-nums font-semibold text-emerald-600 dark:text-emerald-400">
            {fmtRD(abonado)}
          </p>
        </div>
        <div className="rounded-xl border border-foreground/10 bg-foreground/[0.03] p-3">
          <p className="text-xs text-muted">Balance</p>
          <p className="tabular-nums font-semibold text-primary">
            {fmtRD(balance)}
          </p>
        </div>
      </div>

      {/* Historial de pedidos (mock → Tanda 4) */}
      <div>
        <p className="mb-2 text-xs font-medium text-muted">
          Historial de pedidos
        </p>
        {pedidos.length === 0 ? (
          <p className="rounded-xl border border-foreground/10 bg-foreground/[0.03] p-3 text-sm text-muted">
            Aún no tiene pedidos. Se conectará con el módulo de Pedidos (Tanda
            4).
          </p>
        ) : (
          <div className="space-y-1.5">
            {pedidos.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between rounded-lg border border-foreground/5 bg-foreground/[0.03] px-3 py-2 text-sm"
              >
                <span>
                  {p.codigo} · {p.producto} ({p.sabor})
                </span>
                <span className="tabular-nums font-medium">
                  {fmtRD(p.monto)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Notas */}
      {cliente.notas && (
        <div className="rounded-xl border border-foreground/10 bg-primary/[0.06] p-3 text-sm">
          <p className="mb-1 text-xs font-medium text-muted">Notas internas</p>
          {cliente.notas}
        </div>
      )}
    </div>
  );
}

function Campo({ label, valor }: { label: string; valor: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-foreground/5 pb-2">
      <span className="text-muted">{label}</span>
      <span className="text-right font-medium">{valor}</span>
    </div>
  );
}
