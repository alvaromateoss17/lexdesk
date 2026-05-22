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
    titulo: "Mediación EXP-2025-FAM-002 — Iglesias / Díaz",
    expedienteRef: "EXP-2025-FAM-002",
    partes: ["Roberto Iglesias Vega", "Carmen Díaz Flores"],
    cliente: "Roberto Iglesias Vega",
    contraparte: "Carmen Díaz Flores",
    mediador: "Carmen Ruiz (Mediadora certificada)",
    estado: "activo",
    fechaInicio: "2025-04-10",
    sesiones: [
      { id: 1, numero: 1, fecha: "2025-04-10", hora: "10:00", estado: "completada", temas: ["Presentación del proceso", "Reglas de mediación", "Puntos de conflicto"], acuerdos: [], notas: "Buen ambiente inicial. Ambas partes dispuestas a llegar a acuerdo." },
      { id: 2, numero: 2, fecha: "2025-04-24", hora: "10:00", estado: "completada", temas: ["Adjudicación vivienda", "Compensación económica"], acuerdos: ["Carmen se queda la vivienda con compensación a Roberto"], notas: "Roberto propone compensación de 180.000€. Carmen acepta el principio, pendiente tasación." },
      { id: 3, numero: 3, fecha: "2025-05-08", hora: "10:00", estado: "completada", temas: ["Vehículo BMW", "Liquidación cuenta conjunta"], acuerdos: ["Roberto se queda el BMW valorado en 32.000€"], notas: "Acuerdo sobre vehículo cerrado. Pendiente valoración definitiva de la vivienda." },
      { id: 4, numero: 4, fecha: "2025-05-29", hora: "10:00", estado: "pendiente", temas: ["Tasación vivienda", "Acuerdo final"], acuerdos: [], notas: "" },
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

// ============================================================
// CLIENTES
// ============================================================
export const clientes = [
  {
    id: 1,
    nombre: "Laura Sánchez Moreno",
    dni: "47823651K",
    fechaNacimiento: "1985-06-14",
    email: "laura.sanchez@gmail.com",
    telefono: "+34 612 345 678",
    telefonoSecundario: "+34 91 234 56 78",
    direccion: "C/ Gran Vía 42, 3ºB, 28013 Madrid",
    nacionalidad: "Española",
    profesion: "Profesora de secundaria",
    estadoCivil: "En proceso de divorcio",
    avatar: null,
    color: "#4F7EFF",
    abogadoAsignado: "Ana López",
    fechaAlta: "2025-02-10",
    estado: "activo",
    etiquetas: ["Divorcio", "Urgente", "Con menores"],
    expedientesIds: [101],
    notas: [
      { id: 1, autor: "Ana López", fecha: "2025-05-10", hora: "11:30", texto: "Cliente muy colaboradora. Facilita toda la documentación sin demora. Especialmente sensible con el tema de custodia de los niños. Tratar con delicadeza.", privada: true },
      { id: 2, autor: "Ana López", fecha: "2025-05-19", hora: "09:15", texto: "Llamada recibida. Pregunta por la vista oral. Le he confirmado fecha 2 de junio.", privada: true }
    ],
    pagos: [
      { id: 1, concepto: "Provisión de fondos inicial", importe: 1500, fecha: "2025-02-10", estado: "cobrado", metodo: "Transferencia" },
      { id: 2, concepto: "Honorarios primer trimestre", importe: 900, fecha: "2025-04-01", estado: "cobrado", metodo: "Transferencia" },
      { id: 3, concepto: "Provisión para vista oral", importe: 600, fecha: "2025-05-20", estado: "pendiente", metodo: null }
    ],
    documentos: [
      { id: 1, nombre: "DNI Laura Sánchez.pdf", tipo: "identificacion", fecha: "2025-02-10", tamaño: "1.2 MB", subidoPor: "cliente" },
      { id: 2, nombre: "Libro de familia.pdf", tipo: "familia", fecha: "2025-02-12", tamaño: "3.4 MB", subidoPor: "cliente" },
      { id: 3, nombre: "Contrato de arras vivienda.pdf", tipo: "inmueble", fecha: "2025-03-15", tamaño: "2.1 MB", subidoPor: "abogado" },
      { id: 4, nombre: "Nóminas últimos 3 meses.pdf", tipo: "laboral", fecha: "2025-03-20", tamaño: "0.8 MB", subidoPor: "cliente" },
      { id: 5, nombre: "Demanda divorcio borrador.pdf", tipo: "legal", fecha: "2025-04-05", tamaño: "0.5 MB", subidoPor: "abogado" }
    ],
    mensajes: [
      { id: 1, autor: "cliente", texto: "Buenos días, ¿cuándo es exactamente la vista oral?", fecha: "2025-05-19T09:15:00", leido: true },
      { id: 2, autor: "abogado", texto: "Buenos días Laura. La vista está señalada para el 2 de junio a las 10:30h en el Juzgado nº5.", fecha: "2025-05-19T10:02:00", leido: true },
      { id: 3, autor: "cliente", texto: "Perfecto. ¿Necesito llevar algo más además del DNI?", fecha: "2025-05-19T10:15:00", leido: false }
    ]
  },
  {
    id: 2,
    nombre: "Roberto Iglesias Vega",
    dni: "52341987P",
    fechaNacimiento: "1979-11-03",
    email: "r.iglesias.vega@outlook.com",
    telefono: "+34 688 901 234",
    telefonoSecundario: null,
    direccion: "Avda. de la Castellana 120, 5ºA, 28046 Madrid",
    nacionalidad: "Española",
    profesion: "Arquitecto",
    estadoCivil: "En proceso de divorcio",
    avatar: null,
    color: "#A78BFA",
    abogadoAsignado: "Carlos Mendoza",
    fechaAlta: "2025-03-05",
    estado: "activo",
    etiquetas: ["Divorcio mutuo acuerdo", "Gananciales"],
    expedientesIds: [102],
    notas: [
      { id: 1, autor: "Carlos Mendoza", fecha: "2025-03-05", hora: "12:00", texto: "Cliente tranquilo, el divorcio es de mutuo acuerdo. Prioriza cerrar rápido. Hay acuerdo tácito en casi todo salvo la valoración del piso de Serrano.", privada: true }
    ],
    pagos: [
      { id: 1, concepto: "Provisión inicial divorcio express", importe: 1200, fecha: "2025-03-05", estado: "cobrado", metodo: "Tarjeta" },
      { id: 2, concepto: "Honorarios tramitación convenio", importe: 800, fecha: "2025-05-01", estado: "cobrado", metodo: "Transferencia" }
    ],
    documentos: [
      { id: 1, nombre: "DNI Roberto Iglesias.pdf", tipo: "identificacion", fecha: "2025-03-05", tamaño: "1.1 MB", subidoPor: "cliente" },
      { id: 2, nombre: "Certificado matrimonio.pdf", tipo: "familia", fecha: "2025-03-06", tamaño: "0.4 MB", subidoPor: "cliente" },
      { id: 3, nombre: "Escritura vivienda Serrano.pdf", tipo: "inmueble", fecha: "2025-03-10", tamaño: "5.2 MB", subidoPor: "cliente" },
      { id: 4, nombre: "Convenio regulador borrador v2.docx", tipo: "legal", fecha: "2025-05-15", tamaño: "0.3 MB", subidoPor: "abogado" }
    ],
    mensajes: [
      { id: 1, autor: "abogado", texto: "Roberto, le adjunto el borrador v2 del convenio para su revisión.", fecha: "2025-05-15T16:30:00", leido: true },
      { id: 2, autor: "cliente", texto: "Revisado. Todo correcto excepto la cláusula de la hipoteca, hay un error en el importe.", fecha: "2025-05-16T09:00:00", leido: true }
    ]
  },
  {
    id: 3,
    nombre: "Isabel Torres Medina",
    dni: "39012456T",
    fechaNacimiento: "1988-04-22",
    email: "isabel.torres.m@gmail.com",
    telefono: "+34 655 432 109",
    telefonoSecundario: "+34 91 876 54 32",
    direccion: "C/ Fuencarral 88, 1ºC, 28004 Madrid",
    nacionalidad: "Española",
    profesion: "Enfermera",
    estadoCivil: "Divorciada",
    avatar: null,
    color: "#34D399",
    abogadoAsignado: "Ana López",
    fechaAlta: "2025-04-01",
    estado: "activo",
    etiquetas: ["Modificación medidas", "Urgente", "Con menores"],
    expedientesIds: [103],
    notas: [
      { id: 1, autor: "Ana López", fecha: "2025-04-01", hora: "10:00", texto: "Caso urgente. El padre quiere trasladarse a Barcelona. Hay que actuar rápido para proteger la custodia. Isabel muy nerviosa, requiere comunicación frecuente.", privada: true }
    ],
    pagos: [
      { id: 1, concepto: "Provisión de fondos urgente", importe: 800, fecha: "2025-04-01", estado: "cobrado", metodo: "Bizum" },
      { id: 2, concepto: "Honorarios demanda modificación", importe: 1100, fecha: "2025-04-15", estado: "cobrado", metodo: "Transferencia" },
      { id: 3, concepto: "Provisión juicio", importe: 700, fecha: "2025-05-27", estado: "pendiente", metodo: null }
    ],
    documentos: [
      { id: 1, nombre: "DNI Isabel Torres.pdf", tipo: "identificacion", fecha: "2025-04-01", tamaño: "1.0 MB", subidoPor: "cliente" },
      { id: 2, nombre: "Sentencia divorcio original.pdf", tipo: "legal", fecha: "2025-04-02", tamaño: "2.8 MB", subidoPor: "cliente" },
      { id: 3, nombre: "Demanda modificación medidas.pdf", tipo: "legal", fecha: "2025-04-10", tamaño: "0.6 MB", subidoPor: "abogado" }
    ],
    mensajes: [
      { id: 1, autor: "cliente", texto: "Ana, ¿hay novedades del juzgado?", fecha: "2025-05-20T08:45:00", leido: false }
    ]
  },
  {
    id: 4,
    nombre: "Familia Herrero García",
    dni: "Varios titulares",
    fechaNacimiento: null,
    email: "herrero.garcia.fam@gmail.com",
    telefono: "+34 699 123 456",
    telefonoSecundario: null,
    direccion: "C/ Velázquez 56, 7ºD, 28001 Madrid",
    nacionalidad: "Española",
    profesion: "Varios",
    estadoCivil: "Casados",
    avatar: null,
    color: "#FBBF24",
    abogadoAsignado: "Carlos Mendoza",
    fechaAlta: "2025-01-20",
    estado: "activo",
    etiquetas: ["Adopción"],
    expedientesIds: [104],
    notas: [
      { id: 1, autor: "Carlos Mendoza", fecha: "2025-01-20", hora: "11:15", texto: "Pareja muy ilusionada. Primera adopción. Tienen toda la documentación en orden. Certificado de idoneidad ya concedido por CAM. Solo falta la asignación.", privada: true }
    ],
    pagos: [
      { id: 1, concepto: "Honorarios tramitación adopción", importe: 2000, fecha: "2025-01-20", estado: "cobrado", metodo: "Transferencia" },
      { id: 2, concepto: "Segunda fase — seguimiento", importe: 1000, fecha: "2025-04-01", estado: "cobrado", metodo: "Transferencia" }
    ],
    documentos: [
      { id: 1, nombre: "Certificado idoneidad CAM.pdf", tipo: "adopcion", fecha: "2025-01-15", tamaño: "1.8 MB", subidoPor: "cliente" },
      { id: 2, nombre: "Informe psicosocial.pdf", tipo: "adopcion", fecha: "2025-02-10", tamaño: "3.1 MB", subidoPor: "cliente" },
      { id: 3, nombre: "Solicitud adopción registrada.pdf", tipo: "legal", fecha: "2025-02-20", tamaño: "0.7 MB", subidoPor: "abogado" }
    ],
    mensajes: []
  },
  {
    id: 5,
    nombre: "Marta Fernández López",
    dni: "61209834H",
    fechaNacimiento: "1992-09-07",
    email: "marta.fdez.lopez@proton.me",
    telefono: "+34 611 987 654",
    telefonoSecundario: null,
    direccion: "[Dirección reservada por seguridad]",
    nacionalidad: "Española",
    profesion: "Auxiliar administrativa",
    estadoCivil: "Separada",
    avatar: null,
    color: "#F87171",
    abogadoAsignado: "Ana López",
    fechaAlta: "2025-05-15",
    estado: "activo",
    etiquetas: ["Violencia de género", "Urgente", "Orden alejamiento activa"],
    expedientesIds: [105],
    notas: [
      { id: 1, autor: "Ana López", fecha: "2025-05-15", hora: "16:00", texto: "ATENCIÓN — caso de violencia de género activo. Orden de alejamiento vigente hasta el 26/05. Renovación urgente tramitándose. No compartir dirección ni datos de localización. Contacto solo por canal seguro (email Proton).", privada: true }
    ],
    pagos: [
      { id: 1, concepto: "Turno de oficio — sin coste cliente", importe: 0, fecha: "2025-05-15", estado: "cobrado", metodo: "Turno oficio" }
    ],
    documentos: [
      { id: 1, nombre: "Denuncia policial.pdf", tipo: "legal", fecha: "2025-05-14", tamaño: "0.9 MB", subidoPor: "cliente" },
      { id: 2, nombre: "Orden de alejamiento.pdf", tipo: "legal", fecha: "2025-05-15", tamaño: "0.4 MB", subidoPor: "abogado" },
      { id: 3, nombre: "Informe médico lesiones.pdf", tipo: "medico", fecha: "2025-05-14", tamaño: "1.5 MB", subidoPor: "cliente" }
    ],
    mensajes: [
      { id: 1, autor: "cliente", texto: "La orden de alejamiento sigue en vigor, ¿verdad?", fecha: "2025-05-20T08:30:00", leido: false },
      { id: 2, autor: "abogado", texto: "Sí Marta, la orden sigue activa. Esta semana tramitamos la renovación.", fecha: "2025-05-20T09:00:00", leido: true }
    ]
  },
  {
    id: 6,
    nombre: "Antonio Morales Pérez",
    dni: "28934710V",
    fechaNacimiento: "1971-12-19",
    email: "antonio.morales@empresa.com",
    telefono: "+34 678 234 567",
    telefonoSecundario: null,
    direccion: "C/ Ortega y Gasset 12, 9ºA, 28006 Madrid",
    nacionalidad: "Española",
    profesion: "Director comercial",
    estadoCivil: "Divorciado",
    avatar: null,
    color: "#4F7EFF",
    abogadoAsignado: "Carlos Mendoza",
    fechaAlta: "2024-11-10",
    estado: "archivado",
    etiquetas: ["Divorcio", "Cerrado"],
    expedientesIds: [],
    notas: [
      { id: 1, autor: "Carlos Mendoza", fecha: "2025-03-01", hora: "10:00", texto: "Caso cerrado con sentencia favorable. Cliente muy satisfecho. Posible referenciador de nuevos clientes.", privada: true }
    ],
    pagos: [
      { id: 1, concepto: "Provisión de fondos", importe: 2000, fecha: "2024-11-10", estado: "cobrado", metodo: "Transferencia" },
      { id: 2, concepto: "Honorarios finales", importe: 3500, fecha: "2025-02-28", estado: "cobrado", metodo: "Transferencia" }
    ],
    documentos: [
      { id: 1, nombre: "Sentencia divorcio firme.pdf", tipo: "legal", fecha: "2025-02-20", tamaño: "1.4 MB", subidoPor: "abogado" }
    ],
    mensajes: []
  }
]

export const abogadosDespacho = [
  { id: 1, nombre: "Ana López",      especialidad: "Derecho de Familia",           color: "#4F7EFF" },
  { id: 2, nombre: "Carlos Mendoza", especialidad: "Derecho Civil y Familia",      color: "#A78BFA" },
]

export const categoriasDocumento = [
  { valor: "identificacion", label: "Identificación" },
  { valor: "familia",        label: "Familia" },
  { valor: "legal",          label: "Legal" },
  { valor: "inmueble",       label: "Inmueble" },
  { valor: "laboral",        label: "Laboral" },
  { valor: "medico",         label: "Médico" },
  { valor: "adopcion",       label: "Adopción" },
  { valor: "otro",           label: "Otro" },
]

// ============================================================
// EVENTOS DE CALENDARIO
// ============================================================
export const eventosMock = [
  { id: 1, titulo: "Vista oral — Sánchez vs Martínez", tipo: "vista_oral", color: "#F87171", fecha: "2025-06-02", horaInicio: "10:30", horaFin: "12:00", todoDia: false, clienteId: 1, clienteNombre: "Laura Sánchez Moreno", expedienteRef: "EXP-2025-FAM-001", abogado: "Ana López", ubicacion: "Juzgado de Primera Instancia nº5, Madrid", descripcion: "Vista oral principal del procedimiento de divorcio contencioso.", recordatorio: "1 día antes" },
  { id: 2, titulo: "Firma convenio regulador", tipo: "firma", color: "#34D399", fecha: "2025-05-30", horaInicio: "11:00", horaFin: "11:30", todoDia: false, clienteId: 2, clienteNombre: "Roberto Iglesias Vega", expedienteRef: "EXP-2025-FAM-002", abogado: "Carlos Mendoza", ubicacion: "Despacho — Sala de reuniones", descripcion: "Firma del borrador final del convenio regulador por ambas partes.", recordatorio: "1 hora antes" },
  { id: 3, titulo: "Cita urgente — Marta Fernández", tipo: "cita_cliente", color: "#4F7EFF", fecha: "2025-05-26", horaInicio: "09:00", horaFin: "10:00", todoDia: false, clienteId: 5, clienteNombre: "Marta Fernández López", expedienteRef: "EXP-2025-FAM-005", abogado: "Ana López", ubicacion: "Videollamada", descripcion: "Revisión urgente de la orden de alejamiento y preparación del juicio.", recordatorio: "15 minutos antes" },
  { id: 4, titulo: "Plazo: contestación demanda Torres", tipo: "plazo_procesal", color: "#FBBF24", fecha: "2025-05-27", horaInicio: null, horaFin: null, todoDia: true, clienteId: 3, clienteNombre: "Isabel Torres Medina", expedienteRef: "EXP-2025-FAM-003", abogado: "Ana López", ubicacion: null, descripcion: "Plazo máximo para presentar contestación a la demanda de modificación.", recordatorio: "2 días antes" },
  { id: 5, titulo: "Sesión mediación nº3 — Iglesias/Díaz", tipo: "mediacion", color: "#A78BFA", fecha: "2025-05-29", horaInicio: "17:00", horaFin: "18:30", todoDia: false, clienteId: 2, clienteNombre: "Roberto Iglesias Vega", expedienteRef: "EXP-2025-FAM-002", abogado: "Carlos Mendoza", ubicacion: "Centro de Mediación C/ Génova 12", descripcion: "Tercera sesión de mediación. Pendiente valoración definitiva vivienda.", recordatorio: "1 día antes" },
]

export const tiposEvento = [
  { valor: "vista_oral",      label: "Vista oral",            color: "#F87171" },
  { valor: "juicio",          label: "Juicio",                color: "#F87171" },
  { valor: "cita_cliente",    label: "Cita con cliente",      color: "#4F7EFF" },
  { valor: "plazo_procesal",  label: "Plazo procesal",        color: "#FBBF24" },
  { valor: "mediacion",       label: "Sesión de mediación",   color: "#A78BFA" },
  { valor: "firma",           label: "Firma de documentos",   color: "#34D399" },
  { valor: "reunion_interna", label: "Reunión interna",       color: "#8A8A8A" },
  { valor: "notificacion",    label: "Notificación judicial", color: "#FBBF24" },
  { valor: "otro",            label: "Otro",                  color: "#8A8A8A" },
]

// ============================================================
// FACTURACIÓN
// ============================================================
export const seriesFacturacion = [
  { id: 1, codigo: "FAM", nombre: "Derecho de Familia",     prefijo: "FAM", año: 2025, ultimoNumero: 12 },
  { id: 2, codigo: "GEN", nombre: "General",                prefijo: "GEN", año: 2025, ultimoNumero: 4  },
  { id: 3, codigo: "PRV", nombre: "Provisiones de fondos",  prefijo: "PRV", año: 2025, ultimoNumero: 8  },
]

export const conceptosFacturables = [
  { id: 1,  categoria: "honorarios", descripcion: "Honorarios divorcio contencioso",        precioBase: 2500, unidad: "asunto",     iva: 21 },
  { id: 2,  categoria: "honorarios", descripcion: "Honorarios divorcio mutuo acuerdo",      precioBase: 1500, unidad: "asunto",     iva: 21 },
  { id: 3,  categoria: "honorarios", descripcion: "Honorarios modificación de medidas",     precioBase: 1800, unidad: "asunto",     iva: 21 },
  { id: 4,  categoria: "honorarios", descripcion: "Honorarios custodia y alimentos",        precioBase: 2000, unidad: "asunto",     iva: 21 },
  { id: 5,  categoria: "honorarios", descripcion: "Honorarios adopción nacional",           precioBase: 3000, unidad: "asunto",     iva: 21 },
  { id: 6,  categoria: "honorarios", descripcion: "Honorarios violencia de género",         precioBase: 0,    unidad: "asunto",     iva: 21 },
  { id: 7,  categoria: "provision",  descripcion: "Provisión de fondos inicial",            precioBase: 800,  unidad: "provisión",  iva: 21 },
  { id: 8,  categoria: "provision",  descripcion: "Provisión para juicio oral",             precioBase: 600,  unidad: "provisión",  iva: 21 },
  { id: 9,  categoria: "provision",  descripcion: "Provisión para recurso",                precioBase: 500,  unidad: "provisión",  iva: 21 },
  { id: 10, categoria: "servicio",   descripcion: "Redacción convenio regulador",           precioBase: 400,  unidad: "documento",  iva: 21 },
  { id: 11, categoria: "servicio",   descripcion: "Redacción demanda",                     precioBase: 350,  unidad: "documento",  iva: 21 },
  { id: 12, categoria: "servicio",   descripcion: "Escrito de contestación",               precioBase: 300,  unidad: "documento",  iva: 21 },
  { id: 13, categoria: "servicio",   descripcion: "Gestión diligencias notariales",        precioBase: 200,  unidad: "gestión",    iva: 21 },
  { id: 14, categoria: "servicio",   descripcion: "Consulta jurídica (por hora)",          precioBase: 150,  unidad: "hora",       iva: 21 },
  { id: 15, categoria: "servicio",   descripcion: "Mediación familiar (sesión)",           precioBase: 180,  unidad: "sesión",     iva: 21 },
  { id: 16, categoria: "suplido",    descripcion: "Tasas judiciales",                      precioBase: 0,    unidad: "importe real", iva: 0 },
  { id: 17, categoria: "suplido",    descripcion: "Registro Civil — certificados",         precioBase: 0,    unidad: "importe real", iva: 0 },
  { id: 18, categoria: "suplido",    descripcion: "Procurador",                            precioBase: 0,    unidad: "importe real", iva: 0 },
  { id: 19, categoria: "suplido",    descripcion: "Perito / informe psicológico",          precioBase: 0,    unidad: "importe real", iva: 0 },
  { id: 20, categoria: "suplido",    descripcion: "Notaría",                               precioBase: 0,    unidad: "importe real", iva: 0 },
]

export const facturasMock = [
  { id: 1, numero: "FAM-2025-001", serie: "FAM", fecha: "2025-02-10", fechaVto: "2025-02-25", clienteId: 1, cliente: "Laura Sánchez Moreno", clienteDni: "47823651K", clienteDireccion: "C/ Gran Vía 42, 3ºB, 28013 Madrid", expediente: "EXP-2025-FAM-001", expedienteId: 101, abogado: "Ana López", estado: "cobrada", metodoPago: "Transferencia", fechaCobro: "2025-02-12", lineas: [{ id: 1, concepto: "Provisión de fondos inicial — Divorcio contencioso", cantidad: 1, precioUnitario: 1500, descuento: 0, iva: 21 }], notas: "Provisión de fondos para inicio del procedimiento.", subtotal: 1500, iva: 315, total: 1815 },
  { id: 2, numero: "FAM-2025-002", serie: "FAM", fecha: "2025-04-01", fechaVto: "2025-04-16", clienteId: 1, cliente: "Laura Sánchez Moreno", clienteDni: "47823651K", clienteDireccion: "C/ Gran Vía 42, 3ºB, 28013 Madrid", expediente: "EXP-2025-FAM-001", expedienteId: 101, abogado: "Ana López", estado: "cobrada", metodoPago: "Transferencia", fechaCobro: "2025-04-03", lineas: [{ id: 1, concepto: "Honorarios primer trimestre — Divorcio contencioso", cantidad: 1, precioUnitario: 900, descuento: 0, iva: 21 }, { id: 2, concepto: "Redacción demanda divorcio", cantidad: 1, precioUnitario: 350, descuento: 0, iva: 21 }], notas: "", subtotal: 1250, iva: 262.50, total: 1512.50 },
  { id: 3, numero: "FAM-2025-003", serie: "FAM", fecha: "2025-05-20", fechaVto: "2025-06-04", clienteId: 1, cliente: "Laura Sánchez Moreno", clienteDni: "47823651K", clienteDireccion: "C/ Gran Vía 42, 3ºB, 28013 Madrid", expediente: "EXP-2025-FAM-001", expedienteId: 101, abogado: "Ana López", estado: "emitida", metodoPago: null, fechaCobro: null, lineas: [{ id: 1, concepto: "Provisión para vista oral — Juzgado nº5", cantidad: 1, precioUnitario: 600, descuento: 0, iva: 21 }], notas: "Provisión necesaria para la vista oral del 2 de junio.", subtotal: 600, iva: 126, total: 726 },
  { id: 4, numero: "FAM-2025-004", serie: "FAM", fecha: "2025-03-05", fechaVto: "2025-03-20", clienteId: 2, cliente: "Roberto Iglesias Vega", clienteDni: "52341987P", clienteDireccion: "Avda. de la Castellana 120, 5ºA, 28046 Madrid", expediente: "EXP-2025-FAM-002", expedienteId: 102, abogado: "Carlos Mendoza", estado: "cobrada", metodoPago: "Tarjeta", fechaCobro: "2025-03-06", lineas: [{ id: 1, concepto: "Provisión inicial — Divorcio mutuo acuerdo", cantidad: 1, precioUnitario: 1200, descuento: 0, iva: 21 }], notas: "", subtotal: 1200, iva: 252, total: 1452 },
  { id: 5, numero: "FAM-2025-005", serie: "FAM", fecha: "2025-05-01", fechaVto: "2025-05-16", clienteId: 2, cliente: "Roberto Iglesias Vega", clienteDni: "52341987P", clienteDireccion: "Avda. de la Castellana 120, 5ºA, 28046 Madrid", expediente: "EXP-2025-FAM-002", expedienteId: 102, abogado: "Carlos Mendoza", estado: "cobrada", metodoPago: "Transferencia", fechaCobro: "2025-05-04", lineas: [{ id: 1, concepto: "Honorarios tramitación convenio regulador", cantidad: 1, precioUnitario: 800, descuento: 0, iva: 21 }, { id: 2, concepto: "Redacción convenio regulador v2", cantidad: 1, precioUnitario: 400, descuento: 10, iva: 21 }], notas: "Descuento 10% aplicado en redacción convenio por ser cliente fidelizado.", subtotal: 1160, iva: 243.60, total: 1403.60 },
  { id: 6, numero: "FAM-2025-006", serie: "FAM", fecha: "2025-04-01", fechaVto: "2025-04-16", clienteId: 3, cliente: "Isabel Torres Medina", clienteDni: "39012456T", clienteDireccion: "C/ Fuencarral 88, 1ºC, 28004 Madrid", expediente: "EXP-2025-FAM-003", expedienteId: 103, abogado: "Ana López", estado: "cobrada", metodoPago: "Bizum", fechaCobro: "2025-04-02", lineas: [{ id: 1, concepto: "Provisión urgente — Modificación de medidas", cantidad: 1, precioUnitario: 800, descuento: 0, iva: 21 }, { id: 2, concepto: "Honorarios demanda modificación", cantidad: 1, precioUnitario: 1100, descuento: 0, iva: 21 }], notas: "Caso urgente.", subtotal: 1900, iva: 399, total: 2299 },
  { id: 7, numero: "FAM-2025-007", serie: "FAM", fecha: "2025-05-27", fechaVto: "2025-06-11", clienteId: 3, cliente: "Isabel Torres Medina", clienteDni: "39012456T", clienteDireccion: "C/ Fuencarral 88, 1ºC, 28004 Madrid", expediente: "EXP-2025-FAM-003", expedienteId: 103, abogado: "Ana López", estado: "emitida", metodoPago: null, fechaCobro: null, lineas: [{ id: 1, concepto: "Provisión para juicio oral — Custodia Mateo", cantidad: 1, precioUnitario: 700, descuento: 0, iva: 21 }], notas: "", subtotal: 700, iva: 147, total: 847 },
  { id: 8, numero: "GEN-2025-001", serie: "GEN", fecha: "2025-01-20", fechaVto: "2025-02-04", clienteId: 4, cliente: "Familia Herrero García", clienteDni: "Varios titulares", clienteDireccion: "C/ Velázquez 56, 7ºD, 28001 Madrid", expediente: "EXP-2025-FAM-004", expedienteId: 104, abogado: "Carlos Mendoza", estado: "cobrada", metodoPago: "Transferencia", fechaCobro: "2025-01-22", lineas: [{ id: 1, concepto: "Honorarios tramitación adopción nacional — Fase 1", cantidad: 1, precioUnitario: 2000, descuento: 0, iva: 21 }], notas: "", subtotal: 2000, iva: 420, total: 2420 },
]

export const gastosMock = [
  { id: 1,  categoria: "personal",   descripcion: "Nómina Ana López — mayo 2025",         importe: 3200, fecha: "2025-05-31", proveedor: "Ana López",              recurrente: true  },
  { id: 2,  categoria: "personal",   descripcion: "Nómina Carlos Mendoza — mayo 2025",    importe: 2900, fecha: "2025-05-31", proveedor: "Carlos Mendoza",         recurrente: true  },
  { id: 3,  categoria: "oficina",    descripcion: "Alquiler despacho mayo 2025",          importe: 1800, fecha: "2025-05-01", proveedor: "Inmobiliaria Centro",     recurrente: true  },
  { id: 4,  categoria: "oficina",    descripcion: "Suministros (luz, internet)",          importe: 180,  fecha: "2025-05-05", proveedor: "Endesa / Movistar",      recurrente: true  },
  { id: 5,  categoria: "tecnologia", descripcion: "Suscripción Vincla SaaS",              importe: 149,  fecha: "2025-05-01", proveedor: "Vincla SL",              recurrente: true  },
  { id: 6,  categoria: "tecnologia", descripcion: "Aranzadi — base jurisprudencia",       importe: 89,   fecha: "2025-05-01", proveedor: "Thomson Reuters",        recurrente: true  },
  { id: 7,  categoria: "marketing",  descripcion: "Publicidad Google Ads — mayo",         importe: 350,  fecha: "2025-05-15", proveedor: "Google Ireland Ltd",     recurrente: false },
  { id: 8,  categoria: "formacion",  descripcion: "Curso mediación familiar Ana López",   importe: 450,  fecha: "2025-05-10", proveedor: "Centro Mediación Madrid", recurrente: false },
  { id: 9,  categoria: "suplidos",   descripcion: "Tasas judiciales expediente FAM-001",  importe: 215,  fecha: "2025-03-20", proveedor: "Agencia Tributaria",     expedienteRef: "EXP-2025-FAM-001", recurrente: false },
  { id: 10, categoria: "suplidos",   descripcion: "Perito psicológico FAM-001",           importe: 800,  fecha: "2025-04-15", proveedor: "Psic. Ramírez & Asoc.",  expedienteRef: "EXP-2025-FAM-001", recurrente: false },
]
