import React, { createContext, useContext, useEffect, useState } from "react";
import { 
  loginUser, 
  validateToken, 
  validateSession, 
  logoutUser,
  getCurrentUser,
  registerUser
} from "../services/authService.js";
import createLogger from "../utils/logger.js";

const logger = createLogger('AUTH_CONTEXT');

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sessionStatus, setSessionStatus] = useState("checking"); // checking, authenticated, unauthenticated

  // Check if user is authenticated on mount
  useEffect(() => {
    async function checkAuth() {
      try {
        setSessionStatus("checking");
        
        // Try to get current user first (works with both session and token)
        const currentUserData = await getCurrentUser();
        if (currentUserData?.user) {
          logger.info('Current user retrieved successfully', { userId: currentUserData.user.id });
          setUser(currentUserData.user);
          setSessionStatus("authenticated");
          setLoading(false);
          return;
        }

        // If no current user, try session-based auth
        if (!token) {
          logger.debug('Checking session-based authentication');
          const sessionData = await validateSession();
          if (sessionData?.user) {
            logger.info('Session authentication successful', { userId: sessionData.user.id });
            setUser(sessionData.user);
            setSessionStatus("authenticated");
            setLoading(false);
            return;
          }
        }

        // If session fails, try token-based auth
        if (token) {
          logger.debug('Validating token');
          const tokenData = await validateToken(token);
          if (tokenData?.user) {
            logger.info('Token validation successful', { userId: tokenData.user.id });
            setUser(tokenData.user);
            setSessionStatus("authenticated");
            setLoading(false);
            return;
          }
        }

        logger.debug('No valid authentication found');
        setUser(null);
        setToken(null);
        setSessionStatus("unauthenticated");
        localStorage.removeItem("token");
      } catch (err) {
        logger.error('Authentication check failed', { error: err?.error || err?.message });
        setUser(null);
        setToken(null);
        setSessionStatus("unauthenticated");
        localStorage.removeItem("token");
      } finally {
        setLoading(false);
      }
    }

    checkAuth();
  }, [token]);

  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      logger.debug('Login started', { email });
      
      const response = await loginUser(email, password);
      
      // Support both token-based and session-based responses
      if (response.token) {
        logger.debug('Token received from login');
        localStorage.setItem("token", response.token);
        setToken(response.token);
      }
      
      if (response.user) {
        logger.info('Login successful', { userId: response.user.id });
        setUser(response.user);
        setSessionStatus("authenticated");
      }
      
      return response;
    } catch (err) {
      logger.error('Login error', { error: err });
      const errorMsg = err?.error || err?.message || "Login failed";
      setError(errorMsg);
      setSessionStatus("unauthenticated");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (email, phone, password) => {
    try {
      setLoading(true);
      setError(null);
      logger.debug('Registration started', { email, phone });
      
      const response = await registerUser(email, phone, password);
      
      if (response.token) {
        logger.debug('Token received from registration');
        localStorage.setItem("token", response.token);
        setToken(response.token);
      }
      
      if (response.user) {
        logger.info('Registration successful', { userId: response.user.id });
        setUser(response.user);
        setSessionStatus("authenticated");
      }
      
      return response;
    } catch (err) {
      logger.error('Registration error', { error: err });
      const errorMsg = err?.error || err?.message || "Registration failed";
      setError(errorMsg);
      setSessionStatus("unauthenticated");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      logger.debug('Logout started');
      
      await logoutUser();
      
      logger.info('Logout successful');
      setUser(null);
      setToken(null);
      setSessionStatus("unauthenticated");
      setError(null);
      localStorage.removeItem("token");
    } catch (err) {
      logger.error('Logout error', { error: err });
      // Clear auth state even if logout fails
      setUser(null);
      setToken(null);
      setSessionStatus("unauthenticated");
      localStorage.removeItem("token");
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => setError(null);

  const isAuthenticated = !!user && sessionStatus === "authenticated";
  const isSessionValid = sessionStatus === "authenticated";

  return (
    <AuthContext.Provider value={{ 
      user, 
      token, 
      loading, 
      error,
      sessionStatus,
      login,
      register,
      logout, 
      clearError,
      isAuthenticated,
      isSessionValid
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}

