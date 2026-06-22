-- ════════════ Endurecimiento de seguridad ════════════
-- 1) audit_log: solo admin puede leer (cierra fuga a clientes).
drop policy if exists audit_log_select on public.audit_log;
create policy audit_log_select on public.audit_log
  for select to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'rol') = 'admin');

-- 2) Storage de fotos PRIVADO (ya no público); lectura solo autenticados.
update storage.buckets set public = false where id = 'referencias';

drop policy if exists referencias_select on storage.objects;
create policy referencias_select on storage.objects
  for select to authenticated using (bucket_id = 'referencias');
