create or replace function debug_storage_policies()
returns table(policyname text, cmd text, qual text, withcheck text)
language sql security definer set search_path = public, storage as $$
  select policyname::text, cmd::text, qual::text, with_check::text
  from pg_policies where schemaname='storage' and tablename='objects'
$$;
grant execute on function debug_storage_policies() to service_role;
