-- ============================================================
-- LexDesk — Schema completo
-- Ejecutar en: Supabase Dashboard → SQL Editor
-- ============================================================

-- ── Tablas ──────────────────────────────────────────────────

-- Despachos (raíz multi-tenant)
CREATE TABLE despachos (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre      TEXT NOT NULL,
  plan        TEXT DEFAULT 'estudio' CHECK (plan IN ('estudio', 'profesional', 'empresa')),
  max_usuarios INTEGER DEFAULT 10,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Perfiles (extiende auth.users)
CREATE TABLE profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  despacho_id UUID REFERENCES despachos(id),
  nombre      TEXT NOT NULL DEFAULT '',
  email       TEXT NOT NULL DEFAULT '',
  rol         TEXT DEFAULT 'abogado' CHECK (rol IN ('admin', 'abogado', 'asistente')),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Clientes
CREATE TABLE clientes (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  despacho_id         UUID NOT NULL REFERENCES despachos(id) ON DELETE CASCADE,
  nombre              TEXT NOT NULL,
  email               TEXT,
  telefono            TEXT,
  cif                 TEXT,
  expedientes_activos INTEGER DEFAULT 0,
  fecha_alta          TIMESTAMPTZ DEFAULT NOW(),
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- Expedientes
CREATE TABLE expedientes (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  despacho_id   UUID NOT NULL REFERENCES despachos(id) ON DELETE CASCADE,
  cliente_id    UUID REFERENCES clientes(id),
  abogado_id    UUID REFERENCES profiles(id),
  ref           TEXT NOT NULL,
  tipo          TEXT NOT NULL CHECK (tipo IN ('Mercantil','Civil','Familia','Laboral','Penal','Concursal')),
  estado        TEXT DEFAULT 'Activo' CHECK (estado IN ('Activo','Urgente','Archivado')),
  juzgado       TEXT,
  descripcion   TEXT,
  cuantia       NUMERIC,
  procedimiento TEXT,
  fecha_inicio  DATE DEFAULT CURRENT_DATE,
  ult_mov       TIMESTAMPTZ DEFAULT NOW(),
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Documentos
CREATE TABLE documentos (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  despacho_id   UUID NOT NULL REFERENCES despachos(id) ON DELETE CASCADE,
  expediente_id UUID NOT NULL REFERENCES expedientes(id) ON DELETE CASCADE,
  subido_por    UUID REFERENCES profiles(id),
  nombre        TEXT NOT NULL,
  tipo          TEXT NOT NULL CHECK (tipo IN ('pdf','docx','xlsx')),
  tamano        INTEGER,
  storage_path  TEXT NOT NULL,
  tag           TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Plazos
CREATE TABLE plazos (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  despacho_id   UUID NOT NULL REFERENCES despachos(id) ON DELETE CASCADE,
  expediente_id UUID NOT NULL REFERENCES expedientes(id) ON DELETE CASCADE,
  tipo          TEXT NOT NULL,
  fecha         DATE NOT NULL,
  hora          TEXT,
  descripcion   TEXT,
  urgencia      TEXT DEFAULT 'Normal' CHECK (urgencia IN ('Normal','Próximo','Urgente')),
  completado    BOOLEAN DEFAULT FALSE,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Actividad
CREATE TABLE actividad (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  despacho_id   UUID NOT NULL REFERENCES despachos(id) ON DELETE CASCADE,
  usuario_id    UUID REFERENCES profiles(id),
  expediente_id UUID REFERENCES expedientes(id),
  icono         TEXT DEFAULT 'FileText',
  accion        TEXT NOT NULL,
  objeto        TEXT NOT NULL,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ── Funciones helper ────────────────────────────────────────

-- Devuelve el despacho_id del usuario actual
CREATE OR REPLACE FUNCTION get_despacho_id()
RETURNS UUID AS $$
  SELECT despacho_id FROM profiles WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Auto-genera la referencia del expediente
CREATE OR REPLACE FUNCTION generate_expediente_ref(p_despacho_id UUID)
RETURNS TEXT AS $$
DECLARE
  year_str TEXT := EXTRACT(YEAR FROM NOW())::TEXT;
  n        INTEGER;
BEGIN
  SELECT COUNT(*) + 1 INTO n
  FROM expedientes
  WHERE despacho_id = p_despacho_id
    AND EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM NOW());
  RETURN 'EXP-' || year_str || '-' || LPAD(n::TEXT, 3, '0');
END;
$$ LANGUAGE plpgsql;

-- ── Trigger: crear perfil al registrarse ────────────────────

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, nombre, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nombre', ''),
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ── Row Level Security ───────────────────────────────────────

ALTER TABLE despachos   ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles    ENABLE ROW LEVEL SECURITY;
ALTER TABLE clientes    ENABLE ROW LEVEL SECURITY;
ALTER TABLE expedientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE documentos  ENABLE ROW LEVEL SECURITY;
ALTER TABLE plazos      ENABLE ROW LEVEL SECURITY;
ALTER TABLE actividad   ENABLE ROW LEVEL SECURITY;

-- Despachos
CREATE POLICY "despachos_insert" ON despachos FOR INSERT
  TO authenticated WITH CHECK (true);

CREATE POLICY "despachos_select" ON despachos FOR SELECT
  USING (id = get_despacho_id());

CREATE POLICY "despachos_update" ON despachos FOR UPDATE
  USING (id = get_despacho_id());

-- Profiles
CREATE POLICY "profiles_select" ON profiles FOR SELECT
  USING (id = auth.uid() OR despacho_id = get_despacho_id());

CREATE POLICY "profiles_insert" ON profiles FOR INSERT
  WITH CHECK (id = auth.uid());

CREATE POLICY "profiles_update" ON profiles FOR UPDATE
  USING (id = auth.uid());

-- Macro para las tablas con despacho_id
CREATE POLICY "clientes_all" ON clientes FOR ALL
  USING (despacho_id = get_despacho_id())
  WITH CHECK (despacho_id = get_despacho_id());

CREATE POLICY "expedientes_all" ON expedientes FOR ALL
  USING (despacho_id = get_despacho_id())
  WITH CHECK (despacho_id = get_despacho_id());

CREATE POLICY "documentos_all" ON documentos FOR ALL
  USING (despacho_id = get_despacho_id())
  WITH CHECK (despacho_id = get_despacho_id());

CREATE POLICY "plazos_all" ON plazos FOR ALL
  USING (despacho_id = get_despacho_id())
  WITH CHECK (despacho_id = get_despacho_id());

CREATE POLICY "actividad_all" ON actividad FOR ALL
  USING (despacho_id = get_despacho_id())
  WITH CHECK (despacho_id = get_despacho_id());

-- ── Storage ─────────────────────────────────────────────────

INSERT INTO storage.buckets (id, name, public)
VALUES ('documentos', 'documentos', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "storage_select" ON storage.objects FOR SELECT
  USING (bucket_id = 'documentos' AND (storage.foldername(name))[1] = get_despacho_id()::TEXT);

CREATE POLICY "storage_insert" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'documentos' AND (storage.foldername(name))[1] = get_despacho_id()::TEXT);

CREATE POLICY "storage_delete" ON storage.objects FOR DELETE
  USING (bucket_id = 'documentos' AND (storage.foldername(name))[1] = get_despacho_id()::TEXT);
