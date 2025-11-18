export const LogLevel = {
  DEBUG: 'DEBUG',
  INFO: 'INFO',
  WARN: 'WARN',
  ERROR: 'ERROR',
};

class Logger {
  constructor(name) {
    this.name = name;
    this.isDev = process.env.NODE_ENV === 'development';
  }

  getColor(level) {
    switch (level) {
      case LogLevel.DEBUG:
        return '\x1b[36m'; // Cyan
      case LogLevel.INFO:
        return '\x1b[34m'; // Blue
      case LogLevel.WARN:
        return '\x1b[33m'; // Yellow
      case LogLevel.ERROR:
        return '\x1b[31m'; // Red
      default:
        return '\x1b[0m';
    }
  }

  log(level, message, data = null) {
    // Skip debug logs in production
    if (level === LogLevel.DEBUG && !this.isDev) return;

    const timestamp = new Date().toISOString();
    const color = this.getColor(level);
    const reset = '\x1b[0m';
    const prefix = `${color}[${timestamp}] [${level}] [${this.name}]${reset}`;

    if (data) {
      console.log(`${prefix} ${message}`, data);
    } else {
      console.log(`${prefix} ${message}`);
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