import React from "react";
import {
  BrowserRouter as Router,
  Routes as RouterRoutes,
  Route,
  Navigate,
} from "react-router-dom";
import Login from "./Auth/Login";
import Register from "./Auth/Register";
import Dashboard from "./Dashboard/Dashboard";

// Added task routes
import Tasklist from "./Tasks/Tasklist";
import Taskdetail from "./Tasks/Taskdetail";
import Taskform from "./Tasks/Taskform";

export default function Routes() {
  return (
    <Router>
      <RouterRoutes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />

        <Route path="/tasks" element={<Tasklist />} />
        
        <Route path="/tasks/:id" element={<Taskdetail />} />
     

        <Route path="*" element={<Navigate to="/login" replace />} />
      </RouterRoutes>
    </Router>
  );
}
