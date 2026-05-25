// ─── Parsing ──────────────────────────────────────────────────────────────────

export function parsearCSV(texto) {
  const lineas = texto.trim().split('\n').filter(l => l.trim())
  if (lineas.length < 2) return { cabeceras: [], filas: [] }
  const sep = lineas[0].includes('\t') ? '\t' : lineas[0].includes(';') ? ';' : ','
  const cabeceras = lineas[0].split(sep).map(h => h.trim().replace(/^"|"$/g, ''))
  const filas = lineas.slice(1).map(linea => {
    const valores = linea.split(sep).map(v => v.trim().replace(/^"|"$/g, ''))
    return cabeceras.reduce((obj, cab, i) => ({ ...obj, [cab]: valores[i] ?? '' }), {})
  })
  return { cabeceras, filas }
}

export async function parsearExcel(archivo) {
  const XLSX = await import('xlsx')
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const workbook = XLSX.read(e.target.result, { type: 'array' })
        const hoja = workbook.Sheets[workbook.SheetNames[0]]
        const datos = XLSX.utils.sheet_to_json(hoja, { header: 1 })
        const cabeceras = (datos[0] || []).map(h => String(h).trim())
        const filas = datos.slice(1)
          .filter(fila => fila.some(v => v !== null && v !== undefined && v !== ''))
          .map(fila =>
            cabeceras.reduce((obj, cab, i) => ({ ...obj, [cab]: String(fila[i] ?? '').trim() }), {})
          )
        resolve({ cabeceras, filas })
      } catch (err) {
        reject(err)
      }
    }
    reader.onerror = reject
    reader.readAsArrayBuffer(archivo)
  })
}

// ─── Campos y sinónimos ───────────────────────────────────────────────────────

export const CAMPOS_CLIENTE = [
  { id: 'nombre',          label: 'Nombre' },
  { id: 'apellidos',       label: 'Apellidos' },
  { id: 'dni',             label: 'NIF/NIE' },
  { id: 'telefono',        label: 'Teléfono' },
  { id: 'email',           label: 'Email' },
  { id: 'direccion',       label: 'Dirección' },
  { id: 'fechaNacimiento', label: 'Fecha de nacimiento' },
  { id: 'notas',           label: 'Notas' },
]

export const CAMPOS_EXPEDIENTE = [
  { id: 'ref',         label: 'Referencia/Nº expediente' },
  { id: 'tipo',        label: 'Tipo' },
  { id: 'cliente',     label: 'Cliente' },
  { id: 'estado',      label: 'Estado' },
  { id: 'fechaInicio', label: 'Fecha apertura' },
  { id: 'juzgado',     label: 'Juzgado' },
  { id: 'descripcion', label: 'Descripción' },
]

const SINONIMOS_CLIENTE = {
  nombre:          ['nombre', 'name', 'first name', 'nombre completo', 'nombres'],
  apellidos:       ['apellidos', 'apellido', 'surname', 'last name', 'primer apellido'],
  dni:             ['dni', 'nif', 'nie', 'documento', 'cif', 'identificacion', 'id'],
  telefono:        ['telefono', 'teléfono', 'tel', 'phone', 'movil', 'móvil', 'celular', 'tlf'],
  email:           ['email', 'correo', 'mail', 'e-mail', 'correo electronico', 'correo electrónico'],
  direccion:       ['direccion', 'dirección', 'address', 'domicilio', 'calle'],
  fechaNacimiento: ['fecha nacimiento', 'fecha de nacimiento', 'birth date', 'nacimiento', 'f. nacimiento'],
  notas:           ['notas', 'nota', 'observaciones', 'comentarios', 'notes', 'observación'],
}

const SINONIMOS_EXPEDIENTE = {
  ref:         ['ref', 'referencia', 'numero', 'número', 'expediente', 'exp', 'n. expediente', 'nº'],
  tipo:        ['tipo', 'type', 'clase', 'modalidad', 'materia'],
  cliente:     ['cliente', 'client', 'nombre cliente', 'demandante', 'interesado'],
  estado:      ['estado', 'status', 'situacion', 'situación', 'fase'],
  fechaInicio: ['fecha', 'fecha inicio', 'fecha apertura', 'apertura', 'fecha de apertura', 'inicio'],
  juzgado:     ['juzgado', 'tribunal', 'court', 'organo', 'órgano judicial'],
  descripcion: ['descripcion', 'descripción', 'description', 'detalle', 'asunto', 'objeto'],
}

function normalizar(str) {
  return String(str).toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .trim()
}

export function detectarMapeoAutomatico(cabeceras, tipo = 'cliente') {
  const sinonimos = tipo === 'cliente' ? SINONIMOS_CLIENTE : SINONIMOS_EXPEDIENTE
  const mapeo = {}
  cabeceras.forEach(cab => {
    const norm = normalizar(cab)
    for (const [campo, syns] of Object.entries(sinonimos)) {
      if (syns.some(s => normalizar(s) === norm || norm.includes(normalizar(s)))) {
        mapeo[cab] = campo
        break
      }
    }
    if (!mapeo[cab]) mapeo[cab] = ''
  })
  return mapeo
}

// ─── Validación ───────────────────────────────────────────────────────────────

export function validarCliente(fila, mapeo) {
  const errores = []
  const colNombre = Object.keys(mapeo).find(k => mapeo[k] === 'nombre')
  const nombre = colNombre ? fila[colNombre] : ''
  if (!nombre?.trim()) errores.push('Nombre obligatorio')
  return errores
}

export function validarExpediente(fila, mapeo) {
  const errores = []
  const colRef     = Object.keys(mapeo).find(k => mapeo[k] === 'ref')
  const colCliente = Object.keys(mapeo).find(k => mapeo[k] === 'cliente')
  if (!colRef || !fila[colRef]?.trim())     errores.push('Referencia obligatoria')
  if (!colCliente || !fila[colCliente]?.trim()) errores.push('Cliente obligatorio')
  return errores
}

export function mapearFila(fila, mapeo) {
  const resultado = {}
  for (const [col, campo] of Object.entries(mapeo)) {
    if (campo && fila[col] !== undefined) {
      resultado[campo] = fila[col]
    }
  }
  return resultado
}

// ─── Plantillas CSV ───────────────────────────────────────────────────────────

export function descargarPlantillaClientes() {
  const contenido = [
    'Nombre,Apellidos,NIF/NIE,Teléfono,Email,Dirección,Fecha Nacimiento,Notas',
    'María,García López,12345678A,612345678,maria@email.com,"Calle Mayor 1, Madrid",1985-03-15,Cliente preferente',
    'Juan,Rodríguez Pérez,87654321B,699123456,juan@email.com,"Av. Principal 5, Sevilla",1978-07-22,',
  ].join('\n')
  descargarBlob(contenido, 'plantilla_clientes_vincla.csv')
}

export function descargarPlantillaExpedientes() {
  const contenido = [
    'Referencia,Tipo,Cliente,Estado,Fecha Apertura,Juzgado,Descripción',
    'EXP-2025-001,Divorcio Contencioso,María García López,activo,2025-01-15,"Juzgado nº1 Madrid",Divorcio con custodia de menor',
    'EXP-2025-002,Modificación de Medidas,Juan Rodríguez,activo,2025-03-10,"Juzgado nº3 Sevilla",Cambio régimen de visitas',
  ].join('\n')
  descargarBlob(contenido, 'plantilla_expedientes_vincla.csv')
}

function descargarBlob(contenido, nombre) {
  const blob = new Blob(['﻿' + contenido], { type: 'text/csv;charset=utf-8;' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = nombre
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
