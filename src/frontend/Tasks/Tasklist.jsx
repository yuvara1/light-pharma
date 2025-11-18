
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
import {
  FiPlus,
  FiSearch,
  FiRefreshCw,
  FiCalendar,
  FiZap,
  FiClock,
  FiCheckCircle,
  FiAlertCircle,
  FiList,
} from "react-icons/fi";
import Taskitem from "./Taskitem";

const logger = createLogger('TASKLIST');

export default function Tasklist() {
  const { token } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [sort, setSort] = useState("created");
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("All");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function load() {
    if (loading) {
      logger.warn('Load already in progress, skipping');
      return;
    }
    setLoading(true);
    try {
      logger.debug('Loading tasks', { sort });
      const data = await getTasks(
        token,
        sort === "due" ? "due" : sort === "priority" ? "priority" : undefined
      );
      setTasks(data || []);
      logger.info('Tasks loaded', { count: data?.length || 0 });
    } catch (e) {
      logger.error('Failed to load tasks', { error: e.message });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, sort]);

  async function handleCreate(payload) {
    try {
      logger.debug('Creating task', { title: payload.title });
      const t = await createTask(token, payload);
      setTasks((prev) => [t, ...prev]);
      logger.info('Task created', { taskId: t.id });
    } catch (e) {
      logger.error('Failed to create task', { error: e.message });
    }
  }

  async function handleUpdate(id, changes) {
    try {
      logger.debug('Updating task', { taskId: id });
      const t = await updateTask(token, id, changes);
      setTasks((prev) => prev.map((p) => (p.id === t.id ? t : p)));
      logger.info('Task updated', { taskId: t.id });
    } catch (e) {
      logger.error('Failed to update task', { taskId: id, error: e.message });
    }
  }

  async function handleDelete(id) {
    try {
      logger.debug('Deleting task', { taskId: id });
      await deleteTask(token, id);
      setTasks((prev) => prev.filter((p) => p.id !== Number(id)));
      logger.info('Task deleted', { taskId: id });
    } catch (e) {
      logger.error('Failed to delete task', { taskId: id, error: e.message });
    }
  }

  const categories = useMemo(() => {
    const set = new Set(tasks.map((t) => t.category).filter(Boolean));
    return ["All", ...Array.from(set)];
  }, [tasks]);

  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((t) => Number(t.completed)).length;
    const overdue = tasks.filter(
      (t) =>
        t.due_date && !Number(t.completed) && new Date(t.due_date) < new Date()
    ).length;
    return { total, completed, overdue };
  }, [tasks]);

  const filtered = useMemo(() => {
    const ql = q.trim().toLowerCase();
    return tasks
      .filter((t) =>
        category === "All" ? true : (t.category || "") === category
      )
      .filter((t) =>
        ql ? `${t.title} ${t.description}`.toLowerCase().includes(ql) : true
      );
  }, [tasks, q, category]);

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

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 to-black text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <div className="flex items-center gap-4 mb-2">
                <div className="p-3 bg-indigo-600/20 rounded-xl">
                  <FiList className="w-8 h-8 text-indigo-400" />
                </div>
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold">Tasks</h1>
                  <p className="text-sm text-slate-400 mt-1">Manage and organize your tasks efficiently</p>
                </div>
              </div>
            </div>

            <button
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-semibold transition transform hover:scale-105 flex items-center justify-center gap-2 shadow-lg w-full md:w-fit"
              onClick={() => navigate("/tasks/new")}
              disabled={loading}
            >
              <FiPlus className="w-5 h-5" />
              New Task
            </button>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:border-white/20 transition">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-400 font-medium">Total Tasks</span>
              <FiList className="w-5 h-5 text-slate-400" />
            </div>
            <div className="text-3xl font-bold">{stats.total}</div>
            <p className="text-xs text-slate-500 mt-2">All tasks</p>
          </div>

          <div className="bg-green-500/10 backdrop-blur-sm border border-green-500/30 rounded-xl p-6 hover:border-green-500/50 transition">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-green-400 font-medium">Completed</span>
              <FiCheckCircle className="w-5 h-5 text-green-400" />
            </div>
            <div className="text-3xl font-bold text-green-400">{stats.completed}</div>
            <p className="text-xs text-green-500/60 mt-2">Great progress!</p>
          </div>

          <div className={`backdrop-blur-sm rounded-xl p-6 transition ${
            stats.overdue
              ? "bg-red-500/10 border border-red-500/30 hover:border-red-500/50"
              : "bg-white/5 border border-white/10 hover:border-white/20"
          }`}>
            <div className="flex items-center justify-between mb-2">
              <span className={`text-sm font-medium ${stats.overdue ? "text-red-400" : "text-slate-400"}`}>
                Overdue
              </span>
              <FiAlertCircle className={`w-5 h-5 ${stats.overdue ? "text-red-400" : "text-slate-400"}`} />
            </div>
            <div className={`text-3xl font-bold ${stats.overdue ? "text-red-400" : ""}`}>
              {stats.overdue}
            </div>
            <p className={`text-xs mt-2 ${stats.overdue ? "text-red-500/60" : "text-slate-500"}`}>
              {stats.overdue ? "Needs attention" : "On track"}
            </p>
          </div>
        </div>

        {/* Filters Section */}
        <div className="mb-8 space-y-4">
          {/* Search and Category */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <FiSearch className="absolute left-4 top-3.5 text-slate-500 w-5 h-5" />
                <input
                  className="w-full pl-12 pr-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700 placeholder-slate-500 focus:border-indigo-500 focus:bg-slate-800 focus:outline-none transition"
                  placeholder="Search tasks by title or description..."
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            <select
              className="px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700 text-white focus:border-indigo-500 focus:outline-none transition disabled:opacity-50"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              disabled={loading}
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {getCategoryIcon(c)} {c}
                </option>
              ))}
            </select>

            <button
              className="px-4 py-3 rounded-xl border border-slate-700 hover:bg-slate-800 transition flex items-center justify-center gap-2 disabled:opacity-50 font-medium"
              onClick={() => load()}
              disabled={loading}
              title="Refresh tasks"
            >
              <FiRefreshCw className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>

          {/* Sort Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm text-slate-400 font-medium">Sort:</span>
            <button
              className={`px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2 ${
                sort === "created"
                  ? "bg-indigo-600 text-white shadow-lg"
                  : "bg-slate-800/50 text-slate-300 border border-slate-700 hover:bg-slate-700"
              } disabled:opacity-50`}
              onClick={() => setSort("created")}
              disabled={loading}
            >
              <FiClock className="w-4 h-4" />
              Newest
            </button>
            <button
              className={`px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2 ${
                sort === "due"
                  ? "bg-indigo-600 text-white shadow-lg"
                  : "bg-slate-800/50 text-slate-300 border border-slate-700 hover:bg-slate-700"
              } disabled:opacity-50`}
              onClick={() => setSort("due")}
              disabled={loading}
            >
              <FiCalendar className="w-4 h-4" />
              Due Date
            </button>
            <button
              className={`px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2 ${
                sort === "priority"
                  ? "bg-indigo-600 text-white shadow-lg"
                  : "bg-slate-800/50 text-slate-300 border border-slate-700 hover:bg-slate-700"
              } disabled:opacity-50`}
              onClick={() => setSort("priority")}
              disabled={loading}
            >
              <FiZap className="w-4 h-4" />
              Priority
            </button>
          </div>
        </div>

        {/* Tasks List */}
        <div>
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="animate-pulse bg-slate-800/30 rounded-xl p-6 h-28 border border-slate-700/30"
                />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-16 text-center">
              <div className="inline-block p-4 bg-slate-800/50 rounded-full mb-6">
                <FiList className="w-12 h-12 text-slate-400" />
              </div>
              <div className="text-2xl font-semibold mb-2 text-slate-200">
                {q || category !== "All" ? "No tasks found" : "No tasks yet"}
              </div>
              <div className="text-sm text-slate-400 mb-8 max-w-sm mx-auto">
                {q || category !== "All"
                  ? "Try adjusting your filters or search terms"
                  : "Create your first task to get started and stay organized"}
              </div>
              <button
                className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition inline-flex items-center gap-2 shadow-lg"
                onClick={() => navigate("/tasks/new")}
              >
                <FiPlus className="w-5 h-5" />
                Create Your First Task
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {filtered.map((task) => (
                <Taskitem
                  key={task.id}
                  task={task}
                  onUpdate={handleUpdate}
                  onDelete={handleDelete}
                  priorityColor={getPriorityColor(task.priority)}
                  categoryIcon={getCategoryIcon(task.category)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer Stats */}
        {!loading && filtered.length > 0 && (
          <div className="mt-12 pt-6 border-t border-slate-700/50 text-center text-sm">
            <span className="text-slate-400">
              Showing <span className="font-semibold text-white">{filtered.length}</span> of{" "}
              <span className="font-semibold text-white">{tasks.length}</span> task{tasks.length !== 1 ? 's' : ''}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
