-- =============================================================================
-- VINCLA — Schema definitivo de base de datos
-- Arquitectura multi-tenant con Row Level Security
-- =============================================================================

-- Habilitar extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- Para búsqueda de texto

-- =============================================================================
-- TIPOS ENUMERADOS
-- =============================================================================

CREATE TYPE rol_usuario AS ENUM (
  'propietario',    -- Dueño del despacho, acceso total
  'abogado',        -- Abogado, acceso a sus expedientes
  'administrativo'  -- Gestión administrativa, sin expedientes sensibles
);

CREATE TYPE estado_expediente AS ENUM (
  'activo',
  'pendiente',
  'cerrado',
  'archivado'
);

CREATE TYPE tipo_expediente AS ENUM (
  'familia',
  'civil',
  'penal',
  'laboral',
  'mercantil',
  'administrativo',
  'contencioso',
  'otro'
);

CREATE TYPE estado_tarea AS ENUM (
  'pendiente',
  'completada',
  'pospuesta',
  'cancelada'
);

CREATE TYPE prioridad_tarea AS ENUM (
  'baja',
  'media',
  'alta',
  'urgente'
);

CREATE TYPE estado_factura AS ENUM (
  'borrador',
  'emitida',
  'pagada',
  'vencida',
  'cancelada'
);

CREATE TYPE tipo_movimiento AS ENUM (
  'ingreso',
  'gasto'
);

CREATE TYPE plan_despacho AS ENUM (
  'esencial',
  'despacho',
  'enterprise'
);

-- =============================================================================
-- FUNCIÓN PARA updated_at AUTOMÁTICO
-- =============================================================================

CREATE OR REPLACE FUNCTION actualizar_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- TABLA: despachos
-- El "tenant" principal. Cada despacho es una empresa cliente de Vincla.
-- =============================================================================

CREATE TABLE IF NOT EXISTS despachos (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre        TEXT NOT NULL,
  nif           TEXT,
  direccion     TEXT,
  ciudad        TEXT,
  codigo_postal TEXT,
  telefono      TEXT,
  email         TEXT,
  web           TEXT,
  logo_url      TEXT,
  plan          plan_despacho NOT NULL DEFAULT 'esencial',
  activo        BOOLEAN NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_despachos_updated_at
  BEFORE UPDATE ON despachos
  FOR EACH ROW EXECUTE FUNCTION actualizar_updated_at();

-- =============================================================================
-- TABLA: usuarios
-- Perfiles de abogados/administrativos. Vinculados a auth.users de Supabase.
-- UN usuario pertenece a UN despacho.
-- =============================================================================

CREATE TABLE IF NOT EXISTS usuarios (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id  UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  despacho_id   UUID REFERENCES despachos(id) ON DELETE CASCADE,
  nombre        TEXT NOT NULL,
  apellidos     TEXT,
  email         TEXT NOT NULL,
  telefono      TEXT,
  rol           rol_usuario NOT NULL DEFAULT 'abogado',
  activo        BOOLEAN NOT NULL DEFAULT true,
  avatar_url    TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_usuarios_updated_at
  BEFORE UPDATE ON usuarios
  FOR EACH ROW EXECUTE FUNCTION actualizar_updated_at();

CREATE INDEX IF NOT EXISTS idx_usuarios_auth_user_id ON usuarios(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_usuarios_despacho_id ON usuarios(despacho_id);

-- =============================================================================
-- TABLA: clientes
-- Clientes del despacho (las personas que contratan al abogado).
-- =============================================================================

CREATE TABLE IF NOT EXISTS clientes (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  despacho_id      UUID NOT NULL REFERENCES despachos(id) ON DELETE CASCADE,
  nombre           TEXT NOT NULL,
  apellidos        TEXT,
  email            TEXT,
  telefono         TEXT,
  dni              TEXT,
  direccion        TEXT,
  ciudad           TEXT,
  fecha_nacimiento DATE,
  notas            TEXT,
  activo           BOOLEAN NOT NULL DEFAULT true,
  portal_activo    BOOLEAN NOT NULL DEFAULT false,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_clientes_updated_at
  BEFORE UPDATE ON clientes
  FOR EACH ROW EXECUTE FUNCTION actualizar_updated_at();

CREATE INDEX IF NOT EXISTS idx_clientes_despacho_id ON clientes(despacho_id);
CREATE INDEX IF NOT EXISTS idx_clientes_nombre ON clientes USING gin(nombre gin_trgm_ops);

-- =============================================================================
-- TABLA: expedientes
-- Los casos/procedimientos legales. Núcleo de la aplicación.
-- =============================================================================

CREATE TABLE IF NOT EXISTS expedientes (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  despacho_id     UUID NOT NULL REFERENCES despachos(id) ON DELETE CASCADE,
  cliente_id      UUID REFERENCES clientes(id) ON DELETE SET NULL,
  abogado_id      UUID REFERENCES usuarios(id) ON DELETE SET NULL,
  numero          TEXT NOT NULL,
  titulo          TEXT,
  tipo            tipo_expediente NOT NULL DEFAULT 'otro',
  estado          estado_expediente NOT NULL DEFAULT 'activo',
  descripcion     TEXT,
  fecha_apertura  DATE NOT NULL DEFAULT CURRENT_DATE,
  fecha_cierre    DATE,
  proximo_plazo   DATE,
  juzgado         TEXT,
  numero_autos    TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(despacho_id, numero)
);

CREATE TRIGGER trg_expedientes_updated_at
  BEFORE UPDATE ON expedientes
  FOR EACH ROW EXECUTE FUNCTION actualizar_updated_at();

CREATE INDEX IF NOT EXISTS idx_expedientes_despacho_id ON expedientes(despacho_id);
CREATE INDEX IF NOT EXISTS idx_expedientes_cliente_id ON expedientes(cliente_id);
CREATE INDEX IF NOT EXISTS idx_expedientes_abogado_id ON expedientes(abogado_id);
CREATE INDEX IF NOT EXISTS idx_expedientes_estado ON expedientes(estado);
CREATE INDEX IF NOT EXISTS idx_expedientes_proximo_plazo ON expedientes(proximo_plazo);

-- =============================================================================
-- TABLA: tareas
-- Tareas y vencimientos procesales. Pueden estar asociadas a un expediente.
-- =============================================================================

CREATE TABLE IF NOT EXISTS tareas (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  despacho_id       UUID NOT NULL REFERENCES despachos(id) ON DELETE CASCADE,
  expediente_id     UUID REFERENCES expedientes(id) ON DELETE SET NULL,
  asignado_a        UUID REFERENCES usuarios(id) ON DELETE SET NULL,
  titulo            TEXT NOT NULL,
  descripcion       TEXT,
  estado            estado_tarea NOT NULL DEFAULT 'pendiente',
  prioridad         prioridad_tarea NOT NULL DEFAULT 'media',
  fecha_vencimiento DATE,
  completada_at     TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_tareas_updated_at
  BEFORE UPDATE ON tareas
  FOR EACH ROW EXECUTE FUNCTION actualizar_updated_at();

CREATE INDEX IF NOT EXISTS idx_tareas_despacho_id ON tareas(despacho_id);
CREATE INDEX IF NOT EXISTS idx_tareas_expediente_id ON tareas(expediente_id);
CREATE INDEX IF NOT EXISTS idx_tareas_asignado_a ON tareas(asignado_a);
CREATE INDEX IF NOT EXISTS idx_tareas_fecha_vencimiento ON tareas(fecha_vencimiento);
CREATE INDEX IF NOT EXISTS idx_tareas_estado ON tareas(estado);

-- =============================================================================
-- TABLA: facturas
-- Facturas emitidas por el despacho a sus clientes.
-- =============================================================================

CREATE TABLE IF NOT EXISTS facturas (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  despacho_id       UUID NOT NULL REFERENCES despachos(id) ON DELETE CASCADE,
  cliente_id        UUID REFERENCES clientes(id) ON DELETE SET NULL,
  serie             TEXT NOT NULL DEFAULT 'A',
  numero            INTEGER NOT NULL,
  estado            estado_factura NOT NULL DEFAULT 'borrador',
  fecha_emision     DATE NOT NULL DEFAULT CURRENT_DATE,
  fecha_vencimiento DATE,
  base_imponible    DECIMAL(10,2) NOT NULL DEFAULT 0,
  iva_porcentaje    DECIMAL(5,2) NOT NULL DEFAULT 21.00,
  iva_importe       DECIMAL(10,2) NOT NULL DEFAULT 0,
  irpf_porcentaje   DECIMAL(5,2) DEFAULT 0,
  irpf_importe      DECIMAL(10,2) DEFAULT 0,
  total             DECIMAL(10,2) NOT NULL DEFAULT 0,
  notas             TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(despacho_id, serie, numero)
);

CREATE TRIGGER trg_facturas_updated_at
  BEFORE UPDATE ON facturas
  FOR EACH ROW EXECUTE FUNCTION actualizar_updated_at();

CREATE INDEX IF NOT EXISTS idx_facturas_despacho_id ON facturas(despacho_id);
CREATE INDEX IF NOT EXISTS idx_facturas_cliente_id ON facturas(cliente_id);
CREATE INDEX IF NOT EXISTS idx_facturas_estado ON facturas(estado);
CREATE INDEX IF NOT EXISTS idx_facturas_fecha_emision ON facturas(fecha_emision);

-- =============================================================================
-- TABLA: lineas_factura
-- Líneas de detalle de cada factura.
-- =============================================================================

CREATE TABLE IF NOT EXISTS lineas_factura (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  factura_id       UUID NOT NULL REFERENCES facturas(id) ON DELETE CASCADE,
  descripcion      TEXT NOT NULL,
  cantidad         DECIMAL(10,2) NOT NULL DEFAULT 1,
  precio_unitario  DECIMAL(10,2) NOT NULL,
  importe          DECIMAL(10,2) GENERATED ALWAYS AS (cantidad * precio_unitario) STORED,
  orden            INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_lineas_factura_factura_id ON lineas_factura(factura_id);

-- =============================================================================
-- TABLA: movimientos
-- Registro de ingresos y gastos del despacho.
-- =============================================================================

CREATE TABLE IF NOT EXISTS movimientos (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  despacho_id  UUID NOT NULL REFERENCES despachos(id) ON DELETE CASCADE,
  factura_id   UUID REFERENCES facturas(id) ON DELETE SET NULL,
  tipo         tipo_movimiento NOT NULL,
  descripcion  TEXT NOT NULL,
  importe      DECIMAL(10,2) NOT NULL,
  fecha        DATE NOT NULL DEFAULT CURRENT_DATE,
  categoria    TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_movimientos_updated_at
  BEFORE UPDATE ON movimientos
  FOR EACH ROW EXECUTE FUNCTION actualizar_updated_at();

CREATE INDEX IF NOT EXISTS idx_movimientos_despacho_id ON movimientos(despacho_id);
CREATE INDEX IF NOT EXISTS idx_movimientos_fecha ON movimientos(fecha);
CREATE INDEX IF NOT EXISTS idx_movimientos_tipo ON movimientos(tipo);

-- =============================================================================
-- TABLA: documentos
-- Archivos adjuntos a expedientes. Se almacenan en Supabase Storage.
-- =============================================================================

CREATE TABLE IF NOT EXISTS documentos (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  despacho_id    UUID NOT NULL REFERENCES despachos(id) ON DELETE CASCADE,
  expediente_id  UUID REFERENCES expedientes(id) ON DELETE SET NULL,
  nombre         TEXT NOT NULL,
  nombre_archivo TEXT,
  url_storage    TEXT,
  tipo_mime      TEXT,
  tamano_bytes   INTEGER,
  subido_por     UUID REFERENCES usuarios(id) ON DELETE SET NULL,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_documentos_despacho_id ON documentos(despacho_id);
CREATE INDEX IF NOT EXISTS idx_documentos_expediente_id ON documentos(expediente_id);
