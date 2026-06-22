-- ════════════════════════════════════════════════════════════════
--  Tanda 3 · Clientes + Auditoría
--  RLS + FORCE, soft-delete, audit_log con triggers, datos semilla.
--  id uuid en clientes → listo para que pedidos.cliente_id apunte aquí
--  en la Tanda 4 sin rehacer nada.
-- ════════════════════════════════════════════════════════════════

create extension if not exists pgcrypto;

-- ───────────── audit_log ─────────────
create table if not exists public.audit_log (
  id          bigint generated always as identity primary key,
  table_name  text not null,
  record_id   uuid,
  action      text not null check (action in ('insert','update','delete','restore')),
  actor       uuid,
  actor_email text,
  changes     jsonb,
  created_at  timestamptz not null default now()
);

alter table public.audit_log enable row level security;
alter table public.audit_log force  row level security;

-- Autenticados pueden leer el log; escribir solo lo hace el trigger (definer).
drop policy if exists audit_log_select on public.audit_log;
create policy audit_log_select on public.audit_log
  for select to authenticated using (true);

-- ───────────── clientes ─────────────
create table if not exists public.clientes (
  id                 uuid primary key default gen_random_uuid(),
  nombre             text not null,
  cedula             text,
  telefono           text not null,
  correo             text,
  direccion          text,
  alergias           text[] not null default '{}',
  preferencias       text[] not null default '{}',
  fechas_importantes jsonb  not null default '[]'::jsonb,
  notas              text,
  activo             boolean not null default true,
  deleted_at         timestamptz,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),
  created_by         uuid default auth.uid(),
  updated_by         uuid default auth.uid()
);

create index if not exists clientes_activo_idx on public.clientes (activo);
create index if not exists clientes_nombre_idx on public.clientes (lower(nombre));

alter table public.clientes enable row level security;
alter table public.clientes force  row level security;

drop policy if exists clientes_select on public.clientes;
create policy clientes_select on public.clientes
  for select to authenticated using (true);

drop policy if exists clientes_insert on public.clientes;
create policy clientes_insert on public.clientes
  for insert to authenticated with check (true);

drop policy if exists clientes_update on public.clientes;
create policy clientes_update on public.clientes
  for update to authenticated using (true) with check (true);

-- Sin policy de DELETE → el borrado físico queda bloqueado por RLS.
-- "Borrar" = update activo=false (soft-delete).

-- ───────────── updated_at / updated_by automáticos ─────────────
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  new.updated_by := auth.uid();
  return new;
end; $$;

drop trigger if exists clientes_set_updated_at on public.clientes;
create trigger clientes_set_updated_at
  before update on public.clientes
  for each row execute function public.set_updated_at();

-- ───────────── Auditoría automática ─────────────
create or replace function public.audit_trigger()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_action    text;
  v_record_id uuid;
  v_changes   jsonb;
begin
  if (tg_op = 'INSERT') then
    v_action    := 'insert';
    v_record_id := new.id;
    v_changes   := to_jsonb(new);
  elsif (tg_op = 'UPDATE') then
    v_record_id := new.id;
    if    (new.activo = false and old.activo = true)  then v_action := 'delete';
    elsif (new.activo = true  and old.activo = false) then v_action := 'restore';
    else  v_action := 'update';
    end if;
    v_changes := jsonb_build_object('old', to_jsonb(old), 'new', to_jsonb(new));
  end if;

  insert into public.audit_log (table_name, record_id, action, actor, actor_email, changes)
  values (
    tg_table_name, v_record_id, v_action, auth.uid(),
    (select email from auth.users where id = auth.uid()),
    v_changes
  );
  return new;
end; $$;

drop trigger if exists clientes_audit on public.clientes;
create trigger clientes_audit
  after insert or update on public.clientes
  for each row execute function public.audit_trigger();

-- ───────────── Datos semilla (solo si la tabla está vacía) ─────────────
do $$
begin
  if not exists (select 1 from public.clientes) then
    insert into public.clientes
      (nombre, cedula, telefono, correo, direccion, alergias, preferencias, fechas_importantes, notas)
    values
      ('Yokasta Reyes','001-1234567-8','809-412-7785','yokasta.reyes@correo.com','Los Jardines Metropolitanos, Santiago',
        '{}','{"Tres leches","Vainilla"}','[{"tipo":"Cumpleaños","fecha":"1991-06-25"}]','Cliente frecuente. Pide siempre con flores rosadas.'),
      ('Ramón Polanco','002-7654321-0','829-330-1142','ramon.polanco@correo.com','C/ Duarte #45, Santiago',
        '{"Maní"}','{"Vainilla"}','[{"tipo":"Aniversario","fecha":"2015-09-12"}]','Prefiere retirar en tienda.'),
      ('Wendy Espinal',null,'849-208-9963','wendy.espinal@correo.com','Gurabo, Santiago',
        '{"Gluten"}','{"Chocolate"}','[{"tipo":"Cumpleaños","fecha":"1998-07-03"}]','Pide cupcakes para eventos de oficina.'),
      ('José Manuel Cruz','402-1122334-5','809-755-3021',null,'Av. Estrella Sadhalá, Santiago',
        '{}','{"Guayaba","Tres leches"}','[{"tipo":"Boda","fecha":"2026-07-18"}]','Pedido grande de boda en camino.'),
      ('Altagracia Jiménez',null,'829-661-4408',null,'Villa Olga, Santiago',
        '{"Lactosa"}','{"Vainilla"}','[]','Pide suspiros por docena.'),
      ('Francisco Medina','001-9988776-6','809-119-7754','f.medina@correo.com','Av. 27 de Febrero #112, Santo Domingo',
        '{}','{"Piña"}','[{"tipo":"Aniversario","fecha":"2010-02-14"}]','Sin dulce de leche.'),
      ('Carmen Lora',null,'849-540-2218','carmen.lora@correo.com','Bella Vista, Santo Domingo',
        '{}','{"Vainilla"}','[{"tipo":"Otro","fecha":"2026-06-28"}]','Pedida de mano: blanco con dorado.');
  end if;
end $$;
