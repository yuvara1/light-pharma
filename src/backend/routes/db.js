import express from 'express';
import createLogger from '../utils/logger.js';
import { getPool } from '../config/database.js';

const router = express.Router();
const logger = createLogger('DATABASE_ROUTES');

router.get('/api/db/describe/users', async (req, res, next) => {
  try {
    logger.debug('Describing users table');
    const pool = getPool();
    if (pool) {
      const [columns] = await pool.query('DESCRIBE users');
      logger.info('Users table described', { columnCount: columns.length });
      res.json({ table: 'users', columns });
    } else {
      logger.info('Users table described (in-memory schema)');
      res.json({ 
        table: 'users', 
        columns: [
          { Field: 'id', Type: 'INT', Null: 'NO', Key: 'PRI', Default: null, Extra: 'auto_increment' },
          { Field: 'email', Type: 'VARCHAR(255)', Null: 'NO', Key: 'UNI', Default: null, Extra: '' },
          { Field: 'phone', Type: 'VARCHAR(20)', Null: 'YES', Key: '', Default: null, Extra: '' },
          { Field: 'password', Type: 'VARCHAR(255)', Null: 'NO', Key: '', Default: null, Extra: '' },
          { Field: 'token', Type: 'VARCHAR(255)', Null: 'YES', Key: '', Default: null, Extra: '' },
          { Field: 'created_at', Type: 'DATETIME', Null: 'NO', Key: '', Default: 'CURRENT_TIMESTAMP', Extra: '' },
          { Field: 'updated_at', Type: 'DATETIME', Null: 'NO', Key: '', Default: 'CURRENT_TIMESTAMP', Extra: 'on update CURRENT_TIMESTAMP' },
        ]
      });
    }
  } catch (e) {
    logger.error('Error describing users table', { error: e.message });
    next(e);
  }
});

router.get('/api/db/describe/tasks', async (req, res, next) => {
  try {
    logger.debug('Describing tasks table');
    const pool = getPool();
    if (pool) {
      const [columns] = await pool.query('DESCRIBE tasks');
      logger.info('Tasks table described', { columnCount: columns.length });
      res.json({ table: 'tasks', columns });
    } else {
      logger.info('Tasks table described (in-memory schema)');
      res.json({ 
        table: 'tasks', 
        columns: [
          { Field: 'id', Type: 'INT', Null: 'NO', Key: 'PRI', Default: null, Extra: 'auto_increment' },
          { Field: 'user_id', Type: 'INT', Null: 'NO', Key: 'MUL', Default: null, Extra: '' },
          { Field: 'title', Type: 'VARCHAR(255)', Null: 'NO', Key: '', Default: null, Extra: '' },
          { Field: 'description', Type: 'TEXT', Null: 'YES', Key: '', Default: null, Extra: '' },
          { Field: 'category', Type: 'VARCHAR(100)', Null: 'YES', Key: '', Default: null, Extra: '' },
          { Field: 'priority', Type: 'VARCHAR(20)', Null: 'YES', Key: '', Default: null, Extra: '' },
          { Field: 'due_date', Type: 'DATE', Null: 'YES', Key: '', Default: null, Extra: '' },
          { Field: 'completed', Type: 'TINYINT(1)', Null: 'NO', Key: '', Default: '0', Extra: '' },
          { Field: 'created_at', Type: 'DATETIME', Null: 'NO', Key: '', Default: 'CURRENT_TIMESTAMP', Extra: '' },
          { Field: 'updated_at', Type: 'DATETIME', Null: 'NO', Key: '', Default: 'CURRENT_TIMESTAMP', Extra: 'on update CURRENT_TIMESTAMP' },
        ]
      });
    }
  } catch (e) {
    logger.error('Error describing tasks table', { error: e.message });
    next(e);
  }
});

router.get('/api/db/info', async (req, res, next) => {
  try {
    logger.debug('Fetching database info');
    const pool = getPool();
    if (pool) {
      const [databases] = await pool.query('SHOW DATABASES');
      const [tables] = await pool.query('SHOW TABLES');
      logger.info('Database info retrieved', { 
        databaseCount: databases.length,
        tableCount: tables.length,
        status: 'MySQL connected'
      });
      res.json({ 
        databases: databases.map(d => Object.values(d)[0]),
        tables: tables.map(t => Object.values(t)[0]),
        status: 'MySQL connected'
      });
    } else {
      logger.info('Database info retrieved (in-memory)');
      res.json({ 
        databases: [],
        tables: ['users (in-memory)', 'tasks (in-memory)'],
        status: 'Using in-memory stores'
      });
    }
  } catch (e) {
    logger.error('Error fetching database info', { error: e.message });
    next(e);
  }
});

export default router;