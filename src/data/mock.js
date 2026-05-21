export const EXPEDIENTES = [
  { id: 1, ref: "EXP-2025-087", cliente: "Construcciones Albéniz S.L.", tipo: "Mercantil", abogado: "Lucía Romero", ultMov: "Hace 2 h", estado: "Activo", juzgado: "Juzgado de lo Mercantil nº 4, Madrid", fechaInicio: "12 mar 2026", descripcion: "Reclamación de cantidad por incumplimiento contractual. Importe: 87.450,00 €" },
  { id: 2, ref: "EXP-2025-091", cliente: "Marta Iglesias Vidal", tipo: "Familia", abogado: "Daniel Cerezo", ultMov: "Ayer", estado: "Urgente", juzgado: "Juzgado de 1ª Instancia nº 12, Barcelona", fechaInicio: "03 feb 2026", descripcion: "Divorcio contencioso con custodia disputada de dos menores" },
  { id: 3, ref: "EXP-2025-074", cliente: "Hostelería Ribadeo S.C.", tipo: "Laboral", abogado: "Lucía Romero", ultMov: "Hace 3 d", estado: "Activo", juzgado: "Juzgado de lo Social nº 7, A Coruña", fechaInicio: "18 ene 2026", descripcion: "Despido improcedente colectivo. Cuatro trabajadores afectados" },
  { id: 4, ref: "EXP-2024-318", cliente: "Javier Mendoza Ortiz", tipo: "Penal", abogado: "Pablo Soriano", ultMov: "Hace 1 d", estado: "Activo", juzgado: "Juzgado de Instrucción nº 3, Valencia", fechaInicio: "05 oct 2024", descripcion: "Defensa por delito de lesiones. Juicio oral pendiente" },
  { id: 5, ref: "EXP-2025-102", cliente: "Inmobiliaria Atalaya S.A.", tipo: "Civil", abogado: "Inés Bermejo", ultMov: "Hace 5 h", estado: "Activo", juzgado: "Juzgado de 1ª Instancia nº 21, Sevilla", fechaInicio: "01 mar 2026", descripcion: "Reclamación daños y perjuicios por vicios ocultos. Importe: 42.000 €" },
  { id: 6, ref: "EXP-2024-256", cliente: "Talleres Goiri S.L.", tipo: "Concursal", abogado: "Daniel Cerezo", ultMov: "Hace 2 sem.", estado: "Archivado", juzgado: "Juzgado de lo Mercantil nº 2, Bilbao", fechaInicio: "14 jul 2024", descripcion: "Concurso de acreedores voluntario. Pasivo total: 320.000 €" },
  { id: 7, ref: "EXP-2025-064", cliente: "Carmen Aguilar Pino", tipo: "Familia", abogado: "Inés Bermejo", ultMov: "Hace 6 h", estado: "Urgente", juzgado: "Juzgado de Violencia s/Mujer nº 1, Málaga", fechaInicio: "22 ene 2026", descripcion: "Orden de protección y medidas cautelares urgentes" },
  { id: 8, ref: "EXP-2025-098", cliente: "Bodegas Ferrer e Hijos", tipo: "Mercantil", abogado: "Pablo Soriano", ultMov: "Hace 4 d", estado: "Activo", juzgado: "Juzgado de lo Mercantil nº 1, Logroño", fechaInicio: "10 feb 2026", descripcion: "Incumplimiento contrato distribución exclusiva. Reclamación: 65.000 €" },
];

export const PROXIMOS_PLAZOS = [
  { id: 1, fecha: "27 may 2026", expediente: "EXP-2025-091", expedienteId: 2, tipo: "Vista de medidas provisionales", urgencia: "Urgente", dias: 2, descripcion: "Sala 4, 10:30h. Llevar documentación completa" },
  { id: 2, fecha: "29 may 2026", expediente: "EXP-2025-087", expedienteId: 1, tipo: "Contestación a la demanda", urgencia: "Próximo", dias: 4, descripcion: "Plazo improrrogable. Presentar vía telemática" },
  { id: 3, fecha: "02 jun 2026", expediente: "EXP-2024-318", expedienteId: 4, tipo: "Presentación de pruebas", urgencia: "Próximo", dias: 8, descripcion: "Juzgado de Instrucción nº 3, Valencia" },
  { id: 4, fecha: "05 jun 2026", expediente: "EXP-2025-064", expedienteId: 7, tipo: "Audiencia previa", urgencia: "Normal", dias: 11, descripcion: "Juzgado de Violencia s/Mujer nº 1, Sala 2, 12:00h" },
  { id: 5, fecha: "11 jun 2026", expediente: "EXP-2025-102", expedienteId: 5, tipo: "Recurso de apelación", urgencia: "Normal", dias: 17, descripcion: "Plazo 20 días desde notificación sentencia" },
];

export const ACTIVIDAD = [
  { icon: "FileText", who: "Lucía Romero", action: "subió", what: "contrato_albeniz_v3.pdf", in: "EXP-2025-087", when: "hace 14 min" },
  { icon: "Sparkles", who: "Asistente IA", action: "generó resumen de", what: "EXP-2025-091", in: null, when: "hace 38 min" },
  { icon: "Calendar", who: "Daniel Cerezo", action: "creó plazo", what: "Vista 27 may", in: "EXP-2025-091", when: "hace 1 h" },
  { icon: "Users", who: "Inés Bermejo", action: "añadió cliente", what: "Carmen Aguilar Pino", in: null, when: "hace 3 h" },
  { icon: "Pencil", who: "Pablo Soriano", action: "editó notas de", what: "EXP-2024-318", in: null, when: "hace 5 h" },
  { icon: "FolderOpen", who: "Lucía Romero", action: "abrió expediente", what: "EXP-2025-098", in: null, when: "ayer" },
  { icon: "Check", who: "Daniel Cerezo", action: "marcó como completado", what: "Notificación a procurador", in: "EXP-2024-256", when: "ayer" },
];

export const DOCUMENTOS = [
  { id: 1, nombre: "demanda_inicial.pdf", tipo: "pdf", tamano: 1228, fecha: "12 mar 2026", expedienteId: 1, subidoPor: "Lucía Romero", tag: "Demanda" },
  { id: 2, nombre: "contrato_albeniz_v3.pdf", tipo: "pdf", tamano: 846, fecha: "Hoy, 11:08", expedienteId: 1, subidoPor: "Lucía Romero", tag: "Contrato" },
  { id: 3, nombre: "anexo_facturacion_2024.xlsx", tipo: "xlsx", tamano: 312, fecha: "18 abr 2026", expedienteId: 1, subidoPor: "Pablo Soriano", tag: "Anexo" },
  { id: 4, nombre: "burofax_constructora.pdf", tipo: "pdf", tamano: 204, fecha: "22 abr 2026", expedienteId: 1, subidoPor: "Daniel Cerezo", tag: "Notificación" },
  { id: 5, nombre: "informe_pericial_estructural.pdf", tipo: "pdf", tamano: 4198, fecha: "06 may 2026", expedienteId: 1, subidoPor: "Perito ext.", tag: "Informe" },
  { id: 6, nombre: "alegaciones_oposicion.docx", tipo: "docx", tamano: 98, fecha: "14 may 2026", expedienteId: 1, subidoPor: "Lucía Romero", tag: "Escrito" },
  { id: 7, nombre: "denuncia_iglesias.pdf", tipo: "pdf", tamano: 540, fecha: "03 feb 2026", expedienteId: 2, subidoPor: "Daniel Cerezo", tag: "Denuncia" },
  { id: 8, nombre: "convenio_regulador_borrador.docx", tipo: "docx", tamano: 187, fecha: "10 mar 2026", expedienteId: 2, subidoPor: "Daniel Cerezo", tag: "Borrador" },
  { id: 9, nombre: "nominas_trabajadores.pdf", tipo: "pdf", tamano: 920, fecha: "20 ene 2026", expedienteId: 3, subidoPor: "Lucía Romero", tag: "Prueba" },
  { id: 10, nombre: "acta_juicio_penal.pdf", tipo: "pdf", tamano: 780, fecha: "15 may 2026", expedienteId: 4, subidoPor: "Pablo Soriano", tag: "Acta" },
];

export const CLIENTES = [
  { id: 1, nombre: "Construcciones Albéniz S.L.", email: "jl@albeniz.es", telefono: "+34 914 28 19 03", expedientesActivos: 2, fechaAlta: "15 ene 2025", cif: "B-87341290" },
  { id: 2, nombre: "Marta Iglesias Vidal", email: "m.iglesias@gmail.com", telefono: "+34 635 812 447", expedientesActivos: 1, fechaAlta: "03 feb 2026", cif: "46812345-T" },
  { id: 3, nombre: "Hostelería Ribadeo S.C.", email: "admin@hosteleria-ribadeo.es", telefono: "+34 981 34 02 11", expedientesActivos: 1, fechaAlta: "18 ene 2026", cif: "G-15294830" },
  { id: 4, nombre: "Javier Mendoza Ortiz", email: "jmendoza@outlook.com", telefono: "+34 647 390 215", expedientesActivos: 1, fechaAlta: "05 oct 2024", cif: "23891045-M" },
  { id: 5, nombre: "Inmobiliaria Atalaya S.A.", email: "legal@atalaya-inmobiliaria.com", telefono: "+34 954 61 78 30", expedientesActivos: 1, fechaAlta: "01 mar 2026", cif: "A-41872030" },
];

export const DOCS_EXPEDIENTE = [
  { name: "demanda_inicial.pdf", size: "1.2 MB", who: "Lucía Romero", when: "12 mar 2026", tag: "Demanda" },
  { name: "contrato_albeniz_v3.pdf", size: "846 KB", who: "Lucía Romero", when: "Hoy, 11:08", tag: "Contrato" },
  { name: "anexo_facturacion_2024.xlsx", size: "312 KB", who: "Pablo Soriano", when: "18 abr 2026", tag: "Anexo" },
  { name: "burofax_constructora.pdf", size: "204 KB", who: "Daniel Cerezo", when: "22 abr 2026", tag: "Notificación" },
  { name: "informe_pericial_estructural.pdf", size: "4.1 MB", who: "Perito ext.", when: "06 may 2026", tag: "Informe" },
  { name: "alegaciones_oposicion.docx", size: "98 KB", who: "Lucía Romero", when: "14 may 2026", tag: "Escrito" },
];

export const CONVERSACIONES = [
  { group: "Hoy", items: [
    { id: 1, title: "Resumen EXP-2025-087", time: "11:42" },
    { id: 2, title: "Redactar escrito de oposición", time: "09:15" },
  ]},
  { group: "Ayer", items: [
    { id: 3, title: "Búsqueda jurisprudencia despido objetivo", time: "17:20" },
    { id: 4, title: "Plazos pendientes esta semana", time: "10:04" },
  ]},
  { group: "Semana pasada", items: [
    { id: 5, title: "Análisis cláusula suelo", time: "Jue" },
    { id: 6, title: "Comparativa convenios hostelería", time: "Mié" },
    { id: 7, title: "Borrador demanda Iglesias Vidal", time: "Mar" },
  ]},
  { group: "Mayo 2026", items: [
    { id: 8, title: "Resumen sentencia STS 412/2024", time: "16 may" },
    { id: 9, title: "Modelo poder general para pleitos", time: "12 may" },
  ]},
];

export const CAL_EVENTS = {
  4:  [{ t: "Reunión Albéniz", urg: "normal", time: "10:00" }],
  6:  [{ t: "Firma poder Iglesias", urg: "normal", time: "12:30" }],
  8:  [{ t: "Plazo: alegaciones", urg: "amber", time: "Todo el día" }],
  11: [{ t: "Vista Mendoza", urg: "normal", time: "09:30" }],
  13: [{ t: "Llamada perito", urg: "normal", time: "16:00" }],
  15: [{ t: "Plazo: contestación", urg: "amber", time: "23:59" }, { t: "Cliente Albéniz", urg: "normal", time: "17:00" }],
  19: [{ t: "Audiencia previa", urg: "amber", time: "10:00" }],
  21: [{ t: "Reunión equipo", urg: "normal", time: "09:00" }],
  25: [{ t: "Vista divorcio Iglesias", urg: "red", time: "10:30" }],
  27: [{ t: "Plazo crítico: medidas provisionales", urg: "red", time: "23:59" }, { t: "Cliente Aguilar", urg: "normal", time: "16:30" }],
  28: [{ t: "Recurso apelación", urg: "red", time: "12:00" }],
  29: [{ t: "Plazo: contestación demanda Albéniz", urg: "amber", time: "23:59" }],
};

export const AI_SUMMARY = {
  partes: ["Demandante: Construcciones Albéniz S.L.", "Demandado: Inmobiliaria del Centro S.A."],
  fechasClave: ["Contrato firmado: 18/07/2025", "Primer impago: 15/11/2025", "Burofax requerimiento: 22/04/2026", "Contestación demanda: 29/05/2026"],
  objeto: "Reclamación de cantidad por importe de 87.450,00 € derivada del impago de cuatro certificaciones de obra emitidas entre noviembre de 2025 y febrero de 2026.",
  riesgos: ["Contestación a la demanda vence en 4 días — plazo improrrogable", "2 documentos sin clasificar que podrían reforzar prueba documental", "Testigo clave aún no ha confirmado disponibilidad para juicio"],
};
