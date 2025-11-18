import express from 'express';
import createLogger from '../utils/logger.js';
import { authRequired } from '../middleware/auth.js';
import { getTasksService, createTaskService, updateTaskService, deleteTaskService } from '../services/taskService.js';
import { validateTaskPayload } from '../utils/validation.js';

const router = express.Router();
const logger = createLogger('TASKS');

router.get('/api/tasks', authRequired, async (req, res, next) => {
  try {
    const sort = req.query.sort;
    const tasks = await getTasksService(req.user.id, sort);
    res.json(tasks);
  } catch (e) {
    logger.error('Failed to fetch tasks', { error: e.message });
    next(e);
  }
});

router.get('/api/tasks/:id', authRequired, async (req, res, next) => {
  try {
    const tasks = await getTasksService(req.user.id);
    const t = tasks.find(x => String(x.id) === String(req.params.id));
    if (!t) {
      return res.status(404).json({ error: 'Not found' });
    }
    res.json(t);
  } catch (e) {
    logger.error('Failed to fetch task', { error: e.message });
    next(e);
  }
});

router.post('/api/tasks', authRequired, async (req, res, next) => {
  try {
    const payload = req.body;
    const { valid, errors } = validateTaskPayload(payload, { requireTitle: true });
    if (!valid) {
      return res.status(400).json({ errors });
    }
    const created = await createTaskService(req.user.id, payload);
    res.status(201).json(created);
  } catch (e) {
    logger.error('Failed to create task', { error: e.message });
    next(e);
  }
});

router.put('/api/tasks/:id', authRequired, async (req, res, next) => {
  try {
    const payload = req.body;
    const { valid, errors } = validateTaskPayload(payload);
    if (!valid) {
      return res.status(400).json({ errors });
    }
    const updated = await updateTaskService(req.user.id, req.params.id, payload);
    res.json(updated);
  } catch (e) {
    logger.error('Failed to update task', { error: e.message });
    next(e);
  }
});

router.delete('/api/tasks/:id', authRequired, async (req, res, next) => {
  try {
    const result = await deleteTaskService(req.user.id, req.params.id);
    res.json(result);
  } catch (e) {
    logger.error('Failed to delete task', { error: e.message });
    next(e);
  }
});

export default router;