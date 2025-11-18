
import React, { useState } from "react";
import { FiEdit2, FiTrash2, FiX, FiCalendar } from "react-icons/fi";
import createLogger from "../utils/logger.js";
import Taskform from "./Taskform";

const logger = createLogger('TASKITEM');

export default function Taskitem({ task, onUpdate, onDelete, priorityColor, categoryIcon }) {
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  const isOverdue = task.due_date && !Number(task.completed) && new Date(task.due_date) < new Date();
  const isDueToday = task.due_date && !Number(task.completed) && new Date(task.due_date).toDateString() === new Date().toDateString();
  const isDueSoon = task.due_date && !Number(task.completed) && new Date(task.due_date) > new Date() && new Date(task.due_date).getTime() - new Date().getTime() < 7 * 24 * 60 * 60 * 1000;

  async function toggleCompleted() {
    if (loading) return;
    setLoading(true);
    try {
      logger.debug('Toggling task completion', { taskId: task.id });
      await onUpdate(task.id, { completed: task.completed ? 0 : 1 });
      logger.info('Task completion toggled', { taskId: task.id });
    } catch (e) {
      logger.error('Failed to toggle task', { taskId: task.id, error: e.message });
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (loading) return;
    if (!confirm('Are you sure you want to delete this task?')) {
      logger.debug('Delete cancelled by user', { taskId: task.id });
      return;
    }
    setLoading(true);
    try {
      logger.debug('Deleting task', { taskId: task.id });
      await onDelete(task.id);
      logger.info('Task deleted', { taskId: task.id });
    } catch (e) {
      logger.error('Failed to delete task', { taskId: task.id, error: e.message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className={`rounded-xl border backdrop-blur-sm transition hover:shadow-lg ${
        task.completed
          ? "bg-slate-800/20 border-slate-700/30"
          : isOverdue
          ? "bg-red-500/10 border-red-500/30 hover:border-red-500/50 hover:shadow-red-500/10"
          : "bg-white/5 border-white/10 hover:border-white/20"
      }`}
    >
      <div className="p-5">
        <div className="flex items-start gap-4">
          {/* Checkbox */}
          <button
            onClick={toggleCompleted}
            disabled={loading}
            className={`mt-1.5 w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition ${
              task.completed
                ? "bg-green-500 border-green-500 shadow-lg shadow-green-500/30"
                : "border-slate-400 hover:border-indigo-400 hover:bg-indigo-500/10 hover:shadow-md"
            } disabled:opacity-50`}
            title={task.completed ? "Mark incomplete" : "Mark complete"}
          >
            {task.completed ? (
              <span className="text-white font-bold text-sm leading-none">✓</span>
            ) : (
              <span className="text-slate-400 text-xs">•</span>
            )}
          </button>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Title and Priority */}
            <div className="flex items-start justify-between gap-3 mb-2">
              <h3
                className={`text-base font-semibold transition ${
                  task.completed
                    ? "line-through text-slate-500"
                    : "text-white"
                }`}
              >
                {task.title}
              </h3>
              <span
                className="inline-block px-2.5 py-1 rounded-full text-xs font-bold text-white flex-shrink-0 shadow-lg"
                style={{ backgroundColor: priorityColor || "#6b7280" }}
                title={`${task.priority} Priority`}
              >
                {task.priority}
              </span>
            </div>

            {/* Description */}
            {task.description && (
              <p className={`text-sm mb-3 line-clamp-2 ${task.completed ? "text-slate-500" : "text-slate-300"}`}>
                {task.description}
              </p>
            )}

            {/* Meta Information */}
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Category Badge */}
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-slate-800/70 border border-slate-700/50">
                <span className="text-sm">{categoryIcon || "📌"}</span>
                <span className="text-xs font-medium text-slate-300">{task.category || "Other"}</span>
              </div>

              {/* Due Date Badge */}
              {task.due_date && task.due_date !== "0" && (
                <div
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full font-medium text-xs ${
                    isOverdue
                      ? "bg-red-500/20 border border-red-500/30 text-red-300"
                      : isDueToday
                      ? "bg-orange-500/20 border border-orange-500/30 text-orange-300"
                      : isDueSoon
                      ? "bg-yellow-500/20 border border-yellow-500/30 text-yellow-300"
                      : "bg-slate-800/70 border border-slate-700/50 text-slate-400"
                  }`}
                  title={`Due: ${new Date(task.due_date).toLocaleDateString()}`}
                >
                  <FiCalendar className="w-3.5 h-3.5" />
                  <span>
                    {new Date(task.due_date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
              )}

              {/* Completed Badge */}
              {Number(task.completed) === 1 && (
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-green-500/20 border border-green-500/30 text-green-300 font-medium text-xs">
                  <span>✓</span>
                  <span>Done</span>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 flex-shrink-0 ml-2">
            <button
              onClick={() => {
                if (!loading) setEditing((v) => !v);
              }}
              disabled={loading}
              className="p-2.5 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-slate-700/50 disabled:opacity-50 disabled:cursor-not-allowed transition"
              title="Edit task"
            >
              {editing ? <FiX className="w-4 h-4" /> : <FiEdit2 className="w-4 h-4" />}
            </button>
            <button
              onClick={handleDelete}
              disabled={loading}
              className="p-2.5 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-600/20 disabled:opacity-50 disabled:cursor-not-allowed transition"
              title="Delete task"
            >
              <FiTrash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Edit Form - Expanded Below */}
        {editing && (
          <div className="mt-5 pt-5 border-t border-slate-700/50">
            <Taskform
              initial={task}
              onSave={async (updated) => {
                setLoading(true);
                try {
                  logger.debug('Updating task', { taskId: task.id });
                  await onUpdate(task.id, updated);
                  logger.info('Task updated', { taskId: task.id });
                  setEditing(false);
                } catch (e) {
                  logger.error('Failed to update task', { taskId: task.id, error: e.message });
                } finally {
                  setLoading(false);
                }
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
