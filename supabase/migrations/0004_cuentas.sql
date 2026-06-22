-- ════════════════════════════════════════════════════════════════
--  Acceso temporal · tabla cuentas
--  RLS + FORCE: solo el rol admin (claim del JWT) ve/gestiona cuentas.
--  El rol y el vencimiento también viven en app_metadata del usuario
--  (claims del JWT) para que el middleware decida sin consultar la BD.
-- ════════════════════════════════════════════════════════════════

create table if not exists public.cuentas (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null unique references auth.users(id) on delete cascade,
  username    text not null unique,
  rol         text not null default 'cliente' check (rol in ('admin','cliente')),
  activo      boolean not null default true,
  expira_at   timestamptz,            -- NULL = sin vencimiento
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  created_by  uuid default auth.uid(),
  updated_by  uuid default auth.uid()
);

create index if not exists cuentas_user_idx on public.cuentas (user_id);

alter table public.cuentas enable row level security;
alter table public.cuentas force  row level security;

-- Solo admin (según el claim app_metadata.rol del JWT) puede leer/gestionar.
drop policy if exists cuentas_admin_all on public.cuentas;
create policy cuentas_admin_all on public.cuentas
  for all to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'rol') = 'admin')
  with check ((auth.jwt() -> 'app_metadata' ->> 'rol') = 'admin');

drop trigger if exists cuentas_set_updated_at on public.cuentas;
create trigger cuentas_set_updated_at before update on public.cuentas
  for each row execute function public.set_updated_at();

drop trigger if exists cuentas_audit on public.cuentas;
create trigger cuentas_audit after insert or update on public.cuentas
  for each row execute function public.audit_trigger();
