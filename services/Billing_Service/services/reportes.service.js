const { pool } = require('../db/connection');

async function resumen() {
  const query = `
    SELECT
      COUNT(*)::int AS total_facturas,
      COALESCE(SUM(total), 0)::numeric(10,2) AS total_ingresos,
      COALESCE(AVG(total), 0)::numeric(10,2) AS promedio_factura,
      COALESCE(SUM(CASE WHEN estado = 'pendiente' THEN 1 ELSE 0 END), 0)::int AS pendientes_pago
    FROM facturas
  `;

  const result = await pool.query(query);
  return result.rows[0];
}

async function porEspacio() {
  const query = `
    SELECT
      espacio_id,
      COALESCE(SUM(total), 0)::numeric(10,2) AS total_ingresos,
      COUNT(*)::int AS usos
    FROM facturas
    GROUP BY espacio_id
    ORDER BY total_ingresos DESC
  `;

  const result = await pool.query(query);
  return result.rows;
}

async function porUsuario() {
  const query = `
    SELECT
      usuario_id,
      COALESCE(SUM(total), 0)::numeric(10,2) AS total_gastado,
      COUNT(*)::int AS reservas_facturadas
    FROM facturas
    GROUP BY usuario_id
    ORDER BY total_gastado DESC
  `;

  const result = await pool.query(query);
  return result.rows;
}

async function ingresosMensuales(meses) {
  const query = `
    SELECT
      TO_CHAR(creado_en, 'YYYY-MM') AS mes,
      COALESCE(SUM(total), 0)::numeric(10,2) AS total_ingresos
    FROM facturas
    WHERE creado_en >= NOW() - INTERVAL '1 month' * $1
    GROUP BY TO_CHAR(creado_en, 'YYYY-MM')
    ORDER BY mes ASC
  `;

  const result = await pool.query(query, [meses]);
  return result.rows;
}

async function topEspacios(top) {
  const query = `
    SELECT
      espacio_id,
      COALESCE(SUM(total), 0)::numeric(10,2) AS total_ingresos
    FROM facturas
    GROUP BY espacio_id
    ORDER BY total_ingresos DESC
    LIMIT $1
  `;

  const result = await pool.query(query, [top]);
  return result.rows;
}

module.exports = {
  resumen,
  porEspacio,
  porUsuario,
  ingresosMensuales,
  topEspacios,
};