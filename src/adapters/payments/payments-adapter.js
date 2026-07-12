import { SOURCES } from '../../utils/constants.js';
import { buildFetchResult, resolveLatestCursor } from '../../utils/adapter.js';
import { normalizePaymentRecord } from './payments-normalizer.js';

export class PaymentsAdapter {
  #store;
  constructor(store) { this.#store = store; }
  getSourceName() { return SOURCES.PAYMENTS; }
  async fetchIncremental(cursor = null) {
    const { records, nextCursor } = this.#store.getSince(cursor);
    return buildFetchResult(records, nextCursor);
  }
  async fetchFull() {
    const records = this.#store.getAll();
    return buildFetchResult(records, resolveLatestCursor(records, (r) => r.updated_at));
  }
  normalize(raw) { return normalizePaymentRecord(raw); }
  applyWebhook(payload) { return this.#store.upsertFromWebhook(payload); }
}