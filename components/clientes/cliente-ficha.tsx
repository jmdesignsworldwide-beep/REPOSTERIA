"use client";

import { useEffect, useState } from "react";
import { fmtRD } from "@/lib/data/mock";
import { Skeleton } from "@/components/ui/skeleton";
import { EstadoBadge } from "@/components/pedidos/pedido-detalle";
import { getPedidosDeCliente } from "@/app/(app)/pedidos/actions";
import type { Cliente } from "@/lib/clientes/types";
import { abonadoDe, type Pedido } from "@/lib/pedidos/types";

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
  const prox = new Date(hoy.getFullYear(), f.getMonth(), f.getDate());
  if (prox < new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate())) {
    prox.setFullYear(hoy.getFullYear() + 1);
  }
  return Math.round((prox.getTime() - hoy.setHours(0, 0, 0, 0)) / 86400000);
}

export function ClienteFicha({ cliente }: { cliente: Cliente }) {
  const [pedidos, setPedidos] = useState<Pedido[] | null>(null);

  useEffect(() => {
    let activo = true;
    getPedidosDeCliente(cliente.id).then((p) => {
      if (activo) setPedidos(p);
    });
    return () => {
      activo = false;
    };
  }, [cliente.id]);

  const total = (pedidos ?? []).reduce((s, p) => s + Number(p.total), 0);
  const abonado = (pedidos ?? []).reduce((s, p) => s + abonadoDe(p), 0);
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

      {/* Balance (real) */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="rounded-xl border border-foreground/10 bg-foreground/[0.03] p-3">
          <p className="text-xs text-muted">Pedidos</p>
          <p className="tabular-nums font-semibold">
            {pedidos === null ? "…" : pedidos.length}
          </p>
        </div>
        <div className="rounded-xl border border-foreground/10 bg-foreground/[0.03] p-3">
          <p className="text-xs text-muted">Adelantos</p>
          <p className="tabular-nums font-semibold text-emerald-600 dark:text-emerald-400">
            {pedidos === null ? "…" : fmtRD(abonado)}
          </p>
        </div>
        <div className="rounded-xl border border-foreground/10 bg-foreground/[0.03] p-3">
          <p className="text-xs text-muted">Balance</p>
          <p className="tabular-nums font-semibold text-primary">
            {pedidos === null ? "…" : fmtRD(balance)}
          </p>
        </div>
      </div>

      {/* Historial real de pedidos */}
      <div>
        <p className="mb-2 text-xs font-medium text-muted">
          Historial de pedidos
        </p>
        {pedidos === null ? (
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : pedidos.length === 0 ? (
          <p className="rounded-xl border border-foreground/10 bg-foreground/[0.03] p-3 text-sm text-muted">
            Aún no tiene pedidos. Crea uno en el módulo de Pedidos.
          </p>
        ) : (
          <div className="space-y-1.5">
            {pedidos.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between rounded-lg border border-foreground/5 bg-foreground/[0.03] px-3 py-2 text-sm"
              >
                <span className="min-w-0 truncate">
                  #{p.numero} · {p.items[0]?.producto ?? p.descripcion ?? "Pedido"}
                </span>
                <div className="flex shrink-0 items-center gap-2">
                  <EstadoBadge estado={p.estado} />
                  <span className="tabular-nums font-medium">
                    {fmtRD(Number(p.total))}
                  </span>
                </div>
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
