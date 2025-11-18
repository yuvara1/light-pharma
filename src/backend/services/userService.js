import createLogger from '../utils/logger.js';
import { getPool } from '../config/database.js';
import { hash } from '../utils/hash.js';

const logger = createLogger('USER_SERVICE');
const users = [];
let nextUserId = 1;

export async function createUser({ email, password, phone }) {
  if (!email || !password) {
    throw { status: 400, error: 'email and password required' };
  }
  
  const pool = getPool();
  if (pool) {
    try {
      const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
      if (existing.length > 0) {
        throw { status: 400, error: 'Email already registered' };
      }
      
      const [result] = await pool.query(
        'INSERT INTO users (email, phone, password) VALUES (?, ?, ?)',
        [email, phone || '', hash(password)]
      );
      const [rows] = await pool.query('SELECT id, email, phone FROM users WHERE id = ?', [result.insertId]);
      return rows[0];
    } catch (e) {
      throw e.status ? e : { status: 400, error: e.message };
    }
  } else {
    if (users.find(u => u.email === email)) {
      throw { status: 400, error: 'Email already registered' };
    }
    const user = { id: nextUserId++, email, phone: phone || '', password: hash(password), token: null, created_at: new Date().toISOString() };
    users.push(user);
    return { id: user.id, email: user.email, phone: user.phone };
  }
}

export async function findUserByEmail(email) {
  const pool = getPool();
  if (pool) {
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0] || null;
  }
  return users.find(u => u.email === email) || null;
}

export async function findUserByToken(token) {
  const pool = getPool();
  if (pool) {
    const [rows] = await pool.query('SELECT * FROM users WHERE token = ?', [token]);
    return rows[0] || null;
  }
  return users.find(u => u.token === token) || null;
}

export async function findUserById(id) {
  const pool = getPool();
  if (pool) {
    const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
    return rows[0] || null;
  }
  return users.find(u => u.id === id) || null;
}

export async function verifyUser({ email, password }) {
  const user = await findUserByEmail(email);
  if (!user) {
    return null;
  }
  if (user.password !== hash(password)) {
    return null;
  }
  return user;
}

export async function attachTokenToUser(userId, token) {
  const pool = getPool();
  if (pool) {
    await pool.query('UPDATE users SET token = ? WHERE id = ?', [token, userId]);
    return await findUserById(userId);
  } else {
    const u = users.find(u => u.id === userId);
    if (u) u.token = token;
    return u;
  }
}