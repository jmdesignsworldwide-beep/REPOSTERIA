-- ════════════════════════════════════════════════════════════════
--  Tanda 4 · Pedidos + Renglones (pedido_items) + Storage
--  Reusa clientes (cliente_id → clientes.id), audit_log y set_updated_at
--  de la Tanda 3. RLS + FORCE, soft-delete a nivel de pedido.
-- ════════════════════════════════════════════════════════════════

-- ───────────── pedidos ─────────────
create table if not exists public.pedidos (
  id            uuid primary key default gen_random_uuid(),
  numero        bigint generated always as identity,
  cliente_id    uuid not null references public.clientes(id) on delete restrict,
  descripcion   text,
  ocasion       text,
  fecha_entrega date not null,
  hora_entrega  text,
  estado        text not null default 'pendiente'
                  check (estado in ('pendiente','en_proceso','listo','entregado')),
  total         numeric(12,2) not null default 0,
  adelanto      numeric(12,2) not null default 0,
  notas         text,
  fotos         text[] not null default '{}',
  activo        boolean not null default true,
  deleted_at    timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  created_by    uuid default auth.uid(),
  updated_by    uuid default auth.uid()
);

create index if not exists pedidos_cliente_idx on public.pedidos (cliente_id);
create index if not exists pedidos_fecha_idx   on public.pedidos (fecha_entrega);
create index if not exists pedidos_estado_idx  on public.pedidos (estado);

alter table public.pedidos enable row level security;
alter table public.pedidos force  row level security;

drop policy if exists pedidos_select on public.pedidos;
create policy pedidos_select on public.pedidos for select to authenticated using (true);
drop policy if exists pedidos_insert on public.pedidos;
create policy pedidos_insert on public.pedidos for insert to authenticated with check (true);
drop policy if exists pedidos_update on public.pedidos;
create policy pedidos_update on public.pedidos for update to authenticated using (true) with check (true);

drop trigger if exists pedidos_set_updated_at on public.pedidos;
create trigger pedidos_set_updated_at before update on public.pedidos
  for each row execute function public.set_updated_at();

drop trigger if exists pedidos_audit on public.pedidos;
create trigger pedidos_audit after insert or update on public.pedidos
  for each row execute function public.audit_trigger();

-- ───────────── pedido_items (renglones) ─────────────
create table if not exists public.pedido_items (
  id        uuid primary key default gen_random_uuid(),
  pedido_id uuid not null references public.pedidos(id) on delete cascade,
  producto  text not null,
  tamano    text,
  sabor     text,
  cantidad  integer not null default 1 check (cantidad > 0),
  precio    numeric(12,2) not null default 0,
  orden     integer not null default 0
);

create index if not exists pedido_items_pedido_idx on public.pedido_items (pedido_id);

alter table public.pedido_items enable row level security;
alter table public.pedido_items force  row level security;

drop policy if exists pedido_items_select on public.pedido_items;
create policy pedido_items_select on public.pedido_items for select to authenticated using (true);
drop policy if exists pedido_items_insert on public.pedido_items;
create policy pedido_items_insert on public.pedido_items for insert to authenticated with check (true);
drop policy if exists pedido_items_update on public.pedido_items;
create policy pedido_items_update on public.pedido_items for update to authenticated using (true) with check (true);
-- Los renglones se reemplazan al editar (sub-líneas de un pedido).
drop policy if exists pedido_items_delete on public.pedido_items;
create policy pedido_items_delete on public.pedido_items for delete to authenticated using (true);

-- ───────────── Storage: bucket de fotos de referencia ─────────────
insert into storage.buckets (id, name, public)
values ('referencias', 'referencias', true)
on conflict (id) do nothing;

drop policy if exists referencias_select on storage.objects;
create policy referencias_select on storage.objects
  for select using (bucket_id = 'referencias');
drop policy if exists referencias_insert on storage.objects;
create policy referencias_insert on storage.objects
  for insert to authenticated with check (bucket_id = 'referencias');
drop policy if exists referencias_update on storage.objects;
create policy referencias_update on storage.objects
  for update to authenticated using (bucket_id = 'referencias');
drop policy if exists referencias_delete on storage.objects;
create policy referencias_delete on storage.objects
  for delete to authenticated using (bucket_id = 'referencias');

-- ───────────── Datos semilla (solo si no hay pedidos) ─────────────
do $$
declare
  yok uuid; wendy uuid; jose uuid; fran uuid;
  p uuid;
begin
  if not exists (select 1 from public.pedidos) then
    select id into yok   from public.clientes where nombre = 'Yokasta Reyes'    limit 1;
    select id into wendy from public.clientes where nombre = 'Wendy Espinal'    limit 1;
    select id into jose  from public.clientes where nombre = 'José Manuel Cruz' limit 1;
    select id into fran  from public.clientes where nombre = 'Francisco Medina' limit 1;

    -- Pedido 1 (hoy)
    insert into public.pedidos (cliente_id, descripcion, ocasion, fecha_entrega, hora_entrega, estado, total, adelanto, notas)
    values (yok, 'Bizcocho dominicano tres leches', 'Cumpleaños', current_date, '14:30', 'en_proceso', 3200, 1600, 'Flores rosadas. Mensaje: ¡Feliz cumpleaños Mía!')
    returning id into p;
    insert into public.pedido_items (pedido_id, producto, tamano, sabor, cantidad, precio, orden)
    values (p, 'Bizcocho dominicano', '10 porciones', 'Tres leches', 1, 3200, 0);

    -- Pedido 2 (hoy)
    insert into public.pedidos (cliente_id, descripcion, ocasion, fecha_entrega, hora_entrega, estado, total, adelanto, notas)
    values (wendy, 'Cupcakes de graduación', 'Graduación', current_date, '16:00', 'pendiente', 1800, 900, 'Toppings azul y dorado.')
    returning id into p;
    insert into public.pedido_items (pedido_id, producto, tamano, sabor, cantidad, precio, orden)
    values (p, 'Cupcakes', 'Caja de 24', 'Chocolate', 24, 75, 0);

    -- Pedido 3 (en 2 días)
    insert into public.pedidos (cliente_id, descripcion, ocasion, fecha_entrega, hora_entrega, estado, total, adelanto, notas)
    values (jose, 'Pastel de boda 3 pisos', 'Boda', current_date + 2, '18:00', 'pendiente', 8500, 4250, '3 pisos, tema dorado. Topper de novios.')
    returning id into p;
    insert into public.pedido_items (pedido_id, producto, tamano, sabor, cantidad, precio, orden)
    values
      (p, 'Pastel de boda', '3 pisos', 'Guayaba', 1, 7000, 0),
      (p, 'Topper personalizado', 'Único', 'N/A', 1, 1500, 1);

    -- Pedido 4 (en 5 días)
    insert into public.pedidos (cliente_id, descripcion, ocasion, fecha_entrega, hora_entrega, estado, total, adelanto, notas)
    values (fran, 'Bizcocho de piña', 'Aniversario', current_date + 5, '13:00', 'pendiente', 2750, 1375, 'Sin dulce de leche.')
    returning id into p;
    insert into public.pedido_items (pedido_id, producto, tamano, sabor, cantidad, precio, orden)
    values (p, 'Bizcocho', '8 porciones', 'Piña', 1, 2750, 0);
  end if;
end $$;
