import React, { useEffect, useRef, useState } from "react";
import { FiSave, FiX } from "react-icons/fi";
import createLogger from "../utils/logger.js";

const logger = createLogger('TASKFORM');
const CATS = ["Work", "Personal", "Home", "Other"];
const PRIO = ["High", "Medium", "Low"];

export default function Taskform({ initial = {}, onSave }) {
  const titleRef = useRef(null);
  const descRef = useRef(null);
  const categoryRef = useRef(null);
  const priorityRef = useRef(null);
  const dueRef = useRef(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!titleRef.current) return;
    titleRef.current.value = initial.title || "";
    descRef.current.value = initial.description || "";
    categoryRef.current.value = initial.category || CATS[0];
    priorityRef.current.value = initial.priority || PRIO[1];
    dueRef.current.value = initial.due_date || "";
  }, [initial]);

  async function submit(e) {
    if (e) e.preventDefault();
    
    if (loading) {
      logger.warn('Form submission already in progress');
      return;
    }
    
    const title = (titleRef.current?.value || "").trim();
    if (!title) {
      logger.warn('Task form validation failed - empty title');
      alert('Please enter a task title');
      return;
    }
    
    setLoading(true);
    try {
      const payload = {
        title,
        description: (descRef.current?.value || "").trim(),
        category: categoryRef.current?.value || CATS[0],
        priority: priorityRef.current?.value || PRIO[1],
        due_date: dueRef.current?.value || null,
      };

      logger.debug('Submitting task form', { title, isEdit: !!initial.id });
      if (onSave) await onSave(payload);

      if (!initial.id) {
        logger.debug('Clearing form after successful submission');
        if (titleRef.current) titleRef.current.value = "";
        if (descRef.current) descRef.current.value = "";
        if (categoryRef.current) categoryRef.current.value = CATS[0];
        if (priorityRef.current) priorityRef.current.value = PRIO[1];
        if (dueRef.current) dueRef.current.value = "";
      }
    } catch (e) {
      logger.error('Task form submission failed', { error: e.message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="space-y-4" onSubmit={submit}>
      {/* Title Input */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">Task Title *</label>
        <input
          ref={titleRef}
          defaultValue={initial.title || ""}
          className="w-full px-4 py-2.5 rounded-lg bg-slate-800/50 border border-slate-700 text-white placeholder-slate-500 focus:border-indigo-500 focus:bg-slate-800 focus:outline-none transition"
          placeholder="Enter task title..."
          aria-label="Task title"
          disabled={loading}
        />
      </div>

      {/* Description Input */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
        <textarea
          ref={descRef}
          defaultValue={initial.description || ""}
          className="w-full px-4 py-2.5 rounded-lg bg-slate-800/50 border border-slate-700 text-white placeholder-slate-500 focus:border-indigo-500 focus:bg-slate-800 focus:outline-none transition resize-none"
          placeholder="Add task details..."
          rows={3}
          disabled={loading}
        />
      </div>

      {/* Category, Priority, Due Date Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Category</label>
          <select
            ref={categoryRef}
            defaultValue={initial.category || CATS[0]}
            className="w-full px-4 py-2.5 rounded-lg bg-slate-800/50 border border-slate-700 text-white focus:border-indigo-500 focus:bg-slate-800 focus:outline-none transition"
            disabled={loading}
          >
            {CATS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Priority</label>
          <select
            ref={priorityRef}
            defaultValue={initial.priority || PRIO[1]}
            className="w-full px-4 py-2.5 rounded-lg bg-slate-800/50 border border-slate-700 text-white focus:border-indigo-500 focus:bg-slate-800 focus:outline-none transition"
            disabled={loading}
          >
            {PRIO.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Due Date</label>
          <input
            ref={dueRef}
            defaultValue={initial.due_date || ""}
            className="w-full px-4 py-2.5 rounded-lg bg-slate-800/50 border border-slate-700 text-white focus:border-indigo-500 focus:bg-slate-800 focus:outline-none transition"
            type="date"
            disabled={loading}
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm transition flex items-center justify-center gap-2"
        >
          <FiSave className="w-4 h-4" />
          {loading ? (initial.id ? "Saving..." : "Adding...") : (initial.id ? "Save Changes" : "Add Task")}
        </button>
      </div>
    </form>
  );
}
