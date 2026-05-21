// ============================================================
// EXPEDIENTES DE FAMILIA
// ============================================================
export const expedientesFamilia = [
  {
    id: 101,
    ref: "EXP-2025-FAM-001",
    cliente: "Laura Sánchez Moreno",
    clienteId: 1,
    contraparte: "Pedro Martínez Ruiz",
    tipo: "Divorcio Contencioso",
    subTipo: "divorcio",
    abogado: "Ana López",
    estado: "activo",
    prioridad: "alta",
    fechaInicio: "2025-02-10",
    ultimoMov: "2025-05-19",
    juzgado: "Juzgado de Primera Instancia nº5 (Familia) Madrid",
    descripcion: "Divorcio contencioso. Dos hijos menores: Sofía (7) y Lucas (4). Régimen de custodia en disputa. Vivienda familiar valorada en 320.000€.",
    hijos: [
      { nombre: "Sofía Martínez Sánchez", edad: 7, fechaNacimiento: "2018-03-15" },
      { nombre: "Lucas Martínez Sánchez", edad: 4, fechaNacimiento: "2021-07-22" },
    ],
    pensionAlimentos: { importe: 650, periodicidad: "mensual", beneficiario: "ambos hijos", pagador: "Pedro Martínez" },
    pensionCompensatoria: { solicitada: true, importe: 800, duracion: "3 años", estado: "pendiente sentencia" },
    bienes: [
      { tipo: "Inmueble", descripcion: "Vivienda familiar C/ Alcalá 45, Madrid", valor: 320000, estado: "pendiente adjudicación" },
      { tipo: "Vehículo", descripcion: "Seat León 2020", valor: 18000, estado: "pendiente adjudicación" },
      { tipo: "Cuenta bancaria", descripcion: "Cuenta conjunta BBVA", saldo: 12400, estado: "bloqueada judicialmente" },
    ],
    faseProcedimiento: "Vista oral",
    proximaActuacion: "2025-06-02",
    plazosCriticos: [
      { descripcion: "Entrega informe pericial psicológico", fecha: "2025-05-28", urgente: true },
      { descripcion: "Vista oral principal", fecha: "2025-06-02", urgente: true },
      { descripcion: "Trámite de alegaciones", fecha: "2025-06-20", urgente: false },
    ],
  },
  {
    id: 102,
    ref: "EXP-2025-FAM-002",
    cliente: "Roberto Iglesias Vega",
    clienteId: 2,
    contraparte: "Carmen Díaz Flores",
    tipo: "Divorcio de Mutuo Acuerdo",
    subTipo: "divorcio_mutuo",
    abogado: "Carlos Mendoza",
    estado: "activo",
    prioridad: "media",
    fechaInicio: "2025-03-05",
    ultimoMov: "2025-05-17",
    juzgado: "Juzgado de Primera Instancia nº2 (Familia) Madrid",
    descripcion: "Divorcio de mutuo acuerdo. Sin hijos. Liquidación de gananciales pendiente. Convenio regulador en negociación.",
    hijos: [],
    pensionAlimentos: null,
    pensionCompensatoria: { solicitada: false },
    bienes: [
      { tipo: "Inmueble", descripcion: "Piso C/ Serrano 12, Madrid", valor: 410000, estado: "a adjudicar a Carmen" },
      { tipo: "Vehículo", descripcion: "BMW Serie 3 2022", valor: 32000, estado: "a adjudicar a Roberto" },
    ],
    faseProcedimiento: "Negociación convenio",
    proximaActuacion: "2025-05-30",
    plazosCriticos: [
      { descripcion: "Firma convenio regulador borrador", fecha: "2025-05-30", urgente: false },
      { descripcion: "Ratificación ante el juzgado", fecha: "2025-06-15", urgente: false },
    ],
  },
  {
    id: 103,
    ref: "EXP-2025-FAM-003",
    cliente: "Isabel Torres Medina",
    clienteId: 3,
    contraparte: "Javier Torres (ex cónyuge)",
    tipo: "Modificación de Medidas",
    subTipo: "modificacion_medidas",
    abogado: "Ana López",
    estado: "activo",
    prioridad: "urgente",
    fechaInicio: "2025-04-01",
    ultimoMov: "2025-05-20",
    juzgado: "Juzgado de Primera Instancia nº5 (Familia) Madrid",
    descripcion: "Solicitud de modificación de custodia. Se solicita cambio de custodia compartida a custodia exclusiva por cambio de circunstancias: traslado laboral del padre a Barcelona.",
    hijos: [
      { nombre: "Mateo Torres", edad: 9, fechaNacimiento: "2016-05-10" },
    ],
    pensionAlimentos: { importe: 500, periodicidad: "mensual", beneficiario: "Mateo Torres", pagador: "Javier Torres" },
    pensionCompensatoria: { solicitada: false },
    bienes: [],
    faseProcedimiento: "Demanda presentada",
    proximaActuacion: "2025-05-27",
    plazosCriticos: [
      { descripcion: "Contestación a la demanda", fecha: "2025-05-27", urgente: true },
      { descripcion: "Exploración del menor", fecha: "2025-06-10", urgente: false },
    ],
  },
  {
    id: 104,
    ref: "EXP-2025-FAM-004",
    cliente: "Familia Herrero García",
    clienteId: 4,
    contraparte: null,
    tipo: "Adopción Nacional",
    subTipo: "adopcion",
    abogado: "Carlos Mendoza",
    estado: "activo",
    prioridad: "media",
    fechaInicio: "2025-01-20",
    ultimoMov: "2025-05-12",
    juzgado: "Dirección General de Familia CAM",
    descripcion: "Tramitación de adopción nacional. Idoneidad ya concedida. En espera de asignación de menor.",
    hijos: [],
    pensionAlimentos: null,
    pensionCompensatoria: null,
    bienes: [],
    faseProcedimiento: "Espera de asignación",
    proximaActuacion: "2025-07-01",
    plazosCriticos: [
      { descripcion: "Revisión informe psicosocial", fecha: "2025-07-01", urgente: false },
    ],
  },
  {
    id: 105,
    ref: "EXP-2025-FAM-005",
    cliente: "Marta Fernández López",
    clienteId: 5,
    contraparte: "Ministerio Fiscal",
    tipo: "Violencia de Género",
    subTipo: "violencia_genero",
    abogado: "Ana López",
    estado: "activo",
    prioridad: "urgente",
    fechaInicio: "2025-05-15",
    ultimoMov: "2025-05-20",
    juzgado: "Juzgado de Violencia sobre la Mujer nº1 Madrid",
    descripcion: "Víctima de violencia de género. Orden de alejamiento vigente. Medidas cautelares activas. Proceso penal en curso.",
    hijos: [
      { nombre: "Alba Rodríguez Fernández", edad: 5, fechaNacimiento: "2020-02-14" },
    ],
    pensionAlimentos: { importe: 400, periodicidad: "mensual", beneficiario: "Alba", pagador: "Alejandro Rodríguez" },
    pensionCompensatoria: null,
    bienes: [],
    faseProcedimiento: "Medidas cautelares activas",
    proximaActuacion: "2025-05-26",
    plazosCriticos: [
      { descripcion: "Renovación orden de alejamiento", fecha: "2025-05-26", urgente: true },
      { descripcion: "Juicio oral penal", fecha: "2025-06-05", urgente: true },
    ],
  },
]

// ============================================================
// TIPOS DE EXPEDIENTE DE FAMILIA
// ============================================================
export const tiposFamilia = [
  { valor: "divorcio",             label: "Divorcio Contencioso" },
  { valor: "divorcio_mutuo",       label: "Divorcio Mutuo Acuerdo" },
  { valor: "separacion",           label: "Separación" },
  { valor: "modificacion_medidas", label: "Modificación de Medidas" },
  { valor: "custodia",             label: "Guarda y Custodia" },
  { valor: "pension_alimentos",    label: "Pensión de Alimentos" },
  { valor: "violencia_genero",     label: "Violencia de Género" },
  { valor: "adopcion",             label: "Adopción" },
  { valor: "herencia_familia",     label: "Herencia Familiar" },
  { valor: "incapacitacion",       label: "Incapacitación / Tutela" },
  { valor: "filiacion",            label: "Filiación / Paternidad" },
  { valor: "mediacion",            label: "Mediación Familiar" },
]

// ============================================================
// PLANTILLAS DE DOCUMENTOS DE FAMILIA
// ============================================================
export const plantillasFamilia = [
  { id: 1, nombre: "Demanda de Divorcio Contencioso",         tipo: "demanda",           categoria: "divorcio" },
  { id: 2, nombre: "Convenio Regulador — Divorcio Mutuo",     tipo: "convenio",          categoria: "divorcio_mutuo" },
  { id: 3, nombre: "Demanda de Modificación de Medidas",      tipo: "demanda",           categoria: "modificacion_medidas" },
  { id: 4, nombre: "Solicitud de Orden de Alejamiento",       tipo: "solicitud_cautelar", categoria: "violencia_genero" },
  { id: 5, nombre: "Escrito de Conclusiones — Custodia",      tipo: "escrito",           categoria: "custodia" },
]

// ============================================================
// SESIONES DE MEDIACIÓN
// ============================================================
export const sesionesMediacion = [
  {
    id: 1,
    expedienteRef: "EXP-2025-FAM-002",
    cliente: "Roberto Iglesias Vega",
    contraparte: "Carmen Díaz Flores",
    mediador: "Carmen Ruiz (Mediadora certificada)",
    estado: "en_curso",
    fechaInicio: "2025-04-10",
    sesiones: [
      { numero: 1, fecha: "2025-04-10", duracion: "90 min", resumen: "Presentación del proceso. Establecimiento de reglas. Identificación de puntos de conflicto: vivienda y vehículo.", acuerdos: [] },
      { numero: 2, fecha: "2025-04-24", duracion: "90 min", resumen: "Propuestas sobre adjudicación de vivienda. Roberto propone compensación económica.", acuerdos: ["Carmen se queda la vivienda con compensación a Roberto"] },
      { numero: 3, fecha: "2025-05-08", duracion: "60 min", resumen: "Acuerdo sobre vehículo cerrado. Pendiente valoración definitiva de la vivienda.", acuerdos: ["Roberto se queda el BMW valorado en 32.000€"] },
    ],
    proximaSesion: "2025-05-29",
    acuerdosAlcanzados: 2,
    puntosAbiertos: ["Valoración definitiva vivienda", "Liquidación cuenta conjunta"],
  },
]

// ============================================================
// MENSAJES PORTAL CLIENTE
// ============================================================
export const mensajesCliente = [
  {
    id: 1,
    expedienteRef: "EXP-2025-FAM-001",
    clienteNombre: "Laura Sánchez",
    mensajes: [
      { id: 1, autor: "cliente", texto: "Buenos días, ¿cuándo es exactamente la vista oral?", fecha: "2025-05-19 09:15", leido: true },
      { id: 2, autor: "abogado", texto: "Buenos días Laura. La vista está señalada para el 2 de junio a las 10:30h en el Juzgado nº5. Debe acudir con DNI.", fecha: "2025-05-19 10:02", leido: true },
      { id: 3, autor: "cliente", texto: "Perfecto. ¿Necesito llevar algo más?", fecha: "2025-05-19 10:15", leido: false },
    ],
  },
  {
    id: 2,
    expedienteRef: "EXP-2025-FAM-005",
    clienteNombre: "Marta Fernández",
    mensajes: [
      { id: 1, autor: "cliente", texto: "La orden de alejamiento sigue en vigor, ¿verdad?", fecha: "2025-05-20 08:30", leido: false },
      { id: 2, autor: "abogado", texto: "Sí Marta, la orden sigue activa. Esta semana tramitamos la renovación. Si tiene cualquier incidencia llámeme directamente.", fecha: "2025-05-20 09:00", leido: true },
    ],
  },
]
