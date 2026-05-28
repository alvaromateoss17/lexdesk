export const TIPOS_EVENTO = [
  // ACTOS JUDICIALES
  { label: 'Vista Oral', group: 'Actos Judiciales', color: '#EF4444' },
  { label: 'Juicio', group: 'Actos Judiciales', color: '#EF4444' },
  { label: 'Juicio Verbal', group: 'Actos Judiciales', color: '#EF4444' },
  { label: 'Audiencia Previa', group: 'Actos Judiciales', color: '#EF4444' },
  { label: 'Comparecencia', group: 'Actos Judiciales', color: '#EF4444' },
  { label: 'Comparecencia de Medidas Provisionales', group: 'Actos Judiciales', color: '#EF4444' },
  { label: 'Ratificación de Informe Pericial', group: 'Actos Judiciales', color: '#EF4444' },
  { label: 'Ratificación de Acuerdo / Convenio', group: 'Actos Judiciales', color: '#EF4444' },
  { label: 'Exploración de Menor', group: 'Actos Judiciales', color: '#EF4444' },
  { label: 'Equipo Psicosocial — Entrevista', group: 'Actos Judiciales', color: '#EF4444' },
  { label: 'Equipo Psicosocial — Ratificación de Informe', group: 'Actos Judiciales', color: '#EF4444' },
  { label: 'Declaración de Parte', group: 'Actos Judiciales', color: '#EF4444' },
  { label: 'Declaración de Testigo', group: 'Actos Judiciales', color: '#EF4444' },
  { label: 'Prueba Pericial', group: 'Actos Judiciales', color: '#EF4444' },
  { label: 'Ejecución de Sentencia', group: 'Actos Judiciales', color: '#EF4444' },
  { label: 'Notificación Judicial', group: 'Actos Judiciales', color: '#F59E0B' },
  { label: 'Señalamiento Pendiente de Confirmar', group: 'Actos Judiciales', color: '#F59E0B' },

  // PLAZOS Y ESCRITOS
  { label: 'Plazo Procesal', group: 'Plazos y Escritos', color: '#F59E0B' },
  { label: 'Plazo para Recurso', group: 'Plazos y Escritos', color: '#F59E0B' },
  { label: 'Plazo para Contestar Demanda', group: 'Plazos y Escritos', color: '#F59E0B' },
  { label: 'Entrega de Documentación al Juzgado', group: 'Plazos y Escritos', color: '#F59E0B' },
  { label: 'Presentación de Escrito', group: 'Plazos y Escritos', color: '#F59E0B' },
  { label: 'Vencimiento de Plazo Legal', group: 'Plazos y Escritos', color: '#F59E0B' },

  // GESTIONES CON EL CLIENTE
  { label: 'Cita con Cliente', group: 'Gestiones con Cliente', color: '#4F7EFF' },
  { label: 'Primera Consulta', group: 'Gestiones con Cliente', color: '#4F7EFF' },
  { label: 'Revisión de Caso', group: 'Gestiones con Cliente', color: '#4F7EFF' },
  { label: 'Entrega de Documentos por Cliente', group: 'Gestiones con Cliente', color: '#4F7EFF' },
  { label: 'Firma de Documentos', group: 'Gestiones con Cliente', color: '#10B981' },
  { label: 'Firma de Poder Notarial', group: 'Gestiones con Cliente', color: '#10B981' },
  { label: 'Firma en Notaría', group: 'Gestiones con Cliente', color: '#10B981' },

  // GESTIONES EXTERNAS
  { label: 'Sesión de Mediación', group: 'Gestiones Externas', color: '#8B5CF6' },
  { label: 'Sesión de Coordinación de Parentalidad', group: 'Gestiones Externas', color: '#8B5CF6' },
  { label: 'Reunión con Perito', group: 'Gestiones Externas', color: '#8B5CF6' },
  { label: 'Reunión con Procurador', group: 'Gestiones Externas', color: '#8B5CF6' },
  { label: 'Gestión en Registro Civil', group: 'Gestiones Externas', color: '#8B5CF6' },
  { label: 'Gestión en Registro de la Propiedad', group: 'Gestiones Externas', color: '#8B5CF6' },
  { label: 'Gestión Notarial', group: 'Gestiones Externas', color: '#8B5CF6' },
  { label: 'Presentación de Denuncia', group: 'Gestiones Externas', color: '#8B5CF6' },

  // INTERNO DEL DESPACHO
  { label: 'Reunión Interna', group: 'Interno Despacho', color: '#9CA3AF' },
  { label: 'Formación / Curso', group: 'Interno Despacho', color: '#9CA3AF' },
  { label: 'Guardia de Turno', group: 'Interno Despacho', color: '#9CA3AF' },
  { label: 'Otro', group: 'Interno Despacho', color: '#9CA3AF' },
];

export const getColorEvento = (label) => {
  const tipo = TIPOS_EVENTO.find(t => t.label === label);
  return tipo?.color || '#9CA3AF';
};
