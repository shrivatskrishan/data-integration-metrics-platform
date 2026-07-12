const LEVELS = ['debug', 'info', 'warn', 'error'];

export class Logger {
  #level;

  constructor(level = 'info') {
    this.#level = LEVELS.includes(level) ? level : 'info';
  }

  #shouldLog(level) {
    return LEVELS.indexOf(level) >= LEVELS.indexOf(this.#level);
  }

  #format(level, message, meta) {
    const entry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...(meta && { meta }),
    };
    return JSON.stringify(entry);
  }

  debug(message, meta) {
    if (this.#shouldLog('debug')) console.debug(this.#format('debug', message, meta));
  }

  info(message, meta) {
    if (this.#shouldLog('info')) console.info(this.#format('info', message, meta));
  }

  warn(message, meta) {
    if (this.#shouldLog('warn')) console.warn(this.#format('warn', message, meta));
  }

  error(message, meta) {
    if (this.#shouldLog('error')) console.error(this.#format('error', message, meta));
  }
}