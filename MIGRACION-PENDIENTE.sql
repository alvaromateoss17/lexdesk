-- =============================================================================
-- VINCLA — MIGRACIÓN PENDIENTE (ejecutar manualmente en el SQL Editor de Supabase)
-- Fecha: 2026-06-11
-- Ejecutar ANTES de probar en producción los fixes de clientes/expedientes.
-- Todos los bloques son idempotentes: se pueden re-ejecutar sin peligro.
-- =============================================================================


-- =============================================================================
-- BLOQUE 1 — OBLIGATORIO: columna codigo_postal en clientes
-- El formulario "Nuevo cliente" envía codigo_postal en el INSERT, pero la
-- columna no existe en ninguna migración del repo. Si tampoco existe en
-- producción, TODOS los INSERT de clientes fallan con PGRST204
-- ("Could not find the 'codigo_postal' column"). Este era el motivo más
-- probable de que "Crear cliente" no hiciera nada.
-- =============================================================================

ALTER TABLE clientes ADD COLUMN IF NOT EXISTS codigo_postal TEXT;


-- =============================================================================
-- BLOQUE 2 — OBLIGATORIO (verificar primero): email de clientes debe ser nullable
-- Paso 1: comprobar el estado actual de la columna. Si is_nullable = 'YES',
-- el ALTER del paso 2 no es necesario (pero ejecutarlo no hace daño).
-- =============================================================================

-- Paso 1: verificación del estado actual
SELECT column_name, is_nullable, data_type
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'clientes' AND column_name = 'email';

-- Paso 2: hacer email nullable solo si todavía es NOT NULL (idempotente)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'clientes'
      AND column_name = 'email' AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE clientes ALTER COLUMN email DROP NOT NULL;
  END IF;
END $$;


-- =============================================================================
-- BLOQUE 3 — OBLIGATORIO (por si la migración 003 no se aplicó en producción):
-- columna contraparte en expedientes. El formulario de expedientes la envía
-- en INSERT y UPDATE; si falta, crear/editar expedientes falla siempre.
-- =============================================================================

ALTER TABLE expedientes ADD COLUMN IF NOT EXISTS contraparte TEXT;


-- =============================================================================
-- BLOQUE 4 — OPCIONAL: verificación de políticas RLS de clientes y expedientes
-- Las políticas del repo (002_rls.sql) son correctas. Ejecuta esta consulta
-- para confirmar que en producción existen las 4 políticas por tabla
-- (select/insert/update/delete) usando get_my_despacho_id().
-- =============================================================================

SELECT tablename, policyname, cmd, qual, with_check
FROM pg_policies
WHERE schemaname = 'public' AND tablename IN ('clientes', 'expedientes')
ORDER BY tablename, cmd;

-- =============================================================================
-- BLOQUE 5 — OPCIONAL: recrear las políticas RLS de clientes y expedientes
-- Ejecutar SOLO si la verificación del bloque 4 muestra políticas ausentes o
-- incorrectas. Sigue el patrón existente del proyecto con get_my_despacho_id().
-- =============================================================================

-- -- clientes: cada despacho solo opera sobre sus propios clientes
-- DROP POLICY IF EXISTS "clientes_select" ON clientes;
-- DROP POLICY IF EXISTS "clientes_insert" ON clientes;
-- DROP POLICY IF EXISTS "clientes_update" ON clientes;
-- DROP POLICY IF EXISTS "clientes_delete" ON clientes;
-- -- Lectura: solo filas del despacho del usuario autenticado
-- CREATE POLICY "clientes_select" ON clientes FOR SELECT USING (despacho_id = get_my_despacho_id());
-- -- Inserción: el payload debe llevar el despacho_id del usuario
-- CREATE POLICY "clientes_insert" ON clientes FOR INSERT WITH CHECK (despacho_id = get_my_despacho_id());
-- -- Actualización: solo filas del propio despacho
-- CREATE POLICY "clientes_update" ON clientes FOR UPDATE USING (despacho_id = get_my_despacho_id());
-- -- Borrado: solo filas del propio despacho
-- CREATE POLICY "clientes_delete" ON clientes FOR DELETE USING (despacho_id = get_my_despacho_id());

-- -- expedientes: mismo patrón multi-tenant
-- DROP POLICY IF EXISTS "expedientes_select" ON expedientes;
-- DROP POLICY IF EXISTS "expedientes_insert" ON expedientes;
-- DROP POLICY IF EXISTS "expedientes_update" ON expedientes;
-- DROP POLICY IF EXISTS "expedientes_delete" ON expedientes;
-- CREATE POLICY "expedientes_select" ON expedientes FOR SELECT USING (despacho_id = get_my_despacho_id());
-- CREATE POLICY "expedientes_insert" ON expedientes FOR INSERT WITH CHECK (despacho_id = get_my_despacho_id());
-- CREATE POLICY "expedientes_update" ON expedientes FOR UPDATE USING (despacho_id = get_my_despacho_id());
-- CREATE POLICY "expedientes_delete" ON expedientes FOR DELETE USING (despacho_id = get_my_despacho_id());
