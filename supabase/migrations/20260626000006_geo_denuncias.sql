-- =============================================================================
-- Geolocalización del HECHO denunciado (no del denunciante).
-- Coordenadas del lugar del matraqueo/extorsión para el mapa público.
-- =============================================================================
alter table denuncias add column lat numeric(9, 6);
alter table denuncias add column lng numeric(9, 6);

comment on column denuncias.lat is 'Latitud del lugar del hecho (no del denunciante)';
comment on column denuncias.lng is 'Longitud del lugar del hecho (no del denunciante)';
