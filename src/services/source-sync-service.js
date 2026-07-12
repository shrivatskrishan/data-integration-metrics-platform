import { createSourceSyncResult } from '../utils/sync-result.js';
import { ExpiredTokenError, StaleCursorError } from '../utils/errors.js';

export class SourceSyncService {
  #adapter; #repository; #cursorStore; #logger;
  constructor(adapter, repository, cursorStore, logger) {
    this.#adapter = adapter; this.#repository = repository;
    this.#cursorStore = cursorStore; this.#logger = logger;
  }
  get sourceName() { return this.#adapter.getSourceName(); }

  async sync({ forceFull = false } = {}) {
    if (forceFull) return this.#runFetch('full', () => this.#adapter.fetchFull());
    const cursor = this.#cursorStore.get(this.sourceName);
    try {
      return await this.#runFetch('incremental', () => this.#adapter.fetchIncremental(cursor));
    } catch (error) {
      if (error instanceof StaleCursorError || error instanceof ExpiredTokenError) {
        this.#logger.warn('Falling back to full backfill', { source: this.sourceName, code: error.code });
        const result = await this.#runFetch('full', () => this.#adapter.fetchFull());
        return { ...result, fallbackToFull: true };
      }
      throw error;
    }
  }

  async ingestRecords(rawRecords) {
    let written = 0, skipped = 0, failed = 0;
    for (const raw of rawRecords) {
      try {
        const normalized = this.#adapter.normalize(raw);
        const { action } = await this.#repository.upsert(normalized);
        if (action === 'unchanged') skipped += 1; else written += 1;
      } catch (error) {
        failed += 1;
        this.#logger.warn('Skipped invalid record', { source: this.sourceName, error: error.message });
      }
    }
    return { written, skipped, failed };
  }

  async #runFetch(mode, fetchFn) {
    const source = this.sourceName;
    try {
      const { records, nextCursor } = await fetchFn();
      const { written, skipped, failed } = await this.ingestRecords(records);
      if (nextCursor) this.#cursorStore.set(source, nextCursor);
      return createSourceSyncResult(source, { mode, fetched: records.length, written, skipped, failed, cursor: nextCursor });
    } catch (error) {
      if (error instanceof StaleCursorError || error instanceof ExpiredTokenError) throw error;
      this.#logger.error('Source sync failed', { source, error: error.message, code: error.code });
      return createSourceSyncResult(source, { mode, error });
    }
  }
}