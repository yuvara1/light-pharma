import createLogger from "../utils/logger.js";

const logger = createLogger('NOTIFICATION_SERVICE');

export function requestNotificationPermission() {
  if (!("Notification" in window)) {
    logger.warn('Browser does not support notifications');
    return false;
  }

  if (Notification.permission === "granted") {
    logger.debug('Notification permission already granted');
    return true;
  }

  if (Notification.permission !== "denied") {
    Notification.requestPermission().then((permission) => {
      if (permission === "granted") {
        logger.info('Notification permission granted');
        showNotification("Notifications enabled", "You'll receive alerts for overdue tasks");
      } else {
        logger.warn('Notification permission denied');
      }
    });
    return false;
  }

  return false;
}

export function showNotification(title, options = {}) {
  if (!("Notification" in window)) {
    logger.warn('Browser does not support notifications');
    return;
  }

  if (Notification.permission !== "granted") {
    logger.debug('Notification permission not granted, skipping');
    return;
  }

  try {
    const notification = new Notification(title, {
      icon: "/light-pharma.png",
      badge: "/light-pharma.png",
      ...options,
    });

    logger.info('Notification shown', { title });

    // Auto-close after 5 seconds
    setTimeout(() => {
      notification.close();
    }, 5000);

    return notification;
  } catch (e) {
    logger.error('Failed to show notification', { error: e.message });
  }
}

export function checkOverdueTasks(tasks) {
  if (!tasks || tasks.length === 0) {
    logger.debug('No tasks to check for overdue');
    return [];
  }

  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const overdue = tasks.filter((task) => {
    if (!task.due_date || task.completed) return false;
    const dueDate = new Date(task.due_date);
    return dueDate < now;
  });

  logger.debug('Overdue tasks checked', { total: tasks.length, overdue: overdue.length });
  return overdue;
}

export function notifyOverdueTasks(tasks) {
  const overdue = checkOverdueTasks(tasks);

  if (overdue.length === 0) {
    logger.debug('No overdue tasks to notify');
    return;
  }

  if (overdue.length === 1) {
    const task = overdue[0];
    showNotification("Overdue Task", {
      body: `"${task.title}" is overdue`,
      tag: `overdue-${task.id}`,
      requireInteraction: true,
    });
    logger.info('Single overdue task notification sent', { taskId: task.id });
  } else {
    showNotification("Overdue Tasks", {
      body: `You have ${overdue.length} overdue tasks`,
      tag: "overdue-multiple",
      requireInteraction: true,
    });
    logger.info('Multiple overdue tasks notification sent', { count: overdue.length });
  }
}