import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import createLogger from "../utils/logger.js";
import { getTasks, updateTask, deleteTask } from "../services/tasksService.js";

const logger = createLogger('TASKDETAIL');

export default function Taskdetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(false);

  async function load() {
    if (!token) return;
    try {
      logger.debug('Loading task detail', { taskId: id });
      const all = await getTasks(token);
      const found = (all || []).find((t) => String(t.id) === String(id));
      setTask(found || null);
      logger.info('Task detail loaded', { taskId: id, found: !!found });
    } catch (e) {
      logger.error('Failed to load task detail', { taskId: id, error: e.message });
    }
  }

  useEffect(() => {
    load();
  }, [token, id]);

  async function handleToggleCompleted() {
    if (loading) {
      logger.warn('Operation in progress, skipping toggle');
      return;
    }
    setLoading(true);
    try {
      logger.debug('Toggling task completion', { taskId: id });
      await updateTask(token, id, {
        completed: task.completed ? 0 : 1,
      });
      logger.info('Task completion toggled', { taskId: id });
      await load();
    } catch (e) {
      logger.error('Failed to toggle task', { taskId: id, error: e.message });
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (loading) {
      logger.warn('Operation in progress, skipping delete');
      return;
    }
    if (!confirm('Are you sure you want to delete this task?')) {
      logger.debug('Delete cancelled by user', { taskId: id });
      return;
    }
    setLoading(true);
    try {
      logger.debug('Deleting task', { taskId: id });
      await deleteTask(token, id);
      logger.info('Task deleted', { taskId: id });
      navigate("/tasks");
    } catch (e) {
      logger.error('Failed to delete task', { taskId: id, error: e.message });
      setLoading(false);
    }
  }

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

  const isOverdue = task?.due_date && !Number(task?.completed) && new Date(task.due_date) < new Date();

  if (!task)
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">📭</div>
          <div className="text-lg text-gray-400">Task not found</div>
          <button
            onClick={() => navigate("/tasks")}
            className="mt-4 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition flex items-center gap-2 mx-auto"
          >
            ← Back to Tasks
          </button>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-black text-white">
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate("/tasks")}
          className="mb-6 px-4 py-2 rounded-lg border border-slate-700 hover:bg-slate-800 text-gray-300 text-sm font-medium transition flex items-center gap-2"
        >
          ← Back to Tasks
        </button>

        {/* Main Card */}
        <div className={`rounded-lg border p-6 ${
          task.completed
            ? "bg-slate-800/30 border-slate-700/30"
            : isOverdue
            ? "bg-red-500/10 border-red-500/30"
            : "bg-white/5 border-white/10"
        }`}>
          {/* Header */}
          <div className="flex items-start justify-between gap-4 mb-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                {task.completed && <span className="text-2xl">✓</span>}
                <h1 className={`text-3xl font-bold ${task.completed ? "line-through text-slate-500" : ""}`}>
                  {task.title}
                </h1>
              </div>
              {task.description && (
                <p className={`text-base ${task.completed ? "text-slate-500" : "text-slate-300"}`}>
                  {task.description}
                </p>
              )}
            </div>
            <span
              className="inline-block px-3 py-1.5 rounded-lg text-sm font-semibold text-white flex-shrink-0"
              style={{ backgroundColor: getPriorityColor(task.priority) }}
            >
              {task.priority} Priority
            </span>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 pb-6 border-b border-slate-700/50">
            <div>
              <div className="text-xs text-slate-400 mb-1">Category</div>
              <div className="text-sm font-medium flex items-center gap-2">
                <span>{getCategoryIcon(task.category)}</span>
                {task.category || "Other"}
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-400 mb-1">Due Date</div>
              <div className={`text-sm font-medium ${
                isOverdue ? "text-red-400" : ""
              }`}>
                {task.due_date ? (
                  <>
                    {new Date(task.due_date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                    {isOverdue && <span className="ml-2">⏰ Overdue</span>}
                  </>
                ) : (
                  <span className="text-slate-400">No due date</span>
                )}
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-400 mb-1">Status</div>
              <div className={`text-sm font-medium ${task.completed ? "text-green-400" : "text-yellow-400"}`}>
                {task.completed ? "✓ Completed" : "📋 Pending"}
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-400 mb-1">Created</div>
              <div className="text-sm font-medium text-slate-300">
                {new Date(task.created_at).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleToggleCompleted}
              disabled={loading}
              className={`flex-1 px-4 py-3 rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${
                task.completed
                  ? "bg-slate-700 hover:bg-slate-600 text-white"
                  : "bg-green-600 hover:bg-green-500 text-white shadow-lg"
              }`}
            >
              {loading ? "Processing..." : task.completed ? "Mark as Incomplete" : "Mark as Complete"}
            </button>

            <button
              onClick={handleDelete}
              disabled={loading}
              className="flex-1 px-4 py-3 rounded-lg bg-red-600/30 hover:bg-red-600/50 text-red-300 font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? "Deleting..." : "Delete"}
            </button>

            <button
              onClick={() => navigate("/tasks")}
              disabled={loading}
              className="flex-1 px-4 py-3 rounded-lg border border-slate-700 hover:bg-slate-800 text-gray-300 font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              Back to List
            </button>
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-6 p-4 rounded-lg bg-indigo-600/10 border border-indigo-600/20">
          <div className="text-sm text-indigo-300 flex items-center gap-2">
            <span>ℹ️</span>
            <span>
              {task.completed
                ? "Great job! This task is marked as complete."
                : isOverdue
                ? "This task is overdue. Consider completing it soon!"
                : "Keep track of this task and mark it complete when done."}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
