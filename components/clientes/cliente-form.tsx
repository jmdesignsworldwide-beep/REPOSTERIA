"use client";

import { useState } from "react";
import type {
  ActionResult,
  Cliente,
  ClienteInput,
  FechaImportante,
} from "@/lib/clientes/types";

const TIPOS_FECHA = ["Cumpleaños", "Aniversario", "Boda", "Bautizo", "Otro"];

function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-medium">{label}</span>
      {children}
      {hint && <span className="block text-xs text-muted">{hint}</span>}
    </label>
  );
}

const inputCls =
  "w-full rounded-xl border border-foreground/15 bg-background/60 px-3 py-2.5 text-sm outline-none backdrop-blur transition-colors focus:border-primary";

export function ClienteForm({
  cliente,
  onSave,
}: {
  cliente?: Cliente;
  onSave: (input: ClienteInput) => Promise<ActionResult>;
}) {
  const [nombre, setNombre] = useState(cliente?.nombre ?? "");
  const [cedula, setCedula] = useState(cliente?.cedula ?? "");
  const [telefono, setTelefono] = useState(cliente?.telefono ?? "");
  const [correo, setCorreo] = useState(cliente?.correo ?? "");
  const [direccion, setDireccion] = useState(cliente?.direccion ?? "");
  const [alergias, setAlergias] = useState((cliente?.alergias ?? []).join(", "));
  const [preferencias, setPreferencias] = useState(
    (cliente?.preferencias ?? []).join(", "),
  );
  const [notas, setNotas] = useState(cliente?.notas ?? "");
  const [fechas, setFechas] = useState<FechaImportante[]>(
    cliente?.fechas_importantes ?? [],
  );

  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function addFecha() {
    setFechas((f) => [...f, { tipo: "Cumpleaños", fecha: "" }]);
  }
  function updateFecha(i: number, patch: Partial<FechaImportante>) {
    setFechas((f) => f.map((x, idx) => (idx === i ? { ...x, ...patch } : x)));
  }
  function removeFecha(i: number) {
    setFechas((f) => f.filter((_, idx) => idx !== i));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    const input: ClienteInput = {
      nombre,
      cedula,
      telefono,
      correo,
      direccion,
      alergias: alergias.split(",").map((s) => s.trim()).filter(Boolean),
      preferencias: preferencias.split(",").map((s) => s.trim()).filter(Boolean),
      fechas_importantes: fechas.filter((f) => f.fecha),
      notas,
    };
    const res = await onSave(input);
    if (!res.ok) {
      setError(res.error);
      setSaving(false);
    }
    // Si ok, el padre cierra el modal.
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Field label="Nombre *">
        <input
          className={inputCls}
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Nombre y apellido"
          required
        />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Teléfono *" hint="809 / 829 / 849">
          <input
            className={inputCls}
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
            placeholder="809-555-1234"
            required
          />
        </Field>
        <Field label="Cédula">
          <input
            className={inputCls}
            value={cedula}
            onChange={(e) => setCedula(e.target.value)}
            placeholder="001-1234567-8"
          />
        </Field>
      </div>

      <Field label="Correo (opcional)">
        <input
          type="email"
          className={inputCls}
          value={correo}
          onChange={(e) => setCorreo(e.target.value)}
          placeholder="cliente@correo.com"
        />
      </Field>

      <Field label="Dirección">
        <input
          className={inputCls}
          value={direccion}
          onChange={(e) => setDireccion(e.target.value)}
          placeholder="Calle, sector, ciudad"
        />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Alergias" hint="Separadas por coma">
          <input
            className={inputCls}
            value={alergias}
            onChange={(e) => setAlergias(e.target.value)}
            placeholder="Maní, Gluten"
          />
        </Field>
        <Field label="Preferencias" hint="Sabores, separados por coma">
          <input
            className={inputCls}
            value={preferencias}
            onChange={(e) => setPreferencias(e.target.value)}
            placeholder="Chocolate, Tres leches"
          />
        </Field>
      </div>

      {/* Fechas importantes */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Fechas importantes</span>
          <button
            type="button"
            onClick={addFecha}
            className="rounded-lg border border-foreground/15 bg-glass/60 px-2.5 py-1 text-xs font-medium backdrop-blur"
          >
            + Añadir
          </button>
        </div>
        {fechas.map((f, i) => (
          <div key={i} className="flex gap-2">
            <select
              value={f.tipo}
              onChange={(e) => updateFecha(i, { tipo: e.target.value })}
              className={`${inputCls} w-32`}
            >
              {TIPOS_FECHA.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            <input
              type="date"
              value={f.fecha}
              onChange={(e) => updateFecha(i, { fecha: e.target.value })}
              className={`${inputCls} flex-1`}
            />
            <button
              type="button"
              onClick={() => removeFecha(i)}
              aria-label="Quitar fecha"
              className="rounded-lg border border-foreground/15 px-3 text-sm"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      <Field label="Notas internas">
        <textarea
          className={`${inputCls} min-h-20 resize-y`}
          value={notas}
          onChange={(e) => setNotas(e.target.value)}
          placeholder="Preferencias de entrega, observaciones…"
        />
      </Field>

      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-600 dark:text-red-400">
          ⚠️ {error}
        </div>
      )}

      <button
        type="submit"
        disabled={saving}
        className="w-full rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-glow disabled:opacity-60"
      >
        {saving ? "Guardando…" : cliente ? "Guardar cambios" : "Crear cliente"}
      </button>
    </form>
  );
}
