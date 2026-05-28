function validarCreacionFactura(body) {
  const {
    reservaId,
    usuarioId,
    espacioId,
    fechaInicio,
    fechaFin,
    precioHora,
  } = body;

  if (!reservaId || !usuarioId || !espacioId || !fechaInicio || !fechaFin || precioHora === undefined) {
    const error = new Error('Missing required fields');
    error.statusCode = 400;
    throw error;
  }

  if (typeof reservaId !== 'number' || typeof usuarioId !== 'number' || typeof espacioId !== 'number') {
    const error = new Error('reservaId, usuarioId and espacioId must be numbers');
    error.statusCode = 400;
    throw error;
  }

  if (typeof precioHora !== 'number' || precioHora <= 0) {
    const error = new Error('precioHora must be a positive number');
    error.statusCode = 400;
    throw error;
  }

  if (new Date(fechaInicio).toString() === 'Invalid Date' || new Date(fechaFin).toString() === 'Invalid Date') {
    const error = new Error('Invalid date format');
    error.statusCode = 400;
    throw error;
  }

  if (new Date(fechaFin) <= new Date(fechaInicio)) {
    const error = new Error('fechaFin must be greater than fechaInicio');
    error.statusCode = 400;
    throw error;
  }
}

module.exports = { validarCreacionFactura };