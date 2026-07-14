import type { SyncErrorOptions } from '../types/index.js';

export class SyncError extends Error {
  code?: string;
  source?: string;
  statusCode: number;
  cause?: unknown;

  constructor(message: string, { code, source, statusCode = 500, cause }: SyncErrorOptions = {}) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.source = source;
    this.statusCode = statusCode;
    this.cause = cause;
  }
}

export class StaleCursorError extends SyncError {
  cursor: unknown;

  constructor(source: string, cursor: unknown) {
    super(`Incremental cursor expired for ${source}`, { code: 'STALE_CURSOR', source, statusCode: 410 });
    this.cursor = cursor;
  }
}

export class ExpiredTokenError extends SyncError {
  constructor(source: string) {
    super(`Auth token expired for ${source}`, { code: 'EXPIRED_TOKEN', source, statusCode: 401 });
  }
}

export class InvalidPayloadError extends SyncError {
  constructor(source: string, details: string) {
    super(`Invalid payload from ${source}: ${details}`, { code: 'INVALID_PAYLOAD', source, statusCode: 422 });
  }
}

export class SourceUnavailableError extends SyncError {
  constructor(source: string, cause: unknown) {
    super(`Source ${source} is unavailable`, { code: 'SOURCE_UNAVAILABLE', source, statusCode: 503, cause });
  }
}