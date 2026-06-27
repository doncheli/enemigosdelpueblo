-- =============================================================================
-- Seguimiento público por código + Storage de evidencias
-- =============================================================================

-- ---------------------------------------------------------------------------
-- RPC: obtener_seguimiento(codigo)
-- Permite a cualquiera consultar el estado de SU denuncia con el código de
-- seguimiento, SIN exponer la tabla completa. El código actúa como capacidad:
-- solo devuelve la fila que coincide exactamente. SECURITY DEFINER omite RLS
-- pero el filtro por código limita el alcance a un único registro.
-- ---------------------------------------------------------------------------
create or replace function obtener_seguimiento(p_codigo text)
returns table (
  codigo              text,
  tipo                tipo_delito,
  estado              estado_revision,
  ai_score            numeric,
  created_at          timestamptz,
  updated_at          timestamptz,
  moderado_en         timestamptz,
  acusado_nombres     text,
  acusado_apellidos   text,
  acusado_cargo       text,
  acusado_institucion text,
  acusado_estado      text,
  acusado_foto_url    text
)
language sql
security definer
set search_path = public
as $$
  select d.codigo, d.tipo, d.estado, d.ai_score, d.created_at, d.updated_at, d.moderado_en,
         a.nombres, a.apellidos, a.cargo, a.institucion, a.estado, a.foto_url
  from denuncias d
  join acusados a on a.id = d.acusado_id
  where d.codigo = upper(trim(p_codigo))
  limit 1;
$$;

grant execute on function obtener_seguimiento(text) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Storage: bucket público de evidencias
-- Lectura pública (para mostrar las imágenes/archivos en las fichas) e
-- inserción anónima (el ciudadano sube su evidencia al denunciar).
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('evidencias', 'evidencias', true)
on conflict (id) do nothing;

create policy "evidencias_lectura_publica"
  on storage.objects for select
  using (bucket_id = 'evidencias');

create policy "evidencias_insert_anon"
  on storage.objects for insert
  to anon, authenticated
  with check (bucket_id = 'evidencias');
