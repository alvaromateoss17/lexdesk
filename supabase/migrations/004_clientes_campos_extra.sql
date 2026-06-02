-- =============================================================================
-- VINCLA — Migration 004: Campos extra para clientes
-- Campos que usa la UI pero no estaban en el schema inicial.
-- =============================================================================

ALTER TABLE clientes
  ADD COLUMN IF NOT EXISTS abogado_asignado    TEXT,
  ADD COLUMN IF NOT EXISTS etiquetas           TEXT[]   DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS telefono_secundario TEXT,
  ADD COLUMN IF NOT EXISTS nacionalidad        TEXT,
  ADD COLUMN IF NOT EXISTS profesion           TEXT,
  ADD COLUMN IF NOT EXISTS estado_civil        TEXT,
  ADD COLUMN IF NOT EXISTS color               TEXT;
