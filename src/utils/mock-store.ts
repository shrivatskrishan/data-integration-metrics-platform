import { ExpiredTokenError, SourceUnavailableError, StaleCursorError } from './errors.js';
import type { IncrementalFetchOptions } from '../types/index.js';

export function guardUnavailable(source: string, unavailable: boolean, message: string) {
  if (unavailable) {
    throw new SourceUnavailableError(source, new Error(message));
  }
}

export function validateIncrementalFetch({ source, cursor, staleThreshold, expiredToken }: IncrementalFetchOptions) {
  if (expiredToken?.active) {
    expiredToken.active = false;
    throw new ExpiredTokenError(source);
  }
  if (typeof cursor === 'number' && cursor < staleThreshold) {
    throw new StaleCursorError(source, cursor);
  }
}

export function filterRecordsSince(records: Array<Record<string, any>>, cursor: unknown, getUpdatedAt: (record: Record<string, any>) => string) {
  const filtered = records.filter((r) => !cursor || getUpdatedAt(r) > cursor);
  const nextCursor = filtered.length ? getUpdatedAt(filtered.at(-1)) : cursor;
  return { records: structuredClone(filtered), nextCursor };
}

export function cloneRecords(records: unknown[]) {
  return structuredClone(records);
}