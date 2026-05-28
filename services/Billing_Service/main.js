const express = require('express');
require('dotenv').config();

const { pool } = require('./db/connection');
const facturasRoutes = require('./routes/facturas.routes');
const reportesRoutes = require('./routes/reportes.routes');

const app = express();
const port = process.env.PORT || 8000;

app.use(express.json());

app.get('/health', async (req, res) => {
  let dbStatus = 'disconnected';
  try {
    await pool.query('SELECT 1');
    dbStatus = 'connected';
  } catch (err) {
    console.error('Database health check failed:', err);
    dbStatus = 'error';
  }

  res.status(200).json({
    status: 'healthy',
    service: 'BillingService',
    database: dbStatus
  });
});

app.use('/facturas', facturasRoutes);
app.use('/reportes', reportesRoutes);

app.use((err, req, res, next) => {
  console.error(err);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({ message });
});

app.listen(port, () => {
  console.log(`Billing Service listening on port ${port}`);
});
