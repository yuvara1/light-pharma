import createLogger from '../utils/logger.js';
import { getPool } from '../config/database.js';

const logger = createLogger('TASK_SERVICE');
const memTasks = [];
let memNextTaskId = 1;

function mapRowToTask(row) {
  return {
    id: row.id,
    user_id: row.user_id,
    title: row.title,
    description: row.description,
    category: row.category,
    priority: row.priority,
    due_date: row.due_date ? (row.due_date instanceof Date ? row.due_date.toISOString().slice(0, 10) : row.due_date) : null,
    completed: Number(row.completed),
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

export async function getTasksService(userId, sort) {
  try {
    const pool = getPool();
    if (pool) {
      const [rows] = await pool.query('SELECT * FROM tasks WHERE user_id = ? ORDER BY id DESC', [userId]);
      let arr = rows.map(mapRowToTask);
      
      if (sort === 'due') {
        arr.sort((a, b) => {
          if (!a.due_date) return 1;
          if (!b.due_date) return -1;
          return new Date(a.due_date) - new Date(b.due_date);
        });
      } else if (sort === 'priority') {
        const rank = { High: 1, Medium: 2, Low: 3 };
        arr.sort((a, b) => (rank[a.priority] || 99) - (rank[b.priority] || 99));
      }
      
      return arr;
    } else {
      let arr = memTasks.filter(t => t.user_id === userId);
      
      if (sort === 'due') {
        arr.sort((a, b) => {
          if (!a.due_date) return 1;
          if (!b.due_date) return -1;
          return new Date(a.due_date) - new Date(b.due_date);
        });
      } else if (sort === 'priority') {
        const rank = { High: 1, Medium: 2, Low: 3 };
        arr.sort((a, b) => (rank[a.priority] || 99) - (rank[b.priority] || 99));
      }
      
      return arr;
    }
  } catch (e) {
    logger.error('Error fetching tasks', { error: e.message });
    throw e;
  }
}

export async function createTaskService(userId, payload) {
  try {
    const pool = getPool();
    if (pool) {
      const { title = '', description = '', category = null, priority = 'Medium', due_date = null, completed = 0 } = payload;
      
      const [result] = await pool.query(
        'INSERT INTO tasks (user_id, title, description, category, priority, due_date, completed) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [userId, title, description, category, priority, due_date || null, Number(completed)]
      );
      
      const [rows] = await pool.query('SELECT * FROM tasks WHERE id = ?', [result.insertId]);
      return mapRowToTask(rows[0]);
    } else {
      const item = {
        id: memNextTaskId++,
        user_id: userId,
        title: payload.title || '',
        description: payload.description || '',
        category: payload.category || 'Other',
        priority: payload.priority || 'Medium',
        due_date: payload.due_date || null,
        completed: payload.completed ? Number(payload.completed) : 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      memTasks.push(item);
      return item;
    }
  } catch (e) {
    logger.error('Error creating task', { error: e.message });
    throw e;
  }
}

export async function updateTaskService(userId, id, payload) {
  try {
    const pool = getPool();
    if (pool) {
      const [checkRows] = await pool.query('SELECT user_id FROM tasks WHERE id = ?', [id]);
      if (!checkRows.length || checkRows[0].user_id !== userId) {
        throw { status: 403, error: 'Not authorized' };
      }
      
      const keys = [];
      const vals = [];
      for (const k of ['title', 'description', 'category', 'priority', 'due_date', 'completed']) {
        if (Object.prototype.hasOwnProperty.call(payload, k)) {
          keys.push(`${k} = ?`);
          vals.push(k === 'completed' ? Number(payload[k]) : payload[k]);
        }
      }
      
      if (keys.length) {
        vals.push(id);
        await pool.query(`UPDATE tasks SET ${keys.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`, vals);
      }
      
      const [rows] = await pool.query('SELECT * FROM tasks WHERE id = ?', [id]);
      if (!rows.length) throw { status: 404, error: 'Not found' };
      
      return mapRowToTask(rows[0]);
    } else {
      const idx = memTasks.findIndex(t => t.id == id && t.user_id === userId);
      if (idx === -1) {
        throw { status: 404, error: 'Not found' };
      }
      memTasks[idx] = { ...memTasks[idx], ...payload, updated_at: new Date().toISOString() };
      return memTasks[idx];
    }
  } catch (e) {
    logger.error('Error updating task', { error: e.message });
    throw e;
  }
}

export async function deleteTaskService(userId, id) {
  try {
    const pool = getPool();
    if (pool) {
      const [checkRows] = await pool.query('SELECT user_id FROM tasks WHERE id = ?', [id]);
      if (!checkRows.length || checkRows[0].user_id !== userId) {
        throw { status: 403, error: 'Not authorized' };
      }
      
      await pool.query('DELETE FROM tasks WHERE id = ?', [id]);
      return { success: true };
    } else {
      const idx = memTasks.findIndex(t => t.id == id && t.user_id === userId);
      if (idx === -1) {
        throw { status: 404, error: 'Not found' };
      }
      memTasks.splice(idx, 1);
      return { success: true };
    }
  } catch (e) {
    logger.error('Error deleting task', { error: e.message });
    throw e;
  }
}