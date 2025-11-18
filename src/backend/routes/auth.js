import express from 'express';
import createLogger from '../utils/logger.js';
import { genToken } from '../utils/hash.js';
import { createUser, verifyUser, attachTokenToUser, findUserById } from '../services/userService.js';
import { authRequired } from '../middleware/auth.js';

const router = express.Router();
const logger = createLogger('AUTH');

router.post('/api/auth/register', async (req, res, next) => {
  try {
    const { email, password, phone } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'email and password required' });
    }
    
    const u = await createUser({ email, password, phone });
    logger.info('User registered', { userId: u.id });
    res.status(201).json(u);
  } catch (e) {
    logger.error('Registration failed', { error: e.message });
    next(e);
  }
});

router.post('/api/auth/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'email and password required' });
    }
    
    const user = await verifyUser({ email, password });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const token = genToken();
    await attachTokenToUser(user.id, token);
    logger.info('User logged in', { userId: user.id });
    res.json({ token, user: { id: user.id, email: user.email } });
  } catch (e) {
    logger.error('Login failed', { error: e.message });
    next(e);
  }
});

router.post('/api/auth/logout', authRequired, async (req, res, next) => {
  try {
    logger.info('User logged out', { userId: req.user.id });
    res.json({ success: true });
  } catch (e) {
    logger.error('Logout failed', { error: e.message });
    next(e);
  }
});

router.get('/api/auth/me', authRequired, async (req, res, next) => {
  try {
    const user = await findUserById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    logger.info('Current user retrieved', { userId: user.id });
    res.json({ user: { id: user.id, email: user.email, phone: user.phone } });
  } catch (e) {
    logger.error('Failed to get current user', { error: e.message });
    next(e);
  }
});

router.get('/api/auth/validate', authRequired, async (req, res, next) => {
  try {
    const user = await findUserById(req.user.id);
    logger.info('Token validated', { userId: user.id });
    res.json({ user: { id: user.id, email: user.email } });
  } catch (e) {
    logger.error('Token validation failed', { error: e.message });
    next(e);
  }
});

router.get('/api/auth/session', async (req, res, next) => {
  try {
    // For session-based auth - check if user is authenticated via cookies
    // This is a placeholder - implement based on your session strategy
    res.status(401).json({ error: 'No session found' });
  } catch (e) {
    logger.error('Session validation failed', { error: e.message });
    next(e);
  }
});

export default router;