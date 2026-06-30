-- =============================================================================
-- Storage: permitir a los moderadores gestionar la imagen principal (retratos)
-- El bucket "retratos" es público (lectura). Aquí se autoriza a los
-- moderadores autenticados a subir/actualizar/eliminar la foto del acusado.
-- =============================================================================
insert into storage.buckets (id, name, public)
values ('retratos', 'retratos', true)
on conflict (id) do nothing;

create policy "retratos_mod_insert"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'retratos' and es_moderador());

create policy "retratos_mod_update"
  on storage.objects for update to authenticated
  using (bucket_id = 'retratos' and es_moderador())
  with check (bucket_id = 'retratos' and es_moderador());

create policy "retratos_mod_delete"
  on storage.objects for delete to authenticated
  using (bucket_id = 'retratos' and es_moderador());
