import { supabase } from '../lib/supabase'

// ============================================================
// documentosService — Documentos de expedientes en Supabase Storage
// Bucket privado 'documentos' + tabla 'documentos', aislados por
// despacho mediante RLS. La ruta del objeto en Storage empieza SIEMPRE
// por el despacho_id: de ese primer segmento depende el aislamiento.
// ============================================================

const BUCKET = 'documentos'
const TAMANO_MAXIMO = 50 * 1024 * 1024 // 50 MB

// Sanea el nombre del archivo: sin espacios ni caracteres raros,
// conservando la extensión. Evita colisiones y rutas inválidas en Storage.
function sanearNombre(nombre) {
  const base = (nombre || 'archivo')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // quita acentos
    .replace(/\s+/g, '_')
    .replace(/[^a-zA-Z0-9._-]/g, '')
    .replace(/_+/g, '_')
  return base || 'archivo'
}

// ─── SUBIR ───────────────────────────────────────────────────────────────────

export async function subirDocumento({ file, expedienteId, despachoId, usuarioId }) {
  if (!file) throw new Error('No se ha seleccionado ningún archivo.')
  if (!despachoId) throw new Error('No se pudo determinar el despacho. Recarga la página.')
  if (!expedienteId) throw new Error('No se pudo determinar el expediente.')
  if (file.size > TAMANO_MAXIMO) {
    throw new Error('El archivo supera el tamaño máximo permitido (50 MB).')
  }

  const nombreSaneado = sanearNombre(file.name)
  // El primer segmento DEBE ser el despachoId (aislamiento RLS).
  const ruta = `${despachoId}/${expedienteId}/${crypto.randomUUID()}-${nombreSaneado}`

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(ruta, file, { contentType: file.type || undefined, upsert: false })

  if (uploadError) {
    throw new Error('No se pudo subir el archivo: ' + uploadError.message)
  }

  const { data, error: insertError } = await supabase
    .from('documentos')
    .insert({
      despacho_id:    despachoId,
      expediente_id:  expedienteId,
      nombre:         file.name,
      nombre_archivo: nombreSaneado,
      url_storage:    ruta,
      tipo_mime:      file.type || null,
      tamano_bytes:   file.size,
      subido_por:     usuarioId ?? null,
    })
    .select()
    .single()

  if (insertError) {
    // Evitar huérfanos en Storage si falla el registro en la tabla.
    await supabase.storage.from(BUCKET).remove([ruta])
    throw new Error('No se pudo registrar el documento: ' + insertError.message)
  }

  return data
}

// ─── LISTAR ──────────────────────────────────────────────────────────────────

export async function listarDocumentos({ expedienteId }) {
  if (!expedienteId) return []
  // RLS ya filtra por despacho.
  const { data, error } = await supabase
    .from('documentos')
    .select('*')
    .eq('expediente_id', expedienteId)
    .order('created_at', { ascending: false })

  if (error) throw new Error('No se pudieron cargar los documentos: ' + error.message)
  return data || []
}

// ─── URL DE DESCARGA (bucket privado → URL firmada) ──────────────────────────

export async function obtenerUrlDescarga(doc) {
  if (!doc?.url_storage) throw new Error('El documento no tiene un archivo asociado.')

  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(doc.url_storage, 3600)

  if (error) throw new Error('No se pudo generar el enlace de descarga: ' + error.message)
  return data.signedUrl
}

// ─── ELIMINAR ────────────────────────────────────────────────────────────────

export async function eliminarDocumento(doc) {
  if (!doc?.id) throw new Error('Documento no válido.')

  if (doc.url_storage) {
    const { error: storageError } = await supabase.storage
      .from(BUCKET)
      .remove([doc.url_storage])
    if (storageError) {
      throw new Error('No se pudo eliminar el archivo: ' + storageError.message)
    }
  }

  const { error: deleteError } = await supabase
    .from('documentos')
    .delete()
    .eq('id', doc.id)

  if (deleteError) throw new Error('No se pudo eliminar el documento: ' + deleteError.message)
  return true
}
