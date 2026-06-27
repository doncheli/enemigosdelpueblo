-- =============================================================================
-- Enemigos del Pueblo — Esquema inicial
-- Plataforma de denuncia ciudadana con moderación, trazabilidad de origen
-- y derecho de réplica.
--
-- Principio de seguridad: NADA es público hasta que un moderador lo publique.
-- El público anónimo solo puede LEER lo PUBLICADO y CREAR envíos en estado
-- PENDIENTE. Las actualizaciones/borrados quedan reservados al service_role.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Tipos (enums)
-- ---------------------------------------------------------------------------
create type tipo_delito      as enum ('CORRUPCIÓN', 'EXTORSIÓN', 'ABUSO DE AUTORIDAD', 'OTRO');
create type estado_revision  as enum ('PENDIENTE', 'EN_REVISION', 'PUBLICADA', 'RECHAZADA');
create type tipo_evidencia   as enum ('IMAGEN', 'VIDEO', 'AUDIO', 'DOCUMENTO');
-- Origen / procedencia de la denuncia. En contextos sin denuncia oficial,
-- se documenta de dónde proviene el señalamiento (testimonio, redes, prensa…).
create type origen_denuncia  as enum ('TESTIMONIO', 'REDES_SOCIALES', 'PRENSA', 'REGISTRO_OFICIAL', 'OTRO');

-- ---------------------------------------------------------------------------
-- Función utilitaria: mantener updated_at
-- ---------------------------------------------------------------------------
create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Acusados
-- ---------------------------------------------------------------------------
create table acusados (
  id                  uuid primary key default gen_random_uuid(),
  cedula              text,                       -- puede no existir
  cedula_prefix       text check (cedula_prefix in ('V', 'E', 'J')),
  nombres             text not null,
  apellidos           text not null,
  cargo               text,
  institucion         text,
  estado              text,
  municipio           text,
  foto_url            text,
  activo              boolean not null default true,
  estado_revision     estado_revision not null default 'PENDIENTE',
  denuncias_count     integer not null default 0, -- denuncias PUBLICADAS (mantenido por trigger)
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create unique index acusados_cedula_uniq on acusados (cedula) where cedula is not null;
create index acusados_estado_revision_idx on acusados (estado_revision);
create index acusados_estado_idx on acusados (estado);

create trigger acusados_set_updated_at
  before update on acusados
  for each row execute function set_updated_at();

-- ---------------------------------------------------------------------------
-- Denuncias
-- ---------------------------------------------------------------------------
create table denuncias (
  id              uuid primary key default gen_random_uuid(),
  codigo          text unique not null default 'ENP-' || to_char(now(), 'YYYY') || '-' ||
                     upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 4)),
  acusado_id      uuid not null references acusados (id) on delete cascade,
  tipo            tipo_delito not null,
  descripcion     text not null,
  origen          origen_denuncia not null default 'TESTIMONIO',
  fuente_url      text,                         -- enlace a la fuente si existe
  ocurrido_en     date,                         -- cuándo ocurrió el hecho
  ai_score        numeric(3, 2) check (ai_score >= 0 and ai_score <= 1),
  estado          estado_revision not null default 'PENDIENTE',
  moderado_en     timestamptz,
  moderado_por    uuid,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index denuncias_acusado_idx on denuncias (acusado_id);
create index denuncias_estado_idx on denuncias (estado);
create index denuncias_tipo_idx on denuncias (tipo);

create trigger denuncias_set_updated_at
  before update on denuncias
  for each row execute function set_updated_at();

-- ---------------------------------------------------------------------------
-- Evidencias (adjuntas a una denuncia)
-- ---------------------------------------------------------------------------
create table evidencias (
  id            uuid primary key default gen_random_uuid(),
  denuncia_id   uuid not null references denuncias (id) on delete cascade,
  tipo          tipo_evidencia not null,
  url           text,
  nombre        text,
  created_at    timestamptz not null default now()
);

create index evidencias_denuncia_idx on evidencias (denuncia_id);

-- ---------------------------------------------------------------------------
-- Réplicas (derecho de réplica del acusado)
-- El señalado —o su representante— puede responder. Pasa por moderación
-- igual que las denuncias, pero su publicación es un derecho prioritario.
-- ---------------------------------------------------------------------------
create table replicas (
  id            uuid primary key default gen_random_uuid(),
  acusado_id    uuid not null references acusados (id) on delete cascade,
  denuncia_id   uuid references denuncias (id) on delete set null, -- réplica puntual o general
  contenido     text not null,
  autor         text,                          -- quién responde
  contacto      text,                          -- contacto para verificación (no público)
  estado        estado_revision not null default 'PENDIENTE',
  moderado_en   timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index replicas_acusado_idx on replicas (acusado_id);
create index replicas_estado_idx on replicas (estado);

create trigger replicas_set_updated_at
  before update on replicas
  for each row execute function set_updated_at();

-- ---------------------------------------------------------------------------
-- Trigger: mantener acusados.denuncias_count = nº de denuncias PUBLICADAS
-- ---------------------------------------------------------------------------
create or replace function refresh_denuncias_count()
returns trigger
language plpgsql
as $$
declare
  target uuid := coalesce(new.acusado_id, old.acusado_id);
begin
  update acusados a
     set denuncias_count = (
       select count(*) from denuncias d
        where d.acusado_id = target and d.estado = 'PUBLICADA'
     )
   where a.id = target;
  return null;
end;
$$;

create trigger denuncias_count_sync
  after insert or update or delete on denuncias
  for each row execute function refresh_denuncias_count();

-- =============================================================================
-- Row Level Security
-- =============================================================================
alter table acusados   enable row level security;
alter table denuncias  enable row level security;
alter table evidencias enable row level security;
alter table replicas   enable row level security;

-- ---- LECTURA pública: solo contenido PUBLICADO ----------------------------
create policy "acusados_publicos_select"
  on acusados for select
  using (estado_revision = 'PUBLICADA');

create policy "denuncias_publicas_select"
  on denuncias for select
  using (estado = 'PUBLICADA');

create policy "evidencias_publicas_select"
  on evidencias for select
  using (exists (
    select 1 from denuncias d
     where d.id = evidencias.denuncia_id and d.estado = 'PUBLICADA'
  ));

create policy "replicas_publicas_select"
  on replicas for select
  using (estado = 'PUBLICADA');

-- ---- ENVÍOS anónimos: siempre entran en estado PENDIENTE ------------------
-- Un ciudadano puede registrar un acusado (queda PENDIENTE de revisión).
create policy "acusados_insert_pendiente"
  on acusados for insert
  with check (estado_revision = 'PENDIENTE');

-- Un ciudadano puede crear una denuncia (queda PENDIENTE de revisión).
create policy "denuncias_insert_pendiente"
  on denuncias for insert
  with check (estado = 'PENDIENTE');

-- Adjuntar evidencias a una denuncia aún PENDIENTE.
create policy "evidencias_insert_pendiente"
  on evidencias for insert
  with check (exists (
    select 1 from denuncias d
     where d.id = evidencias.denuncia_id and d.estado = 'PENDIENTE'
  ));

-- Derecho de réplica: el acusado puede enviar su respuesta (queda PENDIENTE).
create policy "replicas_insert_pendiente"
  on replicas for insert
  with check (estado = 'PENDIENTE');

-- Nota: no se otorgan políticas de UPDATE/DELETE a anon/authenticated.
-- La moderación (publicar, rechazar, editar) se hace con el service_role,
-- que omite RLS — desde un backend o panel de administración seguro.
