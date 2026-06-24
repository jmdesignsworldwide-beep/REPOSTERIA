"use client";

import { Search, X } from "lucide-react";

/** Buscador en vivo, consistente en todo el sistema. */
export function SearchInput({
  value,
  onChange,
  placeholder,
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
}) {
  return (
    <div className={`relative flex-1 ${className ?? ""}`}>
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-foreground/15 bg-background/60 py-2.5 pl-9 pr-9 text-sm outline-none backdrop-blur transition-colors focus:border-primary"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label="Limpiar búsqueda"
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted transition-colors hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

export type ChipOption<T extends string> = {
  id: T;
  label: string;
  dot?: string | null;
};

/** Fila de chips de filtro (mismo estilo que el Calendario). */
export function Chips<T extends string>({
  options,
  value,
  onChange,
  className,
}: {
  options: ChipOption<T>[];
  value: T;
  onChange: (v: T) => void;
  className?: string;
}) {
  return (
    <div className={`flex flex-wrap gap-1.5 ${className ?? ""}`}>
      {options.map((o) => {
        const activo = value === o.id;
        return (
          <button
            key={o.id}
            type="button"
            onClick={() => onChange(o.id)}
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
              activo
                ? "bg-primary text-primary-foreground"
                : "border border-foreground/10 bg-glass/60 text-muted hover:text-foreground"
            }`}
          >
            {o.dot && (
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  activo ? "bg-primary-foreground" : o.dot
                }`}
              />
            )}
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

/** Selector de orden compacto. */
export function SortSelect<T extends string>({
  value,
  onChange,
  options,
  className,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { id: T; label: string }[];
  className?: string;
}) {
  return (
    <label className={`relative inline-flex items-center ${className ?? ""}`}>
      <span className="pointer-events-none absolute left-3 text-xs text-muted">
        Ordenar:
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        className="appearance-none rounded-xl border border-foreground/15 bg-background/60 py-2.5 pl-[4.5rem] pr-8 text-sm font-medium outline-none backdrop-blur transition-colors focus:border-primary"
      >
        {options.map((o) => (
          <option key={o.id} value={o.id}>
            {o.label}
          </option>
        ))}
      </select>
      <span className="pointer-events-none absolute right-3 text-muted">▾</span>
    </label>
  );
}

/** Toggle segmentado (p. ej. cuadrícula / lista). */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
  className,
}: {
  options: { id: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
  className?: string;
}) {
  return (
    <div
      className={`inline-flex rounded-xl border border-foreground/10 bg-glass/50 p-1 backdrop-blur ${
        className ?? ""
      }`}
    >
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          onClick={() => onChange(o.id)}
          className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
            value === o.id
              ? "bg-primary text-primary-foreground"
              : "text-muted hover:text-foreground"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
