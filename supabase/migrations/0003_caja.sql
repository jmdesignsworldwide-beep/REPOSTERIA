-- ════════════════════════════════════════════════════════════════
--  Tanda 5 · Caja diaria (movimientos_caja)
--  RLS + FORCE, soft-delete vía `anulado`, auditoría.
--  Los pagos de pedidos viven AQUÍ (un solo origen); pedido.abonado
--  se deriva sumando los ingresos enlazados por pedido_id.
-- ════════════════════════════════════════════════════════════════

create table if not exists public.movimientos_caja (
  id          uuid primary key default gen_random_uuid(),
  tipo        text not null check (tipo in ('ingreso','egreso')),
  monto       numeric(12,2) not null check (monto > 0),
  concepto    text not null,
  categoria   text not null
                check (categoria in ('pago_pedido','venta_directa','gasto_operativo','compra_insumos','otro')),
  metodo      text not null check (metodo in ('efectivo','transferencia','tarjeta')),
  pedido_id   uuid references public.pedidos(id) on delete set null,
  fecha       date not null default current_date,
  anulado     boolean not null default false,
  anulado_at  timestamptz,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  created_by  uuid default auth.uid(),
  updated_by  uuid default auth.uid()
);

create index if not exists movimientos_caja_fecha_idx  on public.movimientos_caja (fecha);
create index if not exists movimientos_caja_pedido_idx on public.movimientos_caja (pedido_id);

alter table public.movimientos_caja enable row level security;
alter table public.movimientos_caja force  row level security;

drop policy if exists mov_caja_select on public.movimientos_caja;
create policy mov_caja_select on public.movimientos_caja for select to authenticated using (true);
drop policy if exists mov_caja_insert on public.movimientos_caja;
create policy mov_caja_insert on public.movimientos_caja for insert to authenticated with check (true);
drop policy if exists mov_caja_update on public.movimientos_caja;
create policy mov_caja_update on public.movimientos_caja for update to authenticated using (true) with check (true);

drop trigger if exists mov_caja_set_updated_at on public.movimientos_caja;
create trigger mov_caja_set_updated_at before update on public.movimientos_caja
  for each row execute function public.set_updated_at();

-- Auditoría propia (esta tabla usa `anulado` en vez de `activo`).
create or replace function public.audit_trigger_caja()
returns trigger language plpgsql security definer set search_path = public as $$
declare v_action text; v_changes jsonb;
begin
  if tg_op = 'INSERT' then
    v_action := 'insert'; v_changes := to_jsonb(new);
  elsif tg_op = 'UPDATE' then
    if    new.anulado = true  and old.anulado = false then v_action := 'delete';
    elsif new.anulado = false and old.anulado = true  then v_action := 'restore';
    else  v_action := 'update'; end if;
    v_changes := jsonb_build_object('old', to_jsonb(old), 'new', to_jsonb(new));
  end if;
  insert into public.audit_log (table_name, record_id, action, actor, actor_email, changes)
  values (tg_table_name, new.id, v_action, auth.uid(),
          (select email from auth.users where id = auth.uid()), v_changes);
  return new;
end; $$;

drop trigger if exists mov_caja_audit on public.movimientos_caja;
create trigger mov_caja_audit after insert or update on public.movimientos_caja
  for each row execute function public.audit_trigger_caja();

-- ───── Migrar adelantos existentes a la caja + egresos de ejemplo ─────
do $$
begin
  if not exists (select 1 from public.movimientos_caja) then
    insert into public.movimientos_caja (tipo, monto, concepto, categoria, metodo, pedido_id, fecha)
    select 'ingreso', p.adelanto, 'Abono inicial pedido #' || p.numero,
           'pago_pedido', 'efectivo', p.id, p.fecha_entrega
    from public.pedidos p
    where p.adelanto > 0 and p.activo;

    insert into public.movimientos_caja (tipo, monto, concepto, categoria, metodo, fecha) values
      ('ingreso', 850,  'Venta directa en mostrador', 'venta_directa',   'efectivo',      current_date),
      ('egreso',  1200, 'Compra de harina y huevos',  'compra_insumos',  'efectivo',      current_date),
      ('egreso',  450,  'Gas para los hornos',        'gasto_operativo', 'transferencia', current_date);
  end if;
end $$;
