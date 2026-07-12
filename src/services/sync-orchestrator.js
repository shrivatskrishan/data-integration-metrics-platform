import { createFailedSourceSyncResult, createSyncRunResult } from '../utils/sync-result.js';

export class SyncOrchestrator {
  #services; #logger; #lastRun = null;
  constructor(sourceSyncServices, logger) { this.#services = sourceSyncServices; this.#logger = logger; }
  getLastRun() { return this.#lastRun; }

  async syncAll({ forceFull = false } = {}) {
    this.#logger.info('Starting multi-source sync', { forceFull, sources: this.#services.length });
    const results = await Promise.all(this.#services.map((s) => this.#syncWithIsolation(s, { forceFull })));
    this.#lastRun = createSyncRunResult(results);
    this.#logger.info('Multi-source sync complete', { runId: this.#lastRun.runId, allSucceeded: this.#lastRun.allSucceeded, totals: this.#lastRun.totals });
    return this.#lastRun;
  }

  async syncOne(sourceName, options = {}) {
    const service = this.#services.find((s) => s.sourceName === sourceName);
    if (!service) throw new Error(`Unknown source: ${sourceName}`);
    const result = await this.#syncWithIsolation(service, options);
    this.#lastRun = createSyncRunResult([result]);
    return result;
  }

  async #syncWithIsolation(service, options) {
    try { return await service.sync(options); }
    catch (error) {
      this.#logger.error('Unexpected error during source sync', { source: service.sourceName, error: error.message });
      return createFailedSourceSyncResult(service.sourceName, error);
    }
  }
}