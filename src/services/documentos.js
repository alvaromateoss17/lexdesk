import { supabase } from '../lib/supabase'
import { formatDate, formatFileSize } from '../utils/format'

function normalize(row) {
  return {
    ...row,
    fecha:     formatDate(row.created_at),
    size:      formatFileSize(row.tamano),
    subidoPor: row.profiles?.nombre ?? 'Desconocido',
  }
}

export async function getDocumentos() {
  const { data, error } = await supabase
    .from('documentos')
    .select('*, profiles(nombre), expedientes(ref)')
    .order('created_at', { ascending: false })
  if (error) return { data: [], error }
  return { data: data.map(normalize), error: null }
}

export async function getDocumentosExpediente(expedienteId) {
  const { data, error } = await supabase
    .from('documentos')
    .select('*, profiles(nombre)')
    .eq('expediente_id', expedienteId)
    .order('created_at', { ascending: false })
  if (error) return { data: [], error }
  return { data: data.map(normalize), error: null }
}

export async function uploadDocumento({ file, expedienteId, despachoId, subidoPorId, tag }) {
  const ext  = file.name.split('.').pop().toLowerCase()
  const path = `${despachoId}/${expedienteId}/${Date.now()}_${file.name}`

  const { error: storageError } = await supabase.storage
    .from('documentos')
    .upload(path, file)
  if (storageError) return { data: null, error: storageError }

  const tamano = Math.round(file.size / 1024)

  const { data, error } = await supabase
    .from('documentos')
    .insert({
      despacho_id:   despachoId,
      expediente_id: expedienteId,
      subido_por:    subidoPorId,
      nombre:        file.name,
      tipo:          ext,
      tamano,
      storage_path:  path,
      tag:           tag ?? 'Documento',
    })
    .select('*, profiles(nombre)')
    .single()
  if (error) return { data: null, error }
  return { data: normalize(data), error: null }
}

export async function getDownloadUrl(storagePath) {
  const { data } = await supabase.storage
    .from('documentos')
    .createSignedUrl(storagePath, 60)
  return data?.signedUrl ?? null
}

export async function deleteDocumento(id, storagePath) {
  await supabase.storage.from('documentos').remove([storagePath])
  const { error } = await supabase.from('documentos').delete().eq('id', id)
  return { error }
}
