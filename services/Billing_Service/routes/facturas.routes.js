const express = require('express');
const {
  crearFactura,
  obtenerMiFactura,
  listarMisFacturas,
  listarTodasLasFacturas,
  pagarFactura,
} = require('../controllers/facturas.controller');
const { requireRole } = require('../middlewares/role.middleware');

const router = express.Router();

router.post('/', requireRole('admin'), crearFactura);
router.get('/mis-facturas', requireRole('user', 'admin'), listarMisFacturas);
router.get('/:id', requireRole('user', 'admin'), obtenerMiFactura);
router.get('/', requireRole('admin'), listarTodasLasFacturas);
router.patch('/:id/pagar', requireRole('admin'), pagarFactura);

module.exports = router;