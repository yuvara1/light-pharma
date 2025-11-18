import React from "react";
import { BrowserRouter as Router, Routes as RouterRoutes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./Auth/Login";
import Register from "./Auth/Register";
import Dashboard from "./Dashboard/Dashboard";
import Tasklist from "./Tasks/Tasklist";
import Taskdetail from "./Tasks/Taskdetail";

function AppRoutes() {
  return (
    <Router>
      <AuthProvider>
        <RouterRoutes>
          {/* Public routes - only accessible without auth */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected routes - only authenticated users */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route 
            path="/tasks"
            element={
              <ProtectedRoute>
                <Tasklist />
              </ProtectedRoute>
            }
          />
          <Route 
            path="/tasks/:id"
            element={
              <ProtectedRoute>
                <Taskdetail />
              </ProtectedRoute>
            }
          />

          {/* Redirect root to dashboard if authenticated, otherwise to login */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* Catch all - redirect to dashboard */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </RouterRoutes>
      </AuthProvider>
    </Router>
  );
}

export default AppRoutes;
