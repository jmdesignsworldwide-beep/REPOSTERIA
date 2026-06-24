"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Stagger, StaggerItem } from "@/components/ui/stagger";
import { Magnetic } from "@/components/ui/magnetic";
import { GlassCard } from "@/components/ui/glass-card";
import { Modal } from "@/components/ui/modal";
import { SearchInput, Chips, SortSelect } from "@/components/ui/controls";
import { fmtRD } from "@/lib/data/mock";
import { ClienteForm } from "./cliente-form";
import { ClienteFicha } from "./cliente-ficha";
import {
  cambiarActivo,
  cerrarSesion,
  crearCliente,
  actualizarCliente,
} from "@/app/(app)/clientes/actions";
import type { Cliente, ClienteInput } from "@/lib/clientes/types";

export type ClienteStats = { saldo: number; pendientes: number };

type Filtro = "activos" | "inactivos" | "todos";
type Orden = "reciente" | "nombre" | "saldo";

type ModalState =
  | { type: "nuevo" }
  | { type: "editar"; cliente: Cliente }
  | { type: "ficha"; cliente: Cliente }
  | { type: "confirmar"; cliente: Cliente }
  | null;

export function ClientesView({
  initial,
  stats = {},
  userEmail,
  loadError,
}: {
  initial: Cliente[];
  stats?: Record<string, ClienteStats>;
  userEmail: string;
  loadError: string | null;
}) {
  const router = useRouter();
  const [busqueda, setBusqueda] = useState("");
  const [filtro, setFiltro] = useState<Filtro>("activos");
  const [orden, setOrden] = useState<Orden>("nombre");
  const [soloPendientes, setSoloPendientes] = useState(false);
  const [modal, setModal] = useState<ModalState>(null);
  const [pending, startTransition] = useTransition();

  const saldoDe = (id: string) => stats[id]?.saldo ?? 0;
  const pendientesDe = (id: string) => stats[id]?.pendientes ?? 0;

  const lista = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    const arr = initial.filter((c) => {
      if (filtro === "activos" && !c.activo) return false;
      if (filtro === "inactivos" && c.activo) return false;
      if (soloPendientes && pendientesDe(c.id) === 0) return false;
      if (!q) return true;
      return (
        c.nombre.toLowerCase().includes(q) ||
        c.telefono.includes(q) ||
        (c.cedula ?? "").includes(q) ||
        (c.correo ?? "").toLowerCase().includes(q)
      );
    });
    const ord = [...arr];
    if (orden === "saldo") ord.sort((a, b) => saldoDe(b.id) - saldoDe(a.id));
    else if (orden === "reciente")
      ord.sort((a, b) => (b.created_at ?? "").localeCompare(a.created_at ?? ""));
    else ord.sort((a, b) => a.nombre.localeCompare(b.nombre));
    return ord;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initial, busqueda, filtro, orden, soloPendientes, stats]);

  function refrescar() {
    router.refresh();
  }

  async function guardarNuevo(input: ClienteInput) {
    const res = await crearCliente(input);
    if (res.ok) {
      setModal(null);
      refrescar();
    }
    return res;
  }

  async function guardarEdicion(id: string, input: ClienteInput) {
    const res = await actualizarCliente(id, input);
    if (res.ok) {
      setModal(null);
      refrescar();
    }
    return res;
  }

  function confirmarDesactivar(cliente: Cliente) {
    startTransition(async () => {
      await cambiarActivo(cliente.id, false);
      setModal(null);
      refrescar();
    });
  }

  function reactivar(cliente: Cliente) {
    startTransition(async () => {
      await cambiarActivo(cliente.id, true);
      refrescar();
    });
  }

  const FILTROS: { id: Filtro; label: string }[] = [
    { id: "activos", label: "Activos" },
    { id: "inactivos", label: "Inactivos" },
    { id: "todos", label: "Todos" },
  ];
  const conPendientes = initial.filter((c) => pendientesDe(c.id) > 0).length;

  return (
    <>
      <Stagger className="mx-auto max-w-5xl space-y-6">
        {/* Encabezado */}
        <StaggerItem>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
                Clientes
              </h1>
              <p className="mt-1 text-sm text-muted">
                {initial.filter((c) => c.activo).length} activos ·{" "}
                {userEmail}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Magnetic strength={0.2}>
                <button
                  onClick={() => setModal({ type: "nuevo" })}
                  className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-glow"
                >
                  + Nuevo cliente
                </button>
              </Magnetic>
              <button
                onClick={() => startTransition(() => cerrarSesion())}
                className="rounded-full border border-foreground/10 bg-glass/60 px-4 py-2.5 text-sm font-medium backdrop-blur"
              >
                Salir
              </button>
            </div>
          </div>
        </StaggerItem>

        {/* Buscador + filtros + orden */}
        <StaggerItem>
          <div className="space-y-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <SearchInput
                value={busqueda}
                onChange={setBusqueda}
                placeholder="Buscar por nombre, teléfono, cédula o correo…"
              />
              <SortSelect
                value={orden}
                onChange={setOrden}
                options={[
                  { id: "nombre", label: "Nombre (A-Z)" },
                  { id: "reciente", label: "Más reciente" },
                  { id: "saldo", label: "Mayor pendiente" },
                ]}
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Chips options={FILTROS} value={filtro} onChange={setFiltro} />
              <button
                onClick={() => setSoloPendientes((v) => !v)}
                className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                  soloPendientes
                    ? "bg-primary text-primary-foreground"
                    : "border border-foreground/10 bg-glass/60 text-muted hover:text-foreground"
                }`}
              >
                Con pendientes{conPendientes ? ` (${conPendientes})` : ""}
              </button>
            </div>
          </div>
        </StaggerItem>

        {loadError && (
          <StaggerItem>
            <GlassCard className="border-amber-500/30 p-4 text-sm">
              ⚠️ No se pudo cargar la lista: {loadError}
            </GlassCard>
          </StaggerItem>
        )}

        {/* Lista */}
        {lista.length === 0 ? (
          <StaggerItem>
            <GlassCard className="p-10 text-center text-sm text-muted">
              No hay clientes que coincidan.{" "}
              <button
                onClick={() => setModal({ type: "nuevo" })}
                className="font-medium text-primary underline"
              >
                Crear uno nuevo
              </button>
            </GlassCard>
          </StaggerItem>
        ) : (
          <Stagger className="grid gap-3 sm:grid-cols-2">
            {lista.map((c) => (
              <StaggerItem key={c.id}>
                <Magnetic strength={0.08} glow={false}>
                  <button
                    onClick={() => setModal({ type: "ficha", cliente: c })}
                    className={`flex w-full items-center gap-3 rounded-2xl border border-foreground/5 p-4 text-left transition-colors hover:border-primary/30 ${
                      c.activo ? "bg-foreground/[0.03]" : "bg-foreground/[0.015] opacity-70"
                    }`}
                  >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/15 font-display text-lg font-semibold text-primary">
                      {c.nombre.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="truncate font-medium">{c.nombre}</span>
                        {!c.activo && (
                          <span className="rounded-full bg-foreground/10 px-2 py-0.5 text-[10px] text-muted">
                            Inactivo
                          </span>
                        )}
                      </div>
                      <p className="truncate text-sm text-muted">
                        {c.telefono}
                        {c.correo ? ` · ${c.correo}` : ""}
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1">
                      {saldoDe(c.id) > 0 ? (
                        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold tabular-nums text-primary">
                          {fmtRD(saldoDe(c.id))}
                        </span>
                      ) : (
                        <span className="text-muted">→</span>
                      )}
                      {pendientesDe(c.id) > 0 && (
                        <span className="text-[10px] text-muted">
                          {pendientesDe(c.id)} pendiente(s)
                        </span>
                      )}
                    </div>
                  </button>
                </Magnetic>
              </StaggerItem>
            ))}
          </Stagger>
        )}
      </Stagger>

      {/* ───── Modal: nuevo ───── */}
      <Modal
        open={modal?.type === "nuevo"}
        onClose={() => setModal(null)}
        title="Nuevo cliente"
        subtitle="Se guarda en la base de datos"
      >
        <ClienteForm onSave={(input) => guardarNuevo(input)} />
      </Modal>

      {/* ───── Modal: editar ───── */}
      <Modal
        open={modal?.type === "editar"}
        onClose={() => setModal(null)}
        title="Editar cliente"
        subtitle={modal?.type === "editar" ? modal.cliente.nombre : undefined}
      >
        {modal?.type === "editar" && (
          <ClienteForm
            cliente={modal.cliente}
            onSave={(input) => guardarEdicion(modal.cliente.id, input)}
          />
        )}
      </Modal>

      {/* ───── Modal: ficha ───── */}
      <Modal
        open={modal?.type === "ficha"}
        onClose={() => setModal(null)}
        title={modal?.type === "ficha" ? modal.cliente.nombre : ""}
        subtitle={
          modal?.type === "ficha"
            ? modal.cliente.activo
              ? "Cliente activo"
              : "Cliente inactivo"
            : undefined
        }
        footer={
          modal?.type === "ficha" ? (
            <div className="flex gap-2">
              <button
                onClick={() =>
                  setModal({ type: "editar", cliente: modal.cliente })
                }
                className="flex-1 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-glow"
              >
                Editar
              </button>
              {modal.cliente.activo ? (
                <button
                  onClick={() =>
                    setModal({ type: "confirmar", cliente: modal.cliente })
                  }
                  className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm font-semibold text-red-600 dark:text-red-400"
                >
                  Desactivar
                </button>
              ) : (
                <button
                  disabled={pending}
                  onClick={() => reactivar(modal.cliente)}
                  className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2.5 text-sm font-semibold text-emerald-600 disabled:opacity-60 dark:text-emerald-400"
                >
                  Reactivar
                </button>
              )}
            </div>
          ) : undefined
        }
      >
        {modal?.type === "ficha" && <ClienteFicha cliente={modal.cliente} />}
      </Modal>

      {/* ───── Modal: confirmar desactivar ───── */}
      <Modal
        open={modal?.type === "confirmar"}
        onClose={() => setModal(null)}
        title="¿Desactivar cliente?"
      >
        {modal?.type === "confirmar" && (
          <div className="space-y-5">
            <p className="text-sm text-muted">
              <span className="font-medium text-foreground">
                {modal.cliente.nombre}
              </span>{" "}
              pasará a inactivo. No se borra: conserva su historial y puedes
              reactivarlo cuando quieras.
            </p>
            <div className="flex gap-2">
              <button
                disabled={pending}
                onClick={() => confirmarDesactivar(modal.cliente)}
                className="flex-1 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
              >
                {pending ? "Desactivando…" : "Sí, desactivar"}
              </button>
              <button
                onClick={() => setModal(null)}
                className="rounded-xl border border-foreground/15 bg-glass/60 px-4 py-2.5 text-sm font-semibold backdrop-blur"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
