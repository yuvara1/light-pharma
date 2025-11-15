import axios from "axios";

const api = axios.create({
  baseURL: "/api/tasks",
  headers: { "Content-Type": "application/json" },
});

// Demo data (used when token is not provided)
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

let mockData = MOCK_TASKS.map((t) => ({ ...t }));
let mockNextId = mockData.reduce((m, t) => Math.max(m, t.id), 0) + 1;

function authConfig(token) {
  return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
}

function handleError(err) {
  if (err && err.response && err.response.data) throw err.response.data;
  throw { error: (err && err.message) || "Network error" };
}

function clone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function sortTasks(arr, sort) {
  if (!sort) return arr;
  if (sort === "due") {
    return arr.slice().sort((a, b) => {
      if (!a.due_date) return 1;
      if (!b.due_date) return -1;
      return new Date(a.due_date) - new Date(b.due_date);
    });
  }
  if (sort === "priority") {
    const rank = { High: 1, Medium: 2, Low: 3 };
    return arr
      .slice()
      .sort((a, b) => (rank[a.priority] || 99) - (rank[b.priority] || 99));
  }
  // default: newest first by id
  return arr.slice().sort((a, b) => b.id - a.id);
}

export async function getTasks(token, sort) {
  // demo: return in-memory data when no token
  if (!token) {
    const res = sortTasks(clone(mockData), sort);
    return Promise.resolve(res);
  }

  try {
    const res = await api.get("/", {
      params: sort ? { sort } : {},
      ...authConfig(token),
    });
    return res.data;
  } catch (e) {
    return handleError(e);
  }
}

export async function createTask(token, payload) {
  if (!token) {
    const item = {
      id: mockNextId++,
      title: payload.title || "",
      description: payload.description || "",
      category: payload.category || "Other",
      priority: payload.priority || "Medium",
      due_date: payload.due_date || null,
      completed: payload.completed ? Number(payload.completed) : 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    mockData.unshift(item);
    return Promise.resolve(clone(item));
  }

  try {
    const res = await api.post("/", payload, authConfig(token));
    return res.data;
  } catch (e) {
    return handleError(e);
  }
}

export async function updateTask(token, id, payload) {
  if (!token) {
    const idx = mockData.findIndex((t) => String(t.id) === String(id));
    if (idx === -1) throw { error: "Not found" };
    mockData[idx] = {
      ...mockData[idx],
      ...payload,
      updated_at: new Date().toISOString(),
    };
    return Promise.resolve(clone(mockData[idx]));
  }

  try {
    const res = await api.put(`/${id}`, payload, authConfig(token));
    return res.data;
  } catch (e) {
    return handleError(e);
  }
}

export async function deleteTask(token, id) {
  if (!token) {
    const idx = mockData.findIndex((t) => String(t.id) === String(id));
    if (idx === -1) throw { error: "Not found" };
    mockData.splice(idx, 1);
    return Promise.resolve({ success: true });
  }

  try {
    const res = await api.delete(`/${id}`, authConfig(token));
    return res.data;
  } catch (e) {
    return handleError(e);
  }
}
