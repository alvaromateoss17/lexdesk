-- =============================================================================
-- MIGRACIÓN 006 — Campos de alta/baja (clientes) y datos procesales (expedientes)
-- Replica los campos de la app de gestión del despacho de referencia.
-- Todos los bloques son idempotentes.
-- =============================================================================

-- Clientes: fecha en la que el cliente entró en el despacho y fecha de baja.
-- Si fecha_alta es NULL, la app usa created_at como fecha de alta.
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS fecha_alta DATE;
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS fecha_baja DATE;

-- Expedientes: tipo de asunto (texto libre), procurador propio y NIG.
-- (fecha_apertura, fecha_cierre y el estado 'cerrado' ya existen desde 001.)
ALTER TABLE expedientes ADD COLUMN IF NOT EXISTS tipo_asunto TEXT;
ALTER TABLE expedientes ADD COLUMN IF NOT EXISTS procurador  TEXT;
ALTER TABLE expedientes ADD COLUMN IF NOT EXISTS nig         TEXT;
