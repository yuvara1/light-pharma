export const LogLevel = {
  DEBUG: 'DEBUG',
  INFO: 'INFO',
  WARN: 'WARN',
  ERROR: 'ERROR',
};

class Logger {
  constructor(name) {
    this.name = name;
    this.isDev = import.meta.env.DEV;
  }

  getColor(level) {
    switch (level) {
      case LogLevel.DEBUG:
        return '#7f8c8d'; // Gray
      case LogLevel.INFO:
        return '#3498db'; // Blue
      case LogLevel.WARN:
        return '#f39c12'; // Orange
      case LogLevel.ERROR:
        return '#e74c3c'; // Red
      default:
        return '#000';
    }
  }

  log(level, message, data = null) {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level}] [${this.name}]`;
    const color = this.getColor(level);

    if (data) {
      console.log(
        `%c${prefix} ${message}`,
        `color: ${color}; font-weight: bold; font-family: monospace;`,
        data
      );
    } else {
      console.log(
        `%c${prefix} ${message}`,
        `color: ${color}; font-weight: bold; font-family: monospace;`
      );
    }
  }

  debug(message, data) {
    if (this.isDev) {
      this.log(LogLevel.DEBUG, message, data);
    }
  }

  info(message, data) {
    this.log(LogLevel.INFO, message, data);
  }

  warn(message, data) {
    this.log(LogLevel.WARN, message, data);
  }

  error(message, data) {
    this.log(LogLevel.ERROR, message, data);
  }
}

export function createLogger(name) {
  return new Logger(name);
}

export default createLogger;