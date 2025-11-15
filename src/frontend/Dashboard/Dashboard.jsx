import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
} from "../services/tasksService.js";
import Taskform from "../Tasks/Taskform";
import Taskitem from "../Tasks/Taskitem";

function StatCard({ label, value, color }) {
  return (
    <div className="flex-1 min-w-0 bg-white/3 rounded-lg p-3 flex flex-col items-center">
      <div className="text-sm text-gray-300 truncate">{label}</div>
      <div className="mt-2 text-xl font-semibold truncate" style={{ color }}>
        {value}
      </div>
    </div>
  );
}

// Demo data for UI preview
const MOCK_TASKS = [
  {
    id: 1,
    title: "Finish project proposal",
    description: "Draft the proposal and share with the team for review.",
    category: "Work",
    priority: "High",
    due_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 10),
    completed: 0,
  },
  {
    id: 2,
    title: "Grocery shopping",
    description: "Buy vegetables, milk, and coffee.",
    category: "Personal",
    priority: "Medium",
    due_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 10),
    completed: 0,
  },
  {
    id: 3,
    title: "Pay electricity bill",
    description: "",
    category: "Home",
    priority: "High",
    due_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 10),
    completed: 0,
  },
  {
    id: 4,
    title: "Read 20 pages of book",
    description: "Evening reading habit",
    category: "Personal",
    priority: "Low",
    due_date: null,
    completed: 1,
  },
  {
    id: 5,
    title: "Team sync",
    description: "Weekly standup and blockers",
    category: "Work",
    priority: "Medium",
    due_date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 10),
    completed: 0,
  },
  {
    id: 6,
    title: "Clean workspace",
    description: "Declutter desk and organize cables",
    category: "Home",
    priority: "Low",
    due_date: null,
    completed: 0,
  },
];

export default function Dashboard() {
  const { logout, token } = useAuth();
  const navigate = useNavigate();

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [demo, setDemo] = useState(false);

  async function load() {
    if (!token) return;
    setLoading(true);
    try {
      const data = await getTasks(token);
      setTasks(data || []);
    } catch (e) {
      console.error(e);
      // if you want quick preview while backend/auth is not available, keep demo data
      if (!tasks.length) setTasks(MOCK_TASKS);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [token]);

  // enable demo mode: populate UI with MOCK_TASKS without auth
  function enableDemo() {
    setDemo(true);
    setTasks(MOCK_TASKS);
  }

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

  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((t) => Number(t.completed)).length;
    const overdue = tasks.filter(
      (t) =>
        t.due_date && !Number(t.completed) && new Date(t.due_date) < new Date()
    ).length;
    return { total, completed, overdue };
  }, [tasks]);

  const recent = tasks.slice(0, 6);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-black text-white">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <header className="flex items-center justify-between mb-6">
          <div>
            <div className="text-indigo-400 font-semibold">Light — Tasks</div>
            <div className="text-2xl font-bold">Dashboard</div>
            <div className="text-sm text-gray-400">
              Quick summary of your tasks
            </div>
          </div>

          <div className="flex gap-3">
            <button
              className="px-3 py-2 rounded bg-transparent border border-gray-700 text-gray-300"
              onClick={() => navigate("/tasks")}
            >
              All Tasks
            </button>

            <button
              className="px-3 py-2 rounded bg-gray-700 text-sm text-gray-200"
              onClick={enableDemo}
            >
              Use demo data
            </button>

            <button
              className="px-3 py-2 rounded bg-indigo-600 hover:bg-indigo-500"
              onClick={() => {
                logout();
                navigate("/login");
              }}
            >
              Sign out
            </button>
          </div>
        </header>

        <div className="grid md:grid-cols-4 gap-6">
          <aside className="md:col-span-2 space-y-4">
            <div className="bg-white/3 rounded-lg p-4">
              <div className="flex flex-col md:flex-row gap-3">
                <StatCard label="Total" value={stats.total} color="#7dd3fc" />
                <StatCard
                  label="Completed"
                  value={stats.completed}
                  color="#34d399"
                />
                <StatCard
                  label="Overdue"
                  value={stats.overdue}
                  color={stats.overdue ? "#fb7185" : "#94a3b8"}
                />
              </div>
            </div>

            <div className="bg-white/3 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-2">Quick add</h3>
              <Taskform onSave={handleCreate} />
              {/* <button
                className="mt-3 w-full px-3 py-2 rounded border border-gray-700 text-sm text-gray-300"
                onClick={() => navigate("/tasks")}
              >
                Open tasks
              </button> */}
            </div>
          </aside>

          <main className="md:col-span-3 space-y-4">
            <div className="bg-white/3 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold">Recent tasks</h3>
                <div className="text-sm text-gray-400">
                  {loading ? "Loading…" : `${tasks.length} total`}
                </div>
              </div>

              <div className="space-y-3">
                {recent.length === 0 && (
                  <div className="text-gray-400">No recent tasks</div>
                )}
                {recent.map((t) => (
                  <Taskitem
                    key={t.id}
                    task={t}
                    onUpdate={handleUpdate}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            </div>

            <div className="bg-white/3 rounded-lg p-4 text-gray-300">
              <h3 className="font-semibold mb-2">Tips</h3>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                <li>Use categories to separate work and personal tasks.</li>
                <li>Set due dates to track deadlines.</li>
                <li>Mark tasks complete to keep focus.</li>
              </ul>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
