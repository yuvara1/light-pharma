import createLogger from '../utils/logger.js';
import { findUserByToken } from '../services/userService.js';

const logger = createLogger('AUTH_MIDDLEWARE');

export function parseBearer(req) {
  const h = req.headers.authorization;
  if (!h) return null;
  const parts = h.split(' ');
  if (parts.length === 2 && /^Bearer$/i.test(parts[0])) return parts[1];
  logger.warn('Invalid auth header format');
  return null;
}

export async function authRequired(req, res, next) {
  try {
    const token = parseBearer(req);
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    const user = await findUserByToken(token);
    if (!user) {
      logger.warn('Invalid token');
      return res.status(401).json({ error: 'Invalid token' });
    }
    
    req.user = { id: user.id, email: user.email };
    req.token = token;
    next();
  } catch (e) {
    logger.error('Auth error', { error: e.message });
    next(e);
  }
}