const LEVELS = ['debug', 'info', 'warn', 'error'];

type LogMeta = Record<string, unknown> | undefined;

export class Logger {
  #level: string;

  constructor(level = 'info') {
    this.#level = LEVELS.includes(level) ? level : 'info';
  }

  #shouldLog(level: string) {
    return LEVELS.indexOf(level) >= LEVELS.indexOf(this.#level);
  }

  #format(level: string, message: string, meta: LogMeta) {
    const entry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...(meta && { meta }),
    };
    return JSON.stringify(entry);
  }

  debug(message: string, meta?: LogMeta) {
    if (this.#shouldLog('debug')) console.debug(this.#format('debug', message, meta));
  }

  info(message: string, meta?: LogMeta) {
    if (this.#shouldLog('info')) console.info(this.#format('info', message, meta));
  }

  warn(message: string, meta?: LogMeta) {
    if (this.#shouldLog('warn')) console.warn(this.#format('warn', message, meta));
  }

  error(message: string, meta?: LogMeta) {
    if (this.#shouldLog('error')) console.error(this.#format('error', message, meta));
  }
}