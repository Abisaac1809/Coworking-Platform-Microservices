const {
  calcularHoras,
  calcularSubtotal,
  calcularImpuesto,
  calcularTotal,
} = require('../utils/calculos');

const facturasRepository = require('../repositories/facturas.repository');

async function crearFactura(data) {
  const facturaExistente = await facturasRepository.obtenerFacturaPorReservaId(data.reservaId);

  if (facturaExistente) {
    const error = new Error('Invoice already exists for this reservation');
    error.statusCode = 409;
    throw error;
  }

  const horas = calcularHoras(data.fechaInicio, data.fechaFin);
  const subtotal = calcularSubtotal(horas, data.precioHora);
  const impuesto = calcularImpuesto(subtotal);
  const total = calcularTotal(subtotal, impuesto);

  const facturaCreada = await facturasRepository.crearFactura({
    ...data,
    horas,
    subtotal,
    impuesto,
    total,
  });

  return facturaCreada;
}

async function obtenerFacturaPorId(id) {
  const factura = await facturasRepository.obtenerFacturaPorId(id);

  if (!factura) {
    const error = new Error('Factura not found');
    error.statusCode = 404;
    throw error;
  }

  return factura;
}

async function listarFacturasPorUsuario(usuarioId, page, limit, order) {
  const offset = (page - 1) * limit;
  const facturas = await facturasRepository.listarFacturasPorUsuario(usuarioId, limit, offset, order);
  const total = await facturasRepository.contarFacturasPorUsuario(usuarioId);

  return {
    pagina: page,
    limite: limit,
    total,
    facturas,
  };
}

async function listarTodasLasFacturas(page, limit, order) {
  const offset = (page - 1) * limit;
  const facturas = await facturasRepository.listarTodasLasFacturas(limit, offset, order);
  const total = await facturasRepository.contarTodasLasFacturas();

  return {
    pagina: page,
    limite: limit,
    total,
    facturas,
  };
}

async function pagarFactura(id) {
  const factura = await facturasRepository.marcarFacturaComoPagada(id);

  if (!factura) {
    const error = new Error('Factura not found');
    error.statusCode = 404;
    throw error;
  }

  return factura;
}

module.exports = {
  crearFactura,
  obtenerFacturaPorId,
  listarFacturasPorUsuario,
  listarTodasLasFacturas,
  pagarFactura,
};