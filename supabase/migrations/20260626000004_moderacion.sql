-- =============================================================================
-- Moderación: allowlist de moderadores + RLS para revisar/publicar
-- La autorización vive en la base de datos: solo quienes estén en `moderadores`
-- pueden ver contenido no publicado y cambiar su estado. Defensa en profundidad
-- (no depende solo del front).
-- =============================================================================

create table moderadores (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  email      text,
  created_at timestamptz not null default now()
);

alter table moderadores enable row level security;

-- ¿El usuario autenticado es moderador? SECURITY DEFINER evita recursión de RLS.
create or replace function es_moderador()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (select 1 from moderadores where user_id = auth.uid());
$$;

grant execute on function es_moderador() to authenticated;

-- Un moderador puede ver la lista de moderadores
create policy "moderadores_select" on moderadores
  for select using (es_moderador());

-- ---------------------------------------------------------------------------
-- Políticas de moderador (se SUMAN a las públicas existentes, que son OR):
-- ver cualquier estado + actualizar estado de revisión.
-- ---------------------------------------------------------------------------
create policy "acusados_mod_select" on acusados for select using (es_moderador());
create policy "acusados_mod_update" on acusados for update using (es_moderador()) with check (es_moderador());

create policy "denuncias_mod_select" on denuncias for select using (es_moderador());
create policy "denuncias_mod_update" on denuncias for update using (es_moderador()) with check (es_moderador());

create policy "evidencias_mod_select" on evidencias for select using (es_moderador());

create policy "replicas_mod_select" on replicas for select using (es_moderador());
create policy "replicas_mod_update" on replicas for update using (es_moderador()) with check (es_moderador());
