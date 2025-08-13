// middleware/auth.js
import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET || 'mySecretKey';

export function authenticate(req, res, next) {
  const hdr = req.headers.authorization || '';
  if (!hdr.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }
  const token = hdr.slice(7);

  try {
    const decoded = jwt.verify(token, SECRET); // decoded יכול להכיל id / userId / uid
    const uidRaw = decoded.id ?? decoded.userId ?? decoded.uid;
    if (uidRaw == null) {
      return res.status(401).json({ error: 'Token missing user id' });
    }
    const idNum = Number(uidRaw);
    req.user = {
      id: Number.isNaN(idNum) ? uidRaw : idNum, // נורמליזציה
      role: decoded.role ?? decoded.type ?? 'customer'
    };
    return next();
  } catch (e) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}
