-- =============================================================================
-- Endurecimiento de privacidad
-- 1) El contacto de una réplica (dato del acusado para verificación) NO debe
--    ser legible por el público anónimo. Solo moderadores (authenticated).
-- 2) Documentación: las tablas NO almacenan ningún dato del denunciante.
--    La anonimización de evidencias (EXIF/nombres) se hace en el cliente
--    antes de subir (ver src/lib/sanitize.ts).
-- =============================================================================

-- En Postgres, revocar una columna no basta si existe el grant a nivel tabla.
-- Se revoca el SELECT de tabla y se conceden columnas explícitas, sin `contacto`.
revoke select on replicas from anon;
grant select (
  id, acusado_id, denuncia_id, contenido, autor, estado, moderado_en, created_at, updated_at
) on replicas to anon;

-- (authenticated = moderadores en esta app; conservan acceso completo para verificar.)
