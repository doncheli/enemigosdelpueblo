-- =============================================================================
-- Nuevo tipo de evidencia: ENLACE (publicación de redes sociales)
-- Permite adjuntar un link (X, Instagram, TikTok, Facebook, YouTube…) como
-- evidencia, además de subir archivos.
-- =============================================================================
alter type tipo_evidencia add value if not exists 'ENLACE';
