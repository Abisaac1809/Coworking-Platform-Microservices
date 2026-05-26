const express = require('express');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 8000;

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

app.use(express.json());

// Health check endpoint
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
    database: dbStatus
  });
});

app.listen(port, () => {
  console.log(`Billing Service listening on port ${port}`);
});
