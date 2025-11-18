export function validateTaskPayload(payload = {}, opts = {}) {
  const errors = {};
  if (opts.requireTitle && (!payload.title || String(payload.title).trim().length < 1)) {
    errors.title = 'Title is required';
  }
  if (payload.priority && !['High', 'Medium', 'Low'].includes(payload.priority)) {
    errors.priority = 'Priority must be High, Medium or Low';
  }
  if (payload.due_date) {
    const d = new Date(payload.due_date);
    if (Number.isNaN(d.getTime())) errors.due_date = 'Invalid date';
  }
  return { valid: Object.keys(errors).length === 0, errors };
}