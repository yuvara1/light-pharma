import axios from "axios";
import createLogger from "../utils/logger.js";

const logger = createLogger('TASKS_SERVICE');

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

function handleError(err) {
  logger.error('API Error', { 
    message: err?.response?.data?.error || err?.message,
    status: err?.response?.status
  });
  if (err?.response?.data) throw err.response.data;
  throw { error: err?.message || "Network error" };
}

export async function getTasks(token, sort) {
  try {
    logger.debug('Fetching tasks', { sort });
    const res = await api.get("/api/tasks", {
      params: { sort },
      headers: { Authorization: `Bearer ${token}` },
    });
    logger.info('Tasks fetched', { count: res.data.length });
    return res.data;
  } catch (e) {
    logger.error('Failed to fetch tasks', { error: e.message });
    return handleError(e);
  }
}

export async function getTask(token, id) {
  try {
    logger.debug('Fetching task', { taskId: id });
    const res = await api.get(`/api/tasks/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    logger.info('Task fetched', { taskId: res.data.id });
    return res.data;
  } catch (e) {
    logger.error('Failed to fetch task', { taskId: id, error: e.message });
    return handleError(e);
  }
}

export async function createTask(token, payload) {
  try {
    logger.debug('Creating task', { title: payload.title });
    const res = await api.post("/api/tasks", payload, {
      headers: { Authorization: `Bearer ${token}` },
    });
    logger.info('Task created', { taskId: res.data.id, title: res.data.title });
    return res.data;
  } catch (e) {
    logger.error('Failed to create task', { error: e.message });
    return handleError(e);
  }
}

export async function updateTask(token, id, payload) {
  try {
    logger.debug('Updating task', { taskId: id, fields: Object.keys(payload) });
    const res = await api.put(`/api/tasks/${id}`, payload, {
      headers: { Authorization: `Bearer ${token}` },
    });
    logger.info('Task updated', { taskId: res.data.id });
    return res.data;
  } catch (e) {
    logger.error('Failed to update task', { taskId: id, error: e.message });
    return handleError(e);
  }
}

export async function deleteTask(token, id) {
  try {
    logger.debug('Deleting task', { taskId: id });
    const res = await api.delete(`/api/tasks/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    logger.info('Task deleted', { taskId: id });
    return res.data;
  } catch (e) {
    logger.error('Failed to delete task', { taskId: id, error: e.message });
    return handleError(e);
  }
}
