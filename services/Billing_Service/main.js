const express = require('express');
const { Pool } = require('pg');
require('dotenv').config();

const { authenticate } = require('./middlewares/auth.middleware');
const facturasRouter = require('./routes/facturas.routes');
const reportesRouter = require('./routes/reportes.service');

const app = express();
const port = process.env.PORT || 8000;

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

app.use(express.json());

app.get('/health', async (req, res) => {
  let dbStatus = 'disconnected';
  if (pool) {
    try {
      const client = await pool.connect();
      await client.query('SELECT 1');
      client.release();
      dbStatus = 'connected';
    } catch (err) {
      console.error('Database health check failed:', err);
      dbStatus = 'error';
    }
  }

  res.status(200).json({
    status: 'healthy',
    service: 'BillingService',
    database: dbStatus,
  });
});

app.use(authenticate);

app.use('/facturas', facturasRouter);
app.use('/reportes', reportesRouter);

app.listen(port, () => {
  console.log(`Billing Service listening on port ${port}`);
});
