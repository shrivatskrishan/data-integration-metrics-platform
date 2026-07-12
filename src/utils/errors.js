export class SyncError extends Error {
  constructor(message, { code, source, statusCode = 500, cause } = {}) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.source = source;
    this.statusCode = statusCode;
    this.cause = cause;
  }
}

export class StaleCursorError extends SyncError {
  constructor(source, cursor) {
    super(`Incremental cursor expired for ${source}`, { code: 'STALE_CURSOR', source, statusCode: 410 });
    this.cursor = cursor;
  }
}

export class ExpiredTokenError extends SyncError {
  constructor(source) {
    super(`Auth token expired for ${source}`, { code: 'EXPIRED_TOKEN', source, statusCode: 401 });
  }
}

export class InvalidPayloadError extends SyncError {
  constructor(source, details) {
    super(`Invalid payload from ${source}: ${details}`, { code: 'INVALID_PAYLOAD', source, statusCode: 422 });
  }
}

export class SourceUnavailableError extends SyncError {
  constructor(source, cause) {
    super(`Source ${source} is unavailable`, { code: 'SOURCE_UNAVAILABLE', source, statusCode: 503, cause });
  }
}