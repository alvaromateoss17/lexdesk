-- =============================================================================
-- VINCLA — Función SECURITY DEFINER para setup inicial de despacho
-- Bypasea RLS completamente. Ejecutar en Supabase SQL Editor.
-- =============================================================================

-- Garantizar permisos al rol authenticated sobre todas las tablas públicas
GRANT USAGE ON SCHEMA public TO authenticated, anon;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated, anon;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated, anon;

-- Función robusta: crea despacho + perfil, o repara cuentas con despacho borrado
CREATE OR REPLACE FUNCTION setup_user_despacho(p_despacho_nombre TEXT DEFAULT 'Mi Despacho')
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid         UUID;
  v_despacho_id UUID;
  v_nombre      TEXT;
  v_email       TEXT;
BEGIN
  v_uid := auth.uid();
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Sin sesión activa';
  END IF;

  -- Datos del usuario desde auth.users (nombre viene de user_metadata del signUp)
  SELECT
    COALESCE(raw_user_meta_data->>'nombre', split_part(email, '@', 1)),
    email
  INTO v_nombre, v_email
  FROM auth.users
  WHERE id = v_uid;

  -- Verificar si el usuario ya tiene un despacho VÁLIDO (INNER JOIN para descartar borrados)
  SELECT u.despacho_id INTO v_despacho_id
  FROM usuarios u
  INNER JOIN despachos d ON d.id = u.despacho_id
  WHERE u.auth_user_id = v_uid
  LIMIT 1;

  IF v_despacho_id IS NOT NULL THEN
    RETURN jsonb_build_object('despacho_id', v_despacho_id, 'status', 'existing');
  END IF;

  -- Crear despacho nuevo
  INSERT INTO despachos (nombre, plan, activo)
  VALUES (COALESCE(NULLIF(trim(p_despacho_nombre), ''), 'Mi Despacho'), 'esencial', true)
  RETURNING id INTO v_despacho_id;

  -- Crear o reparar perfil del usuario
  INSERT INTO usuarios (auth_user_id, despacho_id, nombre, email, rol, activo)
  VALUES (v_uid, v_despacho_id, v_nombre, v_email, 'propietario', true)
  ON CONFLICT (auth_user_id) DO UPDATE
    SET despacho_id = v_despacho_id,
        activo      = true,
        nombre      = COALESCE(EXCLUDED.nombre, usuarios.nombre);

  RETURN jsonb_build_object('despacho_id', v_despacho_id, 'status', 'created');
END;
$$;
