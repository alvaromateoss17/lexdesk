// ============================================================
// storageService — Fuente de datos única basada en localStorage
// Reemplaza las llamadas a Supabase para clientes, expedientes
// y documentos. La autenticación sigue en Supabase (AuthContext).
// ============================================================

const KEYS = {
  clientes:    'vincla_clientes',
  expedientes: 'vincla_expedientes',
  documentos:  'vincla_documentos',
}

function readAll(entidad) {
  try {
    return JSON.parse(localStorage.getItem(KEYS[entidad]) || '[]')
  } catch {
    return []
  }
}

function writeAll(entidad, lista) {
  localStorage.setItem(KEYS[entidad], JSON.stringify(lista))
}

export const storageService = {
  // ── Leer ────────────────────────────────────────────────────
  getAll(entidad) {
    return readAll(entidad)
  },

  getById(entidad, id) {
    const lista = readAll(entidad)
    return lista.find(item => String(item.id) === String(id)) ?? null
  },

  // ── Crear ───────────────────────────────────────────────────
  create(entidad, datos) {
    const nuevo = { ...datos, id: Date.now(), creadoEn: new Date().toISOString() }
    const lista = readAll(entidad)
    writeAll(entidad, [...lista, nuevo])
    return nuevo
  },

  // ── Actualizar ──────────────────────────────────────────────
  update(entidad, id, datos) {
    const lista = readAll(entidad)
    const actualizada = lista.map(item =>
      String(item.id) === String(id)
        ? { ...item, ...datos, actualizadoEn: new Date().toISOString() }
        : item
    )
    writeAll(entidad, actualizada)
    return actualizada.find(item => String(item.id) === String(id)) ?? null
  },

  // ── Eliminar ─────────────────────────────────────────────────
  delete(entidad, id) {
    const lista = readAll(entidad)
    writeAll(entidad, lista.filter(item => String(item.id) !== String(id)))
  },
}
