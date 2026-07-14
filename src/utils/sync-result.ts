import type { SourceSyncResult, SourceSyncRunResult, SyncErrorPayload } from '../types/index.js';

export function createSourceSyncResult(
  source: string,
  {
    mode = 'incremental',
    fetched = 0,
    written = 0,
    skipped = 0,
    failed = 0,
    cursor = null,
    fallbackToFull = false,
    error = null,
  }: {
    mode?: 'full' | 'incremental';
    fetched?: number;
    written?: number;
    skipped?: number;
    failed?: number;
    cursor?: unknown;
    fallbackToFull?: boolean;
    error?: Error | null;
  } = {},
): SourceSyncResult {
  return {
    source,
    mode,
    fetched,
    written,
    skipped,
    failed,
    cursor,
    fallbackToFull,
    success: error === null,
    error: error ? { message: error.message, code: error instanceof Error && 'code' in error ? String((error as Error & { code?: string }).code) : 'UNKNOWN' } : null,
    completedAt: new Date().toISOString(),
  };
}

export function createFailedSourceSyncResult(source: string, error: unknown, mode: 'incremental' | 'full' = 'incremental') {
  return createSourceSyncResult(source, {
    mode,
    error: error instanceof Error ? error : new Error(String(error)),
  });
}

export function createSyncRunResult(sourceResults: SourceSyncResult[]): SourceSyncRunResult {
  const totals = sourceResults.reduce(
    (acc, r) => ({
      fetched: acc.fetched + r.fetched,
      written: acc.written + r.written,
      skipped: acc.skipped + r.skipped,
      failed: acc.failed + r.failed,
    }),
    { fetched: 0, written: 0, skipped: 0, failed: 0 },
  );
  return {
    runId: crypto.randomUUID(),
    sources: sourceResults,
    totals,
    allSucceeded: sourceResults.every((r) => r.success),
    completedAt: new Date().toISOString(),
  };
}