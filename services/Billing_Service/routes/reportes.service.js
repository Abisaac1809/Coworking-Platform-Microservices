const express = require('express');
const {
  obtenerResumen,
  obtenerPorEspacio,
  obtenerPorUsuario,
  obtenerIngresosMensuales,
  obtenerTopEspacios,
} = require('../controllers/reportes.controller');
const { requireRole } = require('../middlewares/role.middleware');

const router = express.Router();

router.get('/resumen', requireRole('admin'), obtenerResumen);
router.get('/por-espacio', requireRole('admin'), obtenerPorEspacio);
router.get('/por-usuario', requireRole('admin'), obtenerPorUsuario);
router.get('/ingresos-mensuales', requireRole('admin'), obtenerIngresosMensuales);
router.get('/top-espacios', requireRole('admin'), obtenerTopEspacios);

module.exports = router;