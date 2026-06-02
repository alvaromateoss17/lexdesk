-- =============================================================================
-- VINCLA — Migration 005: Función para crear/reparar despacho de usuario
-- SECURITY DEFINER permite ejecutarla saltando RLS para casos de setup inicial
-- o recuperación cuando el registro quedó a medias.
-- =============================================================================

CREATE OR REPLACE FUNCTION setup_user_despacho(p_despacho_nombre TEXT DEFAULT 'Mi Despacho')
RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  v_despacho_id UUID;
  v_user_id     UUID;
  v_user_email  TEXT;
  v_user_nombre TEXT;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'No hay sesión activa';
  END IF;

  -- Obtener datos del usuario de Auth
  SELECT
    email,
    COALESCE(raw_user_meta_data->>'nombre', split_part(email, '@', 1))
  INTO v_user_email, v_user_nombre
  FROM auth.users
  WHERE id = v_user_id;

  -- Crear despacho
  INSERT INTO despachos (nombre, plan, activo)
  VALUES (COALESCE(NULLIF(trim(p_despacho_nombre), ''), 'Mi Despacho'), 'esencial', true)
  RETURNING id INTO v_despacho_id;

  -- Crear o actualizar fila en usuarios vinculándola al despacho
  INSERT INTO usuarios (auth_user_id, despacho_id, nombre, email, rol, activo)
  VALUES (v_user_id, v_despacho_id, v_user_nombre, v_user_email, 'propietario', true)
  ON CONFLICT (auth_user_id)
    DO UPDATE SET despacho_id = v_despacho_id;

  RETURN jsonb_build_object('despacho_id', v_despacho_id, 'ok', true);
END;
$$;
