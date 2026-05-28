const { pool } = require('../db/connection');

async function crearFactura(data) {
  const query = `
    INSERT INTO facturas (
      reserva_id,
      usuario_id,
      espacio_id,
      fecha_inicio,
      fecha_fin,
      horas,
      precio_hora,
      subtotal,
      impuesto,
      total,
      estado
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    RETURNING *
  `;

  const values = [
    data.reservaId,
    data.usuarioId,
    data.espacioId,
    data.fechaInicio,
    data.fechaFin,
    data.horas,
    data.precioHora,
    data.subtotal,
    data.impuesto,
    data.total,
    'pendiente',
  ];

  const result = await pool.query(query, values);
  return result.rows[0];
}

async function obtenerFacturaPorId(id) {
  const query = `SELECT * FROM facturas WHERE id = $1`;
  const result = await pool.query(query, [id]);
  return result.rows[0] || null;
}

async function obtenerFacturaPorReservaId(reservaId) {
  const query = `SELECT * FROM facturas WHERE reserva_id = $1`;
  const result = await pool.query(query, [reservaId]);
  return result.rows[0] || null;
}

async function listarFacturasPorUsuario(usuarioId, limit, offset, order) {
  const query = `
    SELECT id, reserva_id, total, fecha_inicio, estado
    FROM facturas
    WHERE usuario_id = $1
    ORDER BY fecha_inicio ${order.toUpperCase()}
    LIMIT $2 OFFSET $3
  `;

  const result = await pool.query(query, [usuarioId, limit, offset]);
  return result.rows;
}

async function contarFacturasPorUsuario(usuarioId) {
  const query = `SELECT COUNT(*)::int AS total FROM facturas WHERE usuario_id = $1`;
  const result = await pool.query(query, [usuarioId]);
  return result.rows[0].total;
}

async function listarTodasLasFacturas(limit, offset, order) {
  const query = `
    SELECT id, reserva_id, usuario_id, espacio_id, total, fecha_inicio, estado
    FROM facturas
    ORDER BY fecha_inicio ${order.toUpperCase()}
    LIMIT $1 OFFSET $2
  `;

  const result = await pool.query(query, [limit, offset]);
  return result.rows;
}

async function contarTodasLasFacturas() {
  const query = `SELECT COUNT(*)::int AS total FROM facturas`;
  const result = await pool.query(query);
  return result.rows[0].total;
}

async function marcarFacturaComoPagada(id) {
  const query = `
    UPDATE facturas
    SET estado = 'pagada'
    WHERE id = $1
    RETURNING id, estado
  `;

  const result = await pool.query(query, [id]);
  return result.rows[0] || null;
}

module.exports = {
  crearFactura,
  obtenerFacturaPorId,
  obtenerFacturaPorReservaId,
  listarFacturasPorUsuario,
  contarFacturasPorUsuario,
  listarTodasLasFacturas,
  contarTodasLasFacturas,
  marcarFacturaComoPagada,
};