import axios from "axios";
import createLogger from "../utils/logger.js";

const logger = createLogger('AUTH_SERVICE');

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: { "Content-Type": "application/json" },

});

function handleError(err) {
  logger.error('API Error', { 
    message: err?.response?.data?.error || err?.message,
    status: err?.response?.status,
    endpoint: err?.config?.url
  });
  if (err?.response?.data) throw err.response.data;
  throw { error: err?.message || "Network error" };
}

export async function loginUser(email, password) {
  try {
    logger.debug('Attempting login', { email });
    const res = await api.post("/api/auth/login", { email, password });
    logger.info('Login successful', { email, userId: res.data.user?.id });
    // Session is stored in httpOnly cookie automatically
    return res.data;
  } catch (e) {
    logger.error('Login failed', { email, error: e.message });
    return handleError(e);
  }
}

export async function registerUser(email, phone, password) {
  try {
    logger.debug('Attempting registration', { email, phone });
    const res = await api.post("/api/auth/register", {
      email,
      phone,
      password,
    });
    logger.info('Registration successful', { email, userId: res.data.id });
    return res.data;
  } catch (e) {
    logger.error('Registration failed', { email, error: e.message });
    return handleError(e);
  }
}

export async function logoutUser() {
  try {
    logger.debug('Attempting logout');
    const res = await api.post("/api/auth/logout");
    logger.info('Logout successful');
    // Session cookie is cleared on server
    return res.data;
  } catch (e) {
    logger.error('Logout failed', { error: e.message });
    return handleError(e);
  }
}

export async function validateToken(token) {
  try {
    logger.debug('Validating token', { tokenPrefix: token?.substring(0, 10) });
    const res = await api.get("/api/auth/validate", {
      headers: { Authorization: `Bearer ${token}` },
    });
    logger.info('Token validation successful');
    return res.data;
  } catch (e) {
    logger.error('Token validation failed', { error: e.message });
    return handleError(e);
  }
}

export async function validateSession() {
  try {
    logger.debug('Validating session');
    const res = await api.get("/api/auth/session");
    logger.info('Session validation successful', { userId: res.data.user?.id });
    return res.data;
  } catch (e) {
    logger.error('Session validation failed', { error: e.message });
    return handleError(e);
  }
}

// Get current user from session or token
export async function getCurrentUser() {
  try {
    logger.debug('Fetching current user');
    const token = localStorage.getItem("token");
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    
    const res = await api.get("/api/auth/me", { headers });
    logger.info('Current user fetched', { userId: res.data.user?.id });
    return res.data;
  } catch (e) {
    logger.error('Failed to fetch current user', { error: e.message });
    // Return null user instead of throwing for graceful degradation
    return { user: null };
  }
}

export default api;