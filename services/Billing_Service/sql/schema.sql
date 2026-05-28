CREATE TABLE IF NOT EXISTS facturas (
  id SERIAL PRIMARY KEY,
  reserva_id INTEGER NOT NULL UNIQUE,
  usuario_id INTEGER NOT NULL,
  espacio_id INTEGER NOT NULL,
  fecha_inicio TIMESTAMP NOT NULL,
  fecha_fin TIMESTAMP NOT NULL,
  horas DECIMAL(5,2) NOT NULL,
  precio_hora DECIMAL(10,2) NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  impuesto DECIMAL(10,2) NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  estado VARCHAR(20) DEFAULT 'pendiente',
  creado_en TIMESTAMP DEFAULT NOW()
);