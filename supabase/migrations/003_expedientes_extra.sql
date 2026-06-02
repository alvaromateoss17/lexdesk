-- =============================================================================
-- VINCLA — Migration 003: Campo contraparte en expedientes
-- El campo contraparte no estaba en el schema inicial pero lo usa la UI.
-- =============================================================================

ALTER TABLE expedientes ADD COLUMN IF NOT EXISTS contraparte TEXT;
