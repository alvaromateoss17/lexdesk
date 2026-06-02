-- =============================================================================
-- VINCLA — RLS seguro para re-ejecutar (DROP IF EXISTS + CREATE)
-- Ejecutar en Supabase SQL Editor
-- =============================================================================

-- Funciones helper
CREATE OR REPLACE FUNCTION get_my_despacho_id()
RETURNS UUID LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT despacho_id FROM usuarios WHERE auth_user_id = auth.uid() LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION es_propietario()
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM usuarios
    WHERE auth_user_id = auth.uid() AND rol = 'propietario' AND activo = true
  );
$$;

-- Habilitar RLS
ALTER TABLE despachos      ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios       ENABLE ROW LEVEL SECURITY;
ALTER TABLE clientes       ENABLE ROW LEVEL SECURITY;
ALTER TABLE expedientes    ENABLE ROW LEVEL SECURITY;
ALTER TABLE tareas         ENABLE ROW LEVEL SECURITY;
ALTER TABLE facturas       ENABLE ROW LEVEL SECURITY;
ALTER TABLE lineas_factura ENABLE ROW LEVEL SECURITY;
ALTER TABLE movimientos    ENABLE ROW LEVEL SECURITY;
ALTER TABLE documentos     ENABLE ROW LEVEL SECURITY;

-- Borrar políticas existentes (para re-ejecutar de forma segura)
DO $$ DECLARE r RECORD;
BEGIN
  FOR r IN SELECT policyname, tablename FROM pg_policies WHERE schemaname = 'public' LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I', r.policyname, r.tablename);
  END LOOP;
END $$;

-- despachos
CREATE POLICY "despacho_select" ON despachos FOR SELECT USING (id = get_my_despacho_id());
CREATE POLICY "despacho_update" ON despachos FOR UPDATE USING (id = get_my_despacho_id() AND es_propietario());
CREATE POLICY "despacho_insert" ON despachos FOR INSERT WITH CHECK (true);

-- usuarios
CREATE POLICY "usuarios_select" ON usuarios FOR SELECT USING (despacho_id = get_my_despacho_id());
CREATE POLICY "usuarios_insert" ON usuarios FOR INSERT WITH CHECK (
  despacho_id = get_my_despacho_id() OR auth_user_id = auth.uid()
);
CREATE POLICY "usuarios_update" ON usuarios FOR UPDATE USING (
  despacho_id = get_my_despacho_id() AND (auth_user_id = auth.uid() OR es_propietario())
);
CREATE POLICY "usuarios_delete" ON usuarios FOR DELETE USING (despacho_id = get_my_despacho_id() AND es_propietario());

-- clientes
CREATE POLICY "clientes_select" ON clientes FOR SELECT USING (despacho_id = get_my_despacho_id());
CREATE POLICY "clientes_insert" ON clientes FOR INSERT WITH CHECK (despacho_id = get_my_despacho_id());
CREATE POLICY "clientes_update" ON clientes FOR UPDATE USING (despacho_id = get_my_despacho_id());
CREATE POLICY "clientes_delete" ON clientes FOR DELETE USING (despacho_id = get_my_despacho_id());

-- expedientes
CREATE POLICY "expedientes_select" ON expedientes FOR SELECT USING (despacho_id = get_my_despacho_id());
CREATE POLICY "expedientes_insert" ON expedientes FOR INSERT WITH CHECK (despacho_id = get_my_despacho_id());
CREATE POLICY "expedientes_update" ON expedientes FOR UPDATE USING (despacho_id = get_my_despacho_id());
CREATE POLICY "expedientes_delete" ON expedientes FOR DELETE USING (despacho_id = get_my_despacho_id());

-- tareas
CREATE POLICY "tareas_select" ON tareas FOR SELECT USING (despacho_id = get_my_despacho_id());
CREATE POLICY "tareas_insert" ON tareas FOR INSERT WITH CHECK (despacho_id = get_my_despacho_id());
CREATE POLICY "tareas_update" ON tareas FOR UPDATE USING (despacho_id = get_my_despacho_id());
CREATE POLICY "tareas_delete" ON tareas FOR DELETE USING (despacho_id = get_my_despacho_id());

-- facturas
CREATE POLICY "facturas_select" ON facturas FOR SELECT USING (despacho_id = get_my_despacho_id());
CREATE POLICY "facturas_insert" ON facturas FOR INSERT WITH CHECK (despacho_id = get_my_despacho_id());
CREATE POLICY "facturas_update" ON facturas FOR UPDATE USING (despacho_id = get_my_despacho_id());
CREATE POLICY "facturas_delete" ON facturas FOR DELETE USING (despacho_id = get_my_despacho_id());

-- lineas_factura (sin despacho_id directo, se filtra por factura)
CREATE POLICY "lineas_select" ON lineas_factura FOR SELECT USING (
  EXISTS (SELECT 1 FROM facturas WHERE facturas.id = lineas_factura.factura_id AND facturas.despacho_id = get_my_despacho_id())
);
CREATE POLICY "lineas_insert" ON lineas_factura FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM facturas WHERE facturas.id = lineas_factura.factura_id AND facturas.despacho_id = get_my_despacho_id())
);
CREATE POLICY "lineas_update" ON lineas_factura FOR UPDATE USING (
  EXISTS (SELECT 1 FROM facturas WHERE facturas.id = lineas_factura.factura_id AND facturas.despacho_id = get_my_despacho_id())
);
CREATE POLICY "lineas_delete" ON lineas_factura FOR DELETE USING (
  EXISTS (SELECT 1 FROM facturas WHERE facturas.id = lineas_factura.factura_id AND facturas.despacho_id = get_my_despacho_id())
);

-- movimientos
CREATE POLICY "movimientos_select" ON movimientos FOR SELECT USING (despacho_id = get_my_despacho_id());
CREATE POLICY "movimientos_insert" ON movimientos FOR INSERT WITH CHECK (despacho_id = get_my_despacho_id());
CREATE POLICY "movimientos_update" ON movimientos FOR UPDATE USING (despacho_id = get_my_despacho_id());
CREATE POLICY "movimientos_delete" ON movimientos FOR DELETE USING (despacho_id = get_my_despacho_id());

-- documentos
CREATE POLICY "documentos_select" ON documentos FOR SELECT USING (despacho_id = get_my_despacho_id());
CREATE POLICY "documentos_insert" ON documentos FOR INSERT WITH CHECK (despacho_id = get_my_despacho_id());
CREATE POLICY "documentos_update" ON documentos FOR UPDATE USING (despacho_id = get_my_despacho_id());
CREATE POLICY "documentos_delete" ON documentos FOR DELETE USING (despacho_id = get_my_despacho_id());
