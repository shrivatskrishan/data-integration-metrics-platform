import { SOURCES } from '../../utils/constants.js';
import { buildFetchResult, resolveLatestCursor } from '../../utils/adapter.js';
import { normalizeCrmRecord } from './crm-normalizer.js';

export class CrmAdapter {
  #store;
  constructor(store) { this.#store = store; }
  getSourceName() { return SOURCES.CRM; }
  async fetchIncremental(cursor = null) {
    const { records, nextCursor } = this.#store.getSince(cursor);
    return buildFetchResult(records, nextCursor);
  }
  async fetchFull() {
    const records = this.#store.getAll();
    return buildFetchResult(records, resolveLatestCursor(records, (r) => r.properties.hs_lastmodifieddate));
  }
  normalize(raw) { return normalizeCrmRecord(raw); }
  applyWebhook(payload) { return this.#store.upsertFromWebhook(payload); }
}