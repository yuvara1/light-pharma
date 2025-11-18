import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import createLogger from '../utils/logger.js';

const logger = createLogger('DATABASE');
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let pool = null;

export async function initDatabase() {
  try {
    const mysqlUrl = process.env.MYSQL_PUBLIC_URL || "mysql://avnadmin:AVNS_tmnok01yVJbBAV4f9kb@light-pharma-light-pharma.j.aivencloud.com:17362/defaultdb?ssl-mode=REQUIRED";
    logger.debug('MYSQL URL configured', { url: mysqlUrl.substring(0, 40) + '...' });
    
    if (!mysqlUrl) {
      logger.warn('MYSQL_PUBLIC_URL not set. Using in-memory stores.');
      throw new Error('No database URL provided');
    }
    
    logger.info('Attempting to connect to Aiven MySQL...');
    const url = new URL(mysqlUrl);
    
    // Read CA certificate
    const caCertPath = path.join(__dirname, '../../certs/ca.pem');
    let ca;
    try {
      ca = fs.readFileSync(caCertPath, 'utf8');
      logger.info('✓ CA certificate loaded', { path: caCertPath });
    } catch (err) {
      logger.warn('⚠️ CA certificate not found. Attempting connection without CA...', { path: caCertPath });
      ca = undefined;
    }
    
    const config = {
      host: url.hostname,
      port: parseInt(url.port) || 3306,
      user: url.username,
      password: url.password,
      database: url.pathname.slice(1),
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      enableKeepAlive: true,
      ssl: ca ? { ca: ca, rejectUnauthorized: true } : true,
    };
    
    logger.debug('Database config', {
      host: config.host,
      port: config.port,
      database: config.database,
      ssl: typeof config.ssl === 'boolean' ? config.ssl : 'with CA certificate',
    });
    
    pool = mysql.createPool(config);
    
    // Test connection
    logger.debug('Testing database connection...');
    const connection = await pool.getConnection();
    const [rows] = await connection.query('SELECT 1 as test');
    logger.info('✓ MySQL connection successful');
    connection.release();
    
    // Create users table
    logger.debug('Creating users table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT PRIMARY KEY AUTO_INCREMENT,
        email VARCHAR(255) UNIQUE NOT NULL,
        phone VARCHAR(20),
        password VARCHAR(255) NOT NULL,
        token VARCHAR(255),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      );
    `);
    logger.info('✓ Users table ready');
    
    // Create tasks table
    logger.debug('Creating tasks table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS tasks (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        category VARCHAR(100),
        priority VARCHAR(20),
        due_date DATE NULL,
        completed TINYINT(1) DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_tasks_user_id (user_id)
      );
    `);
    logger.info('✓ Tasks table ready');
    logger.info('✓✓✓ MySQL initialization complete');
    
  } catch (e) {
    pool = null;
    logger.error('MySQL Connection Error', { 
      message: e.message,
      code: e.code,
      errno: e.errno,
      stack: e.stack
    });
    logger.warn('Falling back to in-memory stores. Data will not persist.');
  }
}

export function getPool() {
  return pool;
}