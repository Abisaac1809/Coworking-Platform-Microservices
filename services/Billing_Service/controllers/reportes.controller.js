const reportesService = require('../services/reportes.service');

async function obtenerResumen(req, res, next) {
  try {
    const data = await reportesService.resumen();
    return res.status(200).json(data);
  } catch (error) {
    next(error);
  }
}

async function obtenerPorEspacio(req, res, next) {
  try {
    const data = await reportesService.porEspacio();
    return res.status(200).json(data);
  } catch (error) {
    next(error);
  }
}

async function obtenerPorUsuario(req, res, next) {
  try {
    const data = await reportesService.porUsuario();
    return res.status(200).json(data);
  } catch (error) {
    next(error);
  }
}

async function obtenerIngresosMensuales(req, res, next) {
  try {
    const meses = Number(req.query.meses) || 6;
    const data = await reportesService.ingresosMensuales(meses);

    return res.status(200).json({
      meses_analizados: meses,
      datos: data,
    });
  } catch (error) {
    next(error);
  }
}

async function obtenerTopEspacios(req, res, next) {
  try {
    const top = Number(req.query.top) || 5;
    const data = await reportesService.topEspacios(top);
    return res.status(200).json(data);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  obtenerResumen,
  obtenerPorEspacio,
  obtenerPorUsuario,
  obtenerIngresosMensuales,
  obtenerTopEspacios,
};