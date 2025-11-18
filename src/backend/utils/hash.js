import crypto from 'crypto';

export function hash(plain) {
  const salt = process.env.PASSWORD_SALT || 'light-pharma-salt';
  return crypto.createHmac('sha256', salt).update(String(plain)).digest('hex');
}

export function genToken() {
  return crypto.randomBytes(24).toString('hex');
}