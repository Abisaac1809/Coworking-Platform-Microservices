function calcularHoras(fechaInicio, fechaFin) {
  const inicio = new Date(fechaInicio);
  const fin = new Date(fechaFin);

  const diferenciaMs = fin.getTime() - inicio.getTime();

  if (Number.isNaN(inicio.getTime()) || Number.isNaN(fin.getTime())) {
    throw new Error('Invalid date format');
  }

  if (diferenciaMs <= 0) {
    throw new Error('fechaFin must be greater than fechaInicio');
  }

  const horas = diferenciaMs / 3600000;
  return Number(horas.toFixed(2));
}

function calcularSubtotal(horas, precioHora) {
  return Number((horas * precioHora).toFixed(2));
}

function calcularImpuesto(subtotal) {
  return Number((subtotal * 0.16).toFixed(2));
}

function calcularTotal(subtotal, impuesto) {
  return Number((subtotal + impuesto).toFixed(2));
}

module.exports = {
  calcularHoras,
  calcularSubtotal,
  calcularImpuesto,
  calcularTotal,
};