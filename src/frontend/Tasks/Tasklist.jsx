import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
} from "../services/tasksService.js";
import Taskitem from "./Taskitem";
import Taskform from "./Taskform";

export default function Tasklist() {
  const { token } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [sort, setSort] = useState("created");
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("All");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function load() {
    setLoading(true);
    try {
      // services returns demo data when token is falsy
      const data = await getTasks(
        token,
        sort === "due" ? "due" : sort === "priority" ? "priority" : undefined
      );
      setTasks(data || []);
    } catch (e) {
      console.error("load tasks:", e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, sort]);

  async function handleCreate(payload) {
    const t = await createTask(token, payload);
    setTasks((prev) => [t, ...prev]);
  }

  async function handleUpdate(id, changes) {
    const t = await updateTask(token, id, changes);
    setTasks((prev) => prev.map((p) => (p.id === t.id ? t : p)));
  }

  async function handleDelete(id) {
    await deleteTask(token, id);
    setTasks((prev) => prev.filter((p) => p.id !== Number(id)));
  }

  const categories = useMemo(() => {
    const set = new Set(tasks.map((t) => t.category).filter(Boolean));
    return ["All", ...Array.from(set)];
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

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-semibold">Tasks</h1>
            <div className="text-sm text-slate-400">
              {filtered.length} items
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              className="px-3 py-2 rounded border border-slate-700 text-sm hover:bg-slate-800"
              onClick={() => load()}
              title="Refresh"
            >
              Refresh
            </button>

            <button
              className="px-3 py-2 rounded bg-indigo-600 hover:bg-indigo-500 text-sm"
              onClick={() => navigate("/tasks/new")}
            >
              New Task
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <div className="md:col-span-2 flex gap-3">
            <input
              className="w-full px-3 py-2 rounded bg-slate-800 border border-slate-700 placeholder-slate-400"
              placeholder="Search title or description..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />

            <select
              className="px-3 py-2 rounded bg-slate-800 border border-slate-700"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-2 justify-end items-center">
            <button
              className={`px-3 py-2 rounded text-sm ${
                sort === "created"
                  ? "bg-slate-700"
                  : "bg-transparent border border-slate-700"
              }`}
              onClick={() => setSort("created")}
            >
              Newest
            </button>
            <button
              className={`px-3 py-2 rounded text-sm ${
                sort === "due"
                  ? "bg-slate-700"
                  : "bg-transparent border border-slate-700"
              }`}
              onClick={() => setSort("due")}
            >
              Due
            </button>
            <button
              className={`px-3 py-2 rounded text-sm ${
                sort === "priority"
                  ? "bg-slate-700"
                  : "bg-transparent border border-slate-700"
              }`}
              onClick={() => setSort("priority")}
            >
              Priority
            </button>
          </div>
        </div>

        {/* <div className="mb-6">
          <Taskform onSave={handleCreate} />
        </div> */}

        <div>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="animate-pulse bg-slate-800 rounded p-4"
                />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="bg-slate-800 rounded p-6 text-center">
              <div className="text-lg mb-2">No tasks</div>
              <div className="text-sm text-slate-400 mb-4">
                Create a task to get started.
              </div>
              <div className="flex justify-center">
                <button
                  className="px-4 py-2 rounded bg-indigo-600 hover:bg-indigo-500"
                  onClick={() => navigate("/tasks/new")}
                >
                  Add task
                </button>
              </div>
            </div>
          ) : (
            <div className="grid gap-3">
              {filtered.map((task) => (
                <Taskitem
                  key={task.id}
                  task={task}
                  onUpdate={handleUpdate}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
