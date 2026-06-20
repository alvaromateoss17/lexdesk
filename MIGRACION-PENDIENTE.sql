-- =============================================================================
-- VINCLA — MIGRACIÓN PENDIENTE (ejecutar manualmente en el SQL Editor de Supabase)
-- Fecha: 2026-06-11 (v2 — los bloques de la v1 ya están aplicados en producción)
-- URL: https://supabase.com/dashboard/project/yuykzrhujuinjhbiaarl/sql/new
-- Todos los bloques son idempotentes: se pueden re-ejecutar sin peligro.
--
-- La app funciona sin esta migración (descarta los campos que falten al
-- guardar), pero los datos nuevos NO se guardarán hasta ejecutarla.
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

-- Movimientos: convertir la tabla en la fuente ÚNICA de pagos/cobros, compartida
-- entre la ficha de cliente (pestaña Pagos) y Facturación. Un cobro es un
-- movimiento de tipo 'ingreso' con cliente, método y estado (cobrado/pendiente).
-- HASTA QUE ESTO SE EJECUTE, los pagos se guardan sin cliente/método/estado
-- (la app descarta esas columnas) y no se enlazan al cliente correctamente.
ALTER TABLE movimientos ADD COLUMN IF NOT EXISTS cliente_id UUID REFERENCES clientes(id) ON DELETE SET NULL;
ALTER TABLE movimientos ADD COLUMN IF NOT EXISTS metodo     TEXT;
ALTER TABLE movimientos ADD COLUMN IF NOT EXISTS estado     TEXT NOT NULL DEFAULT 'cobrado';
CREATE INDEX IF NOT EXISTS idx_movimientos_cliente_id ON movimientos(cliente_id);

-- =============================================================================
-- v3 (2026-06-20) — SEGURIDAD: cerrar fuga entre despachos en usuarios_insert
-- Ejecutar en el SQL Editor de Supabase. Idempotente (DROP IF EXISTS + CREATE).
-- El alta de cuentas pasa por setup_user_despacho() (SECURITY DEFINER), por lo que
-- la inserción directa de perfiles ya NO necesita la rama auth_user_id = auth.uid().
-- =============================================================================
DROP POLICY IF EXISTS "usuarios_insert" ON usuarios;
CREATE POLICY "usuarios_insert" ON usuarios
  FOR INSERT WITH CHECK (despacho_id = get_my_despacho_id());
