import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import createLogger from './utils/logger.js';

import('dotenv/config').catch(() => {});

import { initDatabase } from './config/database.js';
import authRoutes from './routes/auth.js';
import taskRoutes from './routes/tasks.js';
import dbRoutes from './routes/db.js';

const logger = createLogger('SERVER');
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Morgan HTTP request logging - only log errors and slow requests
app.use(morgan((tokens, req, res) => {
  const status = tokens.status(req, res);
  const method = tokens.method(req, res);
  const url = tokens.url(req, res);
  const responseTime = parseInt(tokens['response-time'](req, res)) || 0;
  
  // Only log errors (4xx, 5xx) and slow requests (>1000ms)
  if (status >= 400 || responseTime > 1000) {
    const color = status >= 500 ? '\x1b[31m' : status >= 400 ? '\x1b[33m' : '\x1b[32m';
    const reset = '\x1b[0m';
    return `${color}[${new Date().toISOString()}] ${method} ${url} ${status} ${responseTime}ms${reset}`;
  }
  return null;
}));

logger.info('Initializing Light Pharma API...');

// Initialize database
await initDatabase();

// Routes
app.use(authRoutes);
app.use(taskRoutes);
app.use(dbRoutes);

app.get('/', (req, res) => {
  res.json({ 
    message: 'Light Pharma API is running',
    endpoints: {
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login'
      },
      tasks: {
        list: 'GET /api/tasks',
        get: 'GET /api/tasks/:id',
        create: 'POST /api/tasks',
        update: 'PUT /api/tasks/:id',
        delete: 'DELETE /api/tasks/:id'
      },
      database: {
        info: 'GET /api/db/info',
        describeUsers: 'GET /api/db/describe/users',
        describeTasks: 'GET /api/db/describe/tasks'
      }
    }
  });
});

// Error handler with logging
app.use((err, req, res, next) => {
  logger.error('Error', { 
    message: err.message, 
    status: err.status || 500,
    path: req.path,
    method: req.method
  });
  const status = err && err.status ? err.status : 500;
  const body = err && err.error ? err : { error: err && err.message ? err.message : 'Internal server error' };
  res.status(status).json(body);
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => {
    logger.info(`Server running on port ${port}`);
  });
}

export default app;