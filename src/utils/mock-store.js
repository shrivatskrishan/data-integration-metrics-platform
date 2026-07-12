import { ExpiredTokenError, SourceUnavailableError, StaleCursorError } from './errors.js';

export function guardUnavailable(source, unavailable, message) {
  if (unavailable) {
    throw new SourceUnavailableError(source, new Error(message));
  }
}

export function validateIncrementalFetch({ source, cursor, staleThreshold, expiredToken }) {
  if (expiredToken?.active) {
    expiredToken.active = false;
    throw new ExpiredTokenError(source);
  }
  if (cursor && cursor < staleThreshold) {
    throw new StaleCursorError(source, cursor);
  }
}

export function filterRecordsSince(records, cursor, getUpdatedAt) {
  const filtered = records.filter((r) => !cursor || getUpdatedAt(r) > cursor);
  const nextCursor = filtered.length ? getUpdatedAt(filtered.at(-1)) : cursor;
  return { records: structuredClone(filtered), nextCursor };
}

export function cloneRecords(records) {
  return structuredClone(records);
}