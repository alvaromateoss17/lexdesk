export const SERIES_FACTURA = [
  { codigo: 'FAM', nombre: 'Familia', descripcion: 'Procedimientos de derecho de familia' },
  { codigo: 'CIV', nombre: 'Civil', descripcion: 'Procedimientos civiles' },
  { codigo: 'HON', nombre: 'Honorarios generales', descripcion: 'Honorarios sin expediente específico' },
  { codigo: 'PRO', nombre: 'Provisión de fondos', descripcion: 'Anticipos y provisiones de fondos' },
  { codigo: 'SUP', nombre: 'Suplidos y gastos', descripcion: 'Tasas judiciales, notaría, registro' },
  { codigo: 'REC', nombre: 'Factura rectificativa', descripcion: 'Corrección de facturas emitidas' },
  { codigo: 'GEN', nombre: 'General', descripcion: 'Otros servicios del despacho' },
];

export const generarNumeroFactura = (serie) => {
  try {
    const facturas = JSON.parse(localStorage.getItem('vincla_facturas') || '[]');
    const año = new Date().getFullYear();
    const deEstaSerie = facturas.filter(f => f.serie === serie && String(f.numero).includes(String(año)));
    const siguiente = String(deEstaSerie.length + 1).padStart(3, '0');
    return `${serie}-${año}-${siguiente}`;
  } catch {
    return `${serie}-${new Date().getFullYear()}-001`;
  }
};
