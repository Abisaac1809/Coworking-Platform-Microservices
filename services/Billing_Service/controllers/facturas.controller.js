const facturasService = require('../services/facturas.service');
const { validarCreacionFactura } = require('../validators/facturas.validator');

async function crearFactura(req, res, next) {
  try {
    validarCreacionFactura(req.body);
    const factura = await facturasService.crearFactura(req.body);

    return res.status(201).json(factura);
  } catch (error) {
    next(error);
  }
}

async function obtenerMiFactura(req, res, next) {
  try {
    const factura = await facturasService.obtenerFacturaPorId(Number(req.params.id));
    const userId = Number(req.headers['x-user-id']);
    const userRole = req.headers['x-user-role'];

    if (userRole !== 'admin' && factura.usuario_id !== userId) {
      return res.status(403).json({
        message: 'Forbidden',
      });
    }

    return res.status(200).json(factura);
  } catch (error) {
    next(error);
  }
}

async function listarMisFacturas(req, res, next) {
  try {
    const userId = Number(req.headers['x-user-id']);
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const order = req.query.order === 'asc' ? 'asc' : 'desc';

    const result = await facturasService.listarFacturasPorUsuario(userId, page, limit, order);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

async function listarTodasLasFacturas(req, res, next) {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const order = req.query.order === 'asc' ? 'asc' : 'desc';

    const result = await facturasService.listarTodasLasFacturas(page, limit, order);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

async function pagarFactura(req, res, next) {
  try {
    const factura = await facturasService.pagarFactura(Number(req.params.id));
    return res.status(200).json(factura);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  crearFactura,
  obtenerMiFactura,
  listarMisFacturas,
  listarTodasLasFacturas,
  pagarFactura,
};