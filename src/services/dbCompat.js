// PGRST204 = el payload incluye una columna que no existe en la tabla.
// Si la base de datos de producción aún no tiene aplicada MIGRACION-PENDIENTE.sql,
// reintentamos la operación quitando esa columna para que crear/editar
// no quede bloqueado por completo (el dato de esa columna se descarta).
export async function ejecutarSinColumnasInexistentes(operacion, payload) {
  let datos = { ...payload }
  for (let intento = 0; intento < 6; intento++) {
    const { data, error } = await operacion(datos)
    if (!error) return { data, error: null }
    const esColumnaInexistente = error.code === 'PGRST204' || /column .* schema cache/i.test(error.message || '')
    const columna = esColumnaInexistente ? error.message?.match(/'([^']+)' column/)?.[1] : null
    if (!columna || !(columna in datos)) return { data: null, error }
    delete datos[columna]
  }
  return { data: null, error: { message: 'No se pudo completar la operación tras varios intentos.' } }
}
