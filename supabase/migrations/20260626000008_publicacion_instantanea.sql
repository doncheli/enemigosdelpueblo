-- =============================================================================
-- Publicación instantánea (moderación reactiva)
-- Las denuncias y su acusado se publican al crearse, para aparecer de
-- inmediato en mapa/catálogo/ficha. Los moderadores pueden QUITAR
-- (estado RECHAZADA) de forma reactiva desde el panel.
-- Se habilita Realtime en denuncias para que el mapa se actualice en vivo.
-- =============================================================================

create or replace function crear_denuncia(
  p_acusado     jsonb,
  p_tipo        tipo_delito,
  p_descripcion text,
  p_origen      origen_denuncia default 'TESTIMONIO',
  p_ocurrido_en date default null,
  p_evidencias  jsonb default '[]'::jsonb,
  p_lat         numeric default null,
  p_lng         numeric default null
)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_acusado_id  uuid;
  v_denuncia_id uuid;
  v_codigo      text;
  v_cedula      text := nullif(trim(p_acusado->>'cedula'), '');
  ev            jsonb;
begin
  if coalesce(trim(p_descripcion), '') = '' then
    raise exception 'La descripción es obligatoria';
  end if;
  if coalesce(trim(p_acusado->>'nombres'), '') = ''
     or coalesce(trim(p_acusado->>'apellidos'), '') = '' then
    raise exception 'Nombre y apellido del acusado son obligatorios';
  end if;

  if v_cedula is not null then
    select id into v_acusado_id from acusados where cedula = v_cedula limit 1;
  end if;

  if v_acusado_id is null then
    insert into acusados (
      cedula, cedula_prefix, nombres, apellidos, cargo,
      institucion, estado, municipio, estado_revision
    ) values (
      v_cedula,
      nullif(p_acusado->>'cedula_prefix', ''),
      trim(p_acusado->>'nombres'),
      trim(p_acusado->>'apellidos'),
      nullif(p_acusado->>'cargo', ''),
      nullif(p_acusado->>'institucion', ''),
      nullif(p_acusado->>'estado', ''),
      nullif(p_acusado->>'municipio', ''),
      'PUBLICADA'  -- publicación instantánea
    )
    returning id into v_acusado_id;
  else
    -- Asegura visibilidad del acusado existente
    update acusados set estado_revision = 'PUBLICADA'
     where id = v_acusado_id and estado_revision <> 'PUBLICADA';
  end if;

  insert into denuncias (acusado_id, tipo, descripcion, origen, ocurrido_en, lat, lng, estado)
  values (
    v_acusado_id, p_tipo, trim(p_descripcion), coalesce(p_origen, 'TESTIMONIO'),
    p_ocurrido_en, p_lat, p_lng, 'PUBLICADA'  -- publicación instantánea
  )
  returning id, codigo into v_denuncia_id, v_codigo;

  for ev in select * from jsonb_array_elements(coalesce(p_evidencias, '[]'::jsonb))
  loop
    insert into evidencias (denuncia_id, tipo, url, nombre)
    values (v_denuncia_id, (ev->>'tipo')::tipo_evidencia, nullif(ev->>'url', ''), nullif(ev->>'nombre', ''));
  end loop;

  return v_codigo;
end;
$$;

-- Realtime: el mapa recibe en vivo las denuncias publicadas (RLS aplica).
alter publication supabase_realtime add table denuncias;
