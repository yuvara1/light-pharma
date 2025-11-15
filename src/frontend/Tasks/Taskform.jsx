import React, { useEffect, useRef } from "react";

const CATS = ["Work", "Personal", "Home", "Other"];
const PRIO = ["High", "Medium", "Low"];

export default function Taskform({ initial = {}, onSave }) {
  const titleRef = useRef(null);
  const descRef = useRef(null);
  const categoryRef = useRef(null);
  const priorityRef = useRef(null);
  const dueRef = useRef(null);

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
    const title = (titleRef.current?.value || "").trim();
    if (!title) return;
    const payload = {
      title,
      description: (descRef.current?.value || "").trim(),
      category: categoryRef.current?.value || CATS[0],
      priority: priorityRef.current?.value || PRIO[1],
      due_date: dueRef.current?.value || null,
    };

    if (onSave) await onSave(payload);

    if (!initial.id) {
      if (titleRef.current) titleRef.current.value = "";
      if (descRef.current) descRef.current.value = "";
      if (categoryRef.current) categoryRef.current.value = CATS[0];
      if (priorityRef.current) priorityRef.current.value = PRIO[1];
      if (dueRef.current) dueRef.current.value = "";
    }
  }

  return (
    <form
      className="card"
      onSubmit={submit}
      style={{ display: "grid", gap: 8 }}
    >
      <input
        ref={titleRef}
        defaultValue={initial.title || ""}
        className="input block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-white placeholder:text-gray-500 sm:text-sm"
        placeholder="Task title"
        aria-label="Task title"
      />

      <textarea
        ref={descRef}
        defaultValue={initial.description || ""}
        className="input block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-white placeholder:text-gray-500 sm:text-sm"
        placeholder="Description"
        rows={3}
      />

      <div style={{ display: "flex", gap: 8 }} className="row responsive">
        <select
          ref={categoryRef}
          defaultValue={initial.category || CATS[0]}
          className="input input block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-white placeholder:text-gray-500 sm:text-sm"
        >
          {CATS.map((c) => (
            <option
              key={c}
              value={c}
              className="option input block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-white placeholder:text-gray-500 sm:text-sm"
            >
              {c}
            </option>
          ))}
        </select>

        <select
          ref={priorityRef}
          defaultValue={initial.priority || PRIO[1]}
          className="input input block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-white placeholder:text-gray-500 sm:text-sm"
        >
          {PRIO.map((p) => (
            <option
              key={p}
              value={p}
              className="input block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-white placeholder:text-gray-500 sm:text-sm"
            >
              {p}
            </option>
          ))}
        </select>

        <input
          ref={dueRef}
          defaultValue={initial.due_date || ""}
          className="input block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-white placeholder:text-gray-500 sm:text-sm"
          type="date"
        />
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button
          type="submit"
          className="input block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-white placeholder:text-gray-500 sm:text-sm"
        >
          {initial.id ? "Save" : "Add"}
        </button>
      </div>
    </form>
  );
}
