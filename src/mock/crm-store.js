import { STALE_CURSOR_THRESHOLD } from '../utils/constants.js';
import {
  cloneRecords, filterRecordsSince, guardUnavailable, validateIncrementalFetch,
} from '../utils/mock-store.js';

export const CRM_SEED = [
  { id: 'hs-contact-001', objectType: 'contact', properties: { firstname: 'Alice', lastname: 'Nguyen', email: 'alice@acme.io', lifecyclestage: 'customer', hs_lastmodifieddate: '2026-07-05T10:00:00.000Z', createdate: '2026-07-02T08:00:00.000Z' } },
  { id: 'hs-contact-002', objectType: 'contact', properties: { firstname: 'Bob', lastname: 'Patel', email: 'bob@acme.io', lifecyclestage: 'lead', hs_lastmodifieddate: '2026-07-08T14:30:00.000Z', createdate: '2026-07-03T09:15:00.000Z' } },
  { id: 'hs-deal-001', objectType: 'deal', properties: { dealname: 'Acme Enterprise License', amount: '48000', dealstage: 'closedwon', hs_lastmodifieddate: '2026-07-09T16:00:00.000Z', closedate: '2026-07-09T15:45:00.000Z' } },
  { id: 'hs-contact-003', objectType: 'contact', properties: { firstname: 'Carla', lastname: 'Mendez', email: 'carla@startup.co', lifecyclestage: 'opportunity', hs_lastmodifieddate: '2026-07-10T11:20:00.000Z', createdate: '2026-07-06T12:00:00.000Z' } },
  { id: 'hs-deal-002', objectType: 'deal', properties: { dealname: 'Startup Pilot', amount: '12000', dealstage: 'negotiation', hs_lastmodifieddate: '2026-07-11T09:00:00.000Z', closedate: null } },
];

export class CrmMockStore {
  #records;
  #staleThreshold;
  #unavailable = false;
  #expiredToken = { active: false };

  constructor(options = {}) {
    this.#records = structuredClone(CRM_SEED);
    this.#staleThreshold = options.staleCursorThreshold ?? STALE_CURSOR_THRESHOLD;
  }

  setUnavailable(v) { this.#unavailable = v; }
  setExpiredToken(v) { this.#expiredToken.active = v; }

  getAll() {
    guardUnavailable('crm', this.#unavailable, 'CRM API timeout');
    return cloneRecords(this.#records);
  }

  getSince(cursor) {
    guardUnavailable('crm', this.#unavailable, 'CRM API timeout');
    validateIncrementalFetch({ source: 'crm', cursor, staleThreshold: this.#staleThreshold, expiredToken: this.#expiredToken });
    return filterRecordsSince(this.#records, cursor, (r) => r.properties.hs_lastmodifieddate);
  }

  upsertFromWebhook(payload) {
    guardUnavailable('crm', this.#unavailable, 'CRM API timeout');
    const idx = this.#records.findIndex((r) => r.id === payload.id);
    if (idx >= 0) {
      const existing = this.#records[idx];
      const sameContent = existing.objectType === (payload.objectType ?? 'contact') &&
        JSON.stringify(existing.properties, Object.keys(existing.properties).sort()) ===
        JSON.stringify({ ...payload.properties, hs_lastmodifieddate: existing.properties.hs_lastmodifieddate }, Object.keys({ ...payload.properties, hs_lastmodifieddate: existing.properties.hs_lastmodifieddate }).sort());
      if (sameContent) return cloneRecords([existing])[0];
    }
    const record = { id: payload.id, objectType: payload.objectType ?? 'contact', properties: { ...payload.properties, hs_lastmodifieddate: new Date().toISOString() } };
    if (idx >= 0) this.#records[idx] = record; else this.#records.push(record);
    return record;
  }
}