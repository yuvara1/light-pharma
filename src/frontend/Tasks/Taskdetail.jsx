import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { getTasks, updateTask, deleteTask } from "../services/tasksService.js";

export default function Taskdetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [task, setTask] = useState(null);

  async function load() {
    if (!token) return;
    const all = await getTasks(token);
    const found = (all || []).find((t) => String(t.id) === String(id));
    setTask(found || null);
  }

  useEffect(() => {
    load();
  }, [token, id]);

  if (!task)
    return (
      <div style={{ padding: 24 }} className="small-muted">
        Task not found
      </div>
    );

  return (
    <div className="page">
      <div className="container">
        <div className="card">
          <h2 style={{ marginTop: 0 }}>{task.title}</h2>
          {task.description && (
            <p className="small-muted">{task.description}</p>
          )}
          <div className="small-muted" style={{ marginTop: 8 }}>
            <div>Category: {task.category}</div>
            <div>Priority: {task.priority}</div>
            <div>Due: {task.due_date || "—"}</div>
            <div>Completed: {task.completed ? "Yes" : "No"}</div>
          </div>

          <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
            <button
              className="btn"
              onClick={() =>
                updateTask(token, id, {
                  completed: task.completed ? 0 : 1,
                }).then(load)
              }
            >
              Toggle Completed
            </button>
            <button
              className="btn"
              style={{ background: "#8b1f1f" }}
              onClick={() =>
                deleteTask(token, id).then(() => navigate("/tasks"))
              }
            >
              Delete
            </button>
            <button className="btn" onClick={() => navigate("/tasks")}>
              Back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
