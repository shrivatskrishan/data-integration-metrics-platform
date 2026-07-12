import { SOURCES } from '../../utils/constants.js';
import { buildFetchResult, resolveLatestCursor } from '../../utils/adapter.js';
import { normalizeCalendarRecord } from './calendar-normalizer.js';

export class CalendarAdapter {
  #store;
  constructor(store) { this.#store = store; }
  getSourceName() { return SOURCES.CALENDAR; }
  async fetchIncremental(syncToken = null) {
    const { records, nextCursor } = this.#store.getSince(syncToken);
    return buildFetchResult(records, nextCursor);
  }
  async fetchFull() {
    const records = this.#store.getAll();
    return buildFetchResult(records, resolveLatestCursor(records, (r) => r.updated));
  }
  normalize(raw) { return normalizeCalendarRecord(raw); }
  applyWebhook(payload) { return this.#store.upsertFromWebhook(payload); }
}