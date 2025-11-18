import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import createLogger from "../utils/logger.js";
import {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
} from "../services/tasksService.js";
import Taskform from "../Tasks/Taskform";
import Taskitem from "../Tasks/Taskitem";

const logger = createLogger("DASHBOARD");

function StatCard({ label, value, color, icon }) {
  return (
    <div className="flex-1 min-w-0 bg-white/5 border border-white/10 rounded-lg p-4 flex flex-col items-center hover:border-white/20 transition">
      <div className="text-3xl mb-2">{icon}</div>
      <div className="text-sm text-gray-300 truncate">{label}</div>
      <div className="mt-2 text-3xl font-bold truncate" style={{ color }}>
        {value}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { logout, token } = useAuth();
  const navigate = useNavigate();

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function load() {
    if (!token) {
      logger.debug("No token available, skipping load");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      logger.debug("Loading tasks from API");
      const data = await getTasks(token);
      logger.info("Tasks loaded successfully", { count: data?.length || 0 });
      setTasks(data || []);
    } catch (e) {
      logger.error("Failed to load tasks", { error: e.message });
      setError("Failed to load tasks");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    logger.debug("Dashboard mounted, token available", { hasToken: !!token });
    load();
  }, [token]);

  async function handleCreate(payload) {
    try {
      logger.debug("Creating new task", { title: payload.title });
      const t = await createTask(token, payload);
      logger.info("Task created successfully", { taskId: t.id, title: t.title });
      setTasks((prev) => [t, ...prev]);
    } catch (e) {
      logger.error("Failed to create task", { error: e.message });
      setError("Failed to create task");
    }
  }

  async function handleUpdate(id, changes) {
    try {
      logger.debug("Updating task", { taskId: id, changes });
      const t = await updateTask(token, id, changes);
      logger.info("Task updated successfully", { taskId: t.id });
      setTasks((prev) => prev.map((p) => (p.id === t.id ? t : p)));
    } catch (e) {
      logger.error("Failed to update task", { taskId: id, error: e.message });
      setError("Failed to update task");
    }
  }

  async function handleDelete(id) {
    try {
      logger.debug("Deleting task", { taskId: id });
      await deleteTask(token, id);
      logger.info("Task deleted successfully", { taskId: id });
      setTasks((prev) => prev.filter((p) => p.id !== Number(id)));
    } catch (e) {
      logger.error("Failed to delete task", { taskId: id, error: e.message });
      setError("Failed to delete task");
    }
  }

  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((t) => Number(t.completed)).length;
    const overdue = tasks.filter(
      (t) =>
        t.due_date && !Number(t.completed) && new Date(t.due_date) < new Date()
    ).length;
    return { total, completed, overdue };
  }, [tasks]);

  const recent = tasks.slice(0, 5);

  const getCategoryIcon = (category) => {
    switch (category) {
      case "Work":
        return "💼";
      case "Personal":
        return "👤";
      case "Home":
        return "🏠";
      default:
        return "📌";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "High":
        return "#ef4444";
      case "Medium":
        return "#f59e0b";
      case "Low":
        return "#10b981";
      default:
        return "#6b7280";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-black text-white">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <header className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-4xl">✨</span>
              <div>
                <h1 className="text-3xl font-bold">Dashboard</h1>
                <p className="text-sm text-gray-400">
                  Welcome back! Here's your task overview
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-gray-300 font-medium transition flex items-center gap-2"
              onClick={() => navigate("/tasks")}
            >
              <span>📋</span>
              All Tasks
            </button>

            <button
              className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition"
              onClick={() => {
                logger.info("User signed out");
                logout();
                navigate("/login");
              }}
            >
              Sign out
            </button>
          </div>
        </header>

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-3">
            <span>⚠️</span>
            {error}
          </div>
        )}

        <div className="grid md:grid-cols-4 gap-6">
          <aside className="md:col-span-2 space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-1 gap-4">
              <StatCard
                label="Total Tasks"
                value={stats.total}
                color="#7dd3fc"
                icon="📊"
              />
              <StatCard
                label="Completed"
                value={stats.completed}
                color="#34d399"
                icon="✓"
              />
              <StatCard
                label="Overdue"
                value={stats.overdue}
                color={stats.overdue ? "#fb7185" : "#94a3b8"}
                icon={stats.overdue ? "⏰" : "✔️"}
              />
            </div>

            {/* Quick Add */}
            <div className="bg-white/5 border border-white/10 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <span>➕</span>
                Quick Add Task
              </h3>
              <Taskform onSave={handleCreate} />
            </div>
          </aside>

          <main className="md:col-span-2 space-y-6">
            {/* Recent Tasks */}
            <div className="bg-white/5 border border-white/10 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <span>📌</span>
                  Recent Tasks
                </h3>
                <div className="text-sm text-gray-400">
                  {loading ? "Loading…" : `${tasks.length} total`}
                </div>
              </div>

              {loading ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="animate-pulse bg-slate-700 rounded h-12" />
                  ))}
                </div>
              ) : recent.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-3xl mb-2">📭</div>
                  <div className="text-gray-400">No tasks yet.</div>
                  <button
                    onClick={() => navigate("/tasks")}
                    className="mt-3 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-sm font-medium transition"
                  >
                    Create your first task
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {recent.map((t) => (
                    <Taskitem
                      key={t.id}
                      task={t}
                      onUpdate={handleUpdate}
                      onDelete={handleDelete}
                      priorityColor={getPriorityColor(t.priority)}
                      categoryIcon={getCategoryIcon(t.category)}
                    />
                  ))}
                </div>
              )}

              {recent.length > 0 && (
                <button
                  onClick={() => navigate("/tasks")}
                  className="mt-4 w-full px-4 py-2 rounded-lg border border-slate-700 hover:bg-slate-800 text-sm font-medium transition text-gray-300"
                >
                  View all tasks →
                </button>
              )}
            </div>

            {/* Tips */}
            <div className="bg-indigo-600/10 border border-indigo-600/20 rounded-lg p-6">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <span>💡</span>
                Quick Tips
              </h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li className="flex gap-2">
                  <span>•</span>
                  <span>
                    Use categories to organize tasks by type (Work, Personal, Home)
                  </span>
                </li>
                <li className="flex gap-2">
                  <span>•</span>
                  <span>
                    Set due dates to keep track of important deadlines
                  </span>
                </li>
                <li className="flex gap-2">
                  <span>•</span>
                  <span>
                    Mark tasks complete to maintain focus and celebrate progress
                  </span>
                </li>
              </ul>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
