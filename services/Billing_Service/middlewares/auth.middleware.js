const jwt = require('jsonwebtoken');

const SECRET_KEY = process.env.SECRET_KEY ?? 'clave-ultra-secreta';

function authenticate(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: 'Missing token' });
  }

  try {
    const payload = jwt.verify(token, SECRET_KEY);
    req.user = {
      id: payload.sub,
      role: payload.role.toLowerCase(),
    };
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}

module.exports = { authenticate };
