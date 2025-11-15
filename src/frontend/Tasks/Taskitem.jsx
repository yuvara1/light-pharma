import React, { useState } from "react";
import Taskform from "./Taskform";

export default function Taskitem({ task, onUpdate, onDelete }) {
  const [editing, setEditing] = useState(false);

  async function toggleCompleted() {
    await onUpdate(task.id, { completed: task.completed ? 0 : 1 });
  }

  return (
    <div
      className="card"
      style={{
        display: "grid",
        gridTemplateColumns: "1fr auto",
        gap: 12,
        alignItems: "start",
      }}
    >
      <div>
        <div style={{ display: "flex", gap: 12, alignItems: "baseline" }}>
          <strong
            style={{ textDecoration: task.completed ? "line-through" : "none" }}
          >
            {task.title}
          </strong>
          <span className="small-muted">({task.priority})</span>
        </div>
        {task.description && (
          <div style={{ marginTop: 6 }} className="small-muted">
            {task.description}
          </div>
        )}
        <div style={{ marginTop: 8 }} className="small-muted">
          Category: {task.category || "—"} • Due: {task.due_date || "—"}
        </div>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 8,
          minWidth: 110,
        }}
      >
        <button className="btn" onClick={toggleCompleted}>
          {task.completed ? "Undo" : "Done"}
        </button>
        <button className="btn" onClick={() => setEditing((v) => !v)}>
          {editing ? "Close" : "Edit"}
        </button>
        <button
          className="btn"
          style={{ background: "#8b1f1f" }}
          onClick={() => onDelete(task.id)}
        >
          Delete
        </button>
      </div>

      {editing && (
        <div style={{ gridColumn: "1 / -1" }}>
          <Taskform
            initial={task}
            onSave={async (updated) => {
              await onUpdate(task.id, updated);
              setEditing(false);
            }}
          />
        </div>
      )}
    </div>
  );
}
