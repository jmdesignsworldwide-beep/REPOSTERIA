"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Stagger, StaggerItem } from "@/components/ui/stagger";
import { Magnetic } from "@/components/ui/magnetic";
import { GlassCard } from "@/components/ui/glass-card";
import { Modal } from "@/components/ui/modal";
import { fmtRD } from "@/lib/data/mock";
import { ESTADOS } from "@/lib/pedidos/types";
import type { EstadoPedido, Pedido, PedidoInput } from "@/lib/pedidos/types";
import type { Cliente } from "@/lib/clientes/types";
import { PedidoForm } from "./pedido-form";
import { EstadoBadge, PedidoDetalle } from "./pedido-detalle";
import { CobrarPagoForm } from "./cobrar-pago";
import { PedidosTablero } from "./pedidos-tablero";
import { SignedImg } from "@/components/ui/signed-img";
import { SearchInput, Chips, SortSelect } from "@/components/ui/controls";
import {
  actualizarPedido,
  cambiarActivoPedido,
  cambiarEstadoPedido,
  crearPedido,
} from "@/app/(app)/pedidos/actions";

type Filtro = EstadoPedido | "todos";
type Rango = "todos" | "hoy" | "semana" | "mes" | "futuros";
type Orden = "fecha" | "monto" | "cliente";

const DOT: Record<EstadoPedido, string> = {
  pendiente: "bg-amber-500",
  en_proceso: "bg-sky-500",
  listo: "bg-emerald-500",
  entregado: "bg-foreground/40",
};

const pad = (n: number) => String(n).padStart(2, "0");
const hoyISO = () => {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};
function enRango(fecha: string, rango: Rango): boolean {
  if (rango === "todos") return true;
  const hoy = hoyISO();
  if (rango === "futuros") return fecha >= hoy;
  const d = new Date();
  if (rango === "hoy") return fecha === hoy;
  if (rango === "semana") {
    const fin = new Date(d);
    fin.setDate(fin.getDate() + 6);
    return fecha >= hoy && fecha <= `${fin.getFullYear()}-${pad(fin.getMonth() + 1)}-${pad(fin.getDate())}`;
  }
  // mes
  return fecha.slice(0, 7) === hoy.slice(0, 7);
}

type ModalState =
  | { type: "nuevo" }
  | { type: "editar"; pedido: Pedido }
  | { type: "detalle"; pedido: Pedido }
  | { type: "confirmar"; pedido: Pedido }
  | { type: "cobrar"; pedido: Pedido }
  | null;

export function PedidosView({
  initial,
  clientes,
}: {
  initial: Pedido[];
  clientes: Cliente[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [vista, setVista] = useState<"lista" | "tablero">("lista");
  const [busqueda, setBusqueda] = useState("");
  const [filtro, setFiltro] = useState<Filtro>("todos");
  const [rango, setRango] = useState<Rango>("todos");
  const [orden, setOrden] = useState<Orden>("fecha");
  const [modal, setModal] = useState<ModalState>(null);
  const [nuevaFecha, setNuevaFecha] = useState<string | undefined>(undefined);
  const [pending, startTransition] = useTransition();

  const activos = useMemo(() => initial.filter((p) => p.activo), [initial]);

  // Deep-link desde el Calendario: /pedidos?nuevo=YYYY-MM-DD abre el formulario
  // de nuevo pedido con la fecha de entrega pre-cargada.
  const abierto = useRef(false);
  useEffect(() => {
    const fecha = searchParams.get("nuevo");
    if (fecha && !abierto.current) {
      abierto.current = true;
      setNuevaFecha(/^\d{4}-\d{2}-\d{2}$/.test(fecha) ? fecha : undefined);
      setModal({ type: "nuevo" });
      router.replace("/pedidos");
    }
  }, [searchParams, router]);

  // Base: búsqueda + rango de fecha (la usan Lista y Tablero por igual).
  const base = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    return activos.filter((p) => {
      if (!enRango(p.fecha_entrega, rango)) return false;
      if (!q) return true;
      return (
        (p.cliente?.nombre ?? "").toLowerCase().includes(q) ||
        ("#" + p.numero).includes(q) ||
        (p.ocasion ?? "").toLowerCase().includes(q) ||
        p.items.some((i) => i.producto.toLowerCase().includes(q))
      );
    });
  }, [activos, busqueda, rango]);

  // Lista: base + estado + orden.
  const lista = useMemo(() => {
    const arr = base.filter((p) => filtro === "todos" || p.estado === filtro);
    const ord = [...arr];
    if (orden === "monto") ord.sort((a, b) => b.total - a.total);
    else if (orden === "cliente")
      ord.sort((a, b) =>
        (a.cliente?.nombre ?? "").localeCompare(b.cliente?.nombre ?? ""),
      );
    else ord.sort((a, b) => a.fecha_entrega.localeCompare(b.fecha_entrega));
    return ord;
  }, [base, filtro, orden]);

  function refrescar() {
    router.refresh();
  }

  async function guardarNuevo(input: PedidoInput) {
    const res = await crearPedido(input);
    if (res.ok) {
      setModal(null);
      refrescar();
    }
    return res;
  }

  async function guardarEdicion(id: string, input: PedidoInput) {
    const res = await actualizarPedido(id, input);
    if (res.ok) {
      setModal(null);
      refrescar();
    }
    return res;
  }

  function cambiarEstado(pedido: Pedido, estado: EstadoPedido) {
    return new Promise<void>((resolve) => {
      startTransition(async () => {
        await cambiarEstadoPedido(pedido.id, estado);
        refrescar();
        setModal((m) =>
          m && m.type === "detalle" && m.pedido.id === pedido.id
            ? { type: "detalle", pedido: { ...pedido, estado } }
            : m,
        );
        resolve();
      });
    });
  }

  function desactivar(pedido: Pedido) {
    startTransition(async () => {
      await cambiarActivoPedido(pedido.id, false);
      setModal(null);
      refrescar();
    });
  }

  const FILTROS: { id: Filtro; label: string; dot?: string }[] = [
    { id: "todos", label: "Todos" },
    ...ESTADOS.map((e) => ({
      id: e.id as Filtro,
      label: e.label,
      dot: DOT[e.id],
    })),
  ];
  const RANGOS: { id: Rango; label: string }[] = [
    { id: "todos", label: "Todas las fechas" },
    { id: "hoy", label: "Hoy" },
    { id: "semana", label: "Esta semana" },
    { id: "mes", label: "Este mes" },
    { id: "futuros", label: "Próximos" },
  ];

  return (
    <>
      <Stagger className="mx-auto max-w-5xl space-y-6">
        <StaggerItem>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
                Pedidos
              </h1>
              <p className="mt-1 text-sm text-muted">
                {activos.length} pedidos activos
              </p>
            </div>
            <Magnetic strength={0.2}>
              <button
                onClick={() => setModal({ type: "nuevo" })}
                className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-glow"
              >
                + Nuevo pedido
              </button>
            </Magnetic>
          </div>
        </StaggerItem>

        {/* Controles: búsqueda + rango + vista (aplican a Lista y Tablero) */}
        <StaggerItem>
          <div className="space-y-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <SearchInput
                value={busqueda}
                onChange={setBusqueda}
                placeholder="Buscar por cliente, número, producto u ocasión…"
              />
              <div className="inline-flex rounded-xl border border-foreground/10 bg-glass/50 p-1 backdrop-blur">
                {(
                  [
                    { id: "lista", label: "📋 Lista" },
                    { id: "tablero", label: "🗂️ Tablero" },
                  ] as const
                ).map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setVista(v.id)}
                    className={`rounded-lg px-4 py-1.5 text-sm font-medium transition-colors ${
                      vista === v.id
                        ? "bg-primary text-primary-foreground"
                        : "text-muted hover:text-foreground"
                    }`}
                  >
                    {v.label}
                  </button>
                ))}
              </div>
            </div>
            <Chips options={RANGOS} value={rango} onChange={setRango} />
          </div>
        </StaggerItem>

        {vista === "tablero" ? (
          <PedidosTablero
            pedidos={base}
            onAbrir={(p) => setModal({ type: "detalle", pedido: p })}
          />
        ) : (
          <>
        <StaggerItem>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Chips options={FILTROS} value={filtro} onChange={setFiltro} />
            <SortSelect
              value={orden}
              onChange={setOrden}
              options={[
                { id: "fecha", label: "Fecha de entrega" },
                { id: "monto", label: "Monto (mayor)" },
                { id: "cliente", label: "Cliente (A-Z)" },
              ]}
            />
          </div>
        </StaggerItem>

        {lista.length === 0 ? (
          <StaggerItem>
            <GlassCard className="p-10 text-center text-sm text-muted">
              No hay pedidos que coincidan.{" "}
              <button
                onClick={() => setModal({ type: "nuevo" })}
                className="font-medium text-primary underline"
              >
                Crear uno nuevo
              </button>
            </GlassCard>
          </StaggerItem>
        ) : (
          <Stagger className="space-y-3">
            {lista.map((p) => (
              <StaggerItem key={p.id}>
                <Magnetic strength={0.08} glow={false}>
                  <button
                    onClick={() => setModal({ type: "detalle", pedido: p })}
                    className="flex w-full items-center gap-3 rounded-2xl border border-foreground/5 bg-foreground/[0.03] p-4 text-left transition-colors hover:border-primary/30"
                  >
                    <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-primary/15">
                      {p.fotos[0] ? (
                        <SignedImg
                          src={p.fotos[0]}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="flex h-full w-full items-center justify-center text-xl">
                          🧁
                        </span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="truncate font-medium">
                          {p.cliente?.nombre ?? "Cliente"}
                        </span>
                        <span className="shrink-0 text-xs text-muted">
                          #{p.numero}
                        </span>
                      </div>
                      <p className="truncate text-sm text-muted">
                        {p.items[0]?.producto ?? p.descripcion ?? "Pedido"}
                        {p.ocasion ? ` · ${p.ocasion}` : ""}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <div className="tabular-nums font-semibold">
                        {fmtRD(p.total)}
                      </div>
                      <div className="mt-1 flex items-center justify-end gap-2">
                        <span className="tabular-nums text-xs text-muted">
                          {p.fecha_entrega}
                        </span>
                        <EstadoBadge estado={p.estado} />
                      </div>
                    </div>
                  </button>
                </Magnetic>
              </StaggerItem>
            ))}
          </Stagger>
        )}
          </>
        )}
      </Stagger>

      {/* Nuevo */}
      <Modal
        open={modal?.type === "nuevo"}
        onClose={() => {
          setModal(null);
          setNuevaFecha(undefined);
        }}
        title="Nuevo pedido"
        subtitle="Se guarda en la base de datos"
      >
        <PedidoForm
          clientes={clientes}
          fechaInicial={nuevaFecha}
          onSave={guardarNuevo}
        />
      </Modal>

      {/* Editar */}
      <Modal
        open={modal?.type === "editar"}
        onClose={() => setModal(null)}
        title="Editar pedido"
        subtitle={modal?.type === "editar" ? `#${modal.pedido.numero}` : undefined}
      >
        {modal?.type === "editar" && (
          <PedidoForm
            clientes={clientes}
            pedido={modal.pedido}
            onSave={(input) => guardarEdicion(modal.pedido.id, input)}
          />
        )}
      </Modal>

      {/* Detalle */}
      <Modal
        open={modal?.type === "detalle"}
        onClose={() => setModal(null)}
        title={modal?.type === "detalle" ? `Pedido #${modal.pedido.numero}` : ""}
        subtitle={modal?.type === "detalle" ? modal.pedido.ocasion ?? undefined : undefined}
        footer={
          modal?.type === "detalle" ? (
            <div className="flex gap-2">
              <button
                onClick={() =>
                  setModal({ type: "editar", pedido: modal.pedido })
                }
                className="flex-1 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-glow"
              >
                Editar
              </button>
              <button
                onClick={() =>
                  setModal({ type: "confirmar", pedido: modal.pedido })
                }
                className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm font-semibold text-red-600 dark:text-red-400"
              >
                Desactivar
              </button>
            </div>
          ) : undefined
        }
      >
        {modal?.type === "detalle" && (
          <PedidoDetalle
            pedido={modal.pedido}
            onEstadoChange={(estado) => cambiarEstado(modal.pedido, estado)}
            onCobrar={() => setModal({ type: "cobrar", pedido: modal.pedido })}
          />
        )}
      </Modal>

      {/* Cobrar pago */}
      <Modal
        open={modal?.type === "cobrar"}
        onClose={() => setModal(null)}
        title="Cobrar pago"
        subtitle={modal?.type === "cobrar" ? `Pedido #${modal.pedido.numero}` : undefined}
      >
        {modal?.type === "cobrar" && (
          <CobrarPagoForm
            pedido={modal.pedido}
            onDone={() => {
              setModal(null);
              refrescar();
            }}
          />
        )}
      </Modal>

      {/* Confirmar desactivar */}
      <Modal
        open={modal?.type === "confirmar"}
        onClose={() => setModal(null)}
        title="¿Desactivar pedido?"
      >
        {modal?.type === "confirmar" && (
          <div className="space-y-5">
            <p className="text-sm text-muted">
              El pedido{" "}
              <span className="font-medium text-foreground">
                #{modal.pedido.numero}
              </span>{" "}
              pasará a inactivo. No se borra: conserva su historial.
            </p>
            <div className="flex gap-2">
              <button
                disabled={pending}
                onClick={() => desactivar(modal.pedido)}
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
