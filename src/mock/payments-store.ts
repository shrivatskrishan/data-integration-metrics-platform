import { STALE_CURSOR_THRESHOLD } from '../utils/constants.js';
import { cloneRecords, filterRecordsSince, guardUnavailable, validateIncrementalFetch } from '../utils/mock-store.js';

export const PAYMENTS_SEED = [
  { charge_id: 'ch_001', customer_email: 'alice@acme.io', amount_cents: 4800000, currency_code: 'usd', payment_status: 'succeeded', created_at: '2026-07-09T15:50:00.000Z', updated_at: '2026-07-09T15:50:00.000Z', description: 'Enterprise License - Annual' },
  { charge_id: 'ch_002', customer_email: 'bob@acme.io', amount_cents: 9900, currency_code: 'usd', payment_status: 'succeeded', created_at: '2026-07-08T10:00:00.000Z', updated_at: '2026-07-08T10:00:00.000Z', description: 'Starter Plan - Monthly' },
  { charge_id: 'ch_003', customer_email: 'carla@startup.co', amount_cents: 1200000, currency_code: 'usd', payment_status: 'pending', created_at: '2026-07-10T14:00:00.000Z', updated_at: '2026-07-10T14:00:00.000Z', description: 'Pilot Deposit' },
  { charge_id: 'ch_004', customer_email: 'alice@acme.io', amount_cents: 250000, currency_code: 'usd', payment_status: 'failed', created_at: '2026-07-11T08:30:00.000Z', updated_at: '2026-07-11T08:35:00.000Z', description: 'Add-on Seats' },
  { charge_id: 'ch_005', customer_email: 'bob@acme.io', amount_cents: 150000, currency_code: 'usd', payment_status: 'refunded', created_at: '2026-07-07T16:00:00.000Z', updated_at: '2026-07-07T18:00:00.000Z', description: 'Duplicate charge refund' },
];

export class PaymentsMockStore {
  #records;
  #staleThreshold;
  #unavailable = false;

  constructor(options: { staleCursorThreshold?: number } = {}) {
    this.#records = structuredClone(PAYMENTS_SEED);
    this.#staleThreshold = options.staleCursorThreshold ?? STALE_CURSOR_THRESHOLD;
  }

  setUnavailable(v) { this.#unavailable = v; }

  getAll() {
    guardUnavailable('payments', this.#unavailable, 'Payments API 503');
    return cloneRecords(this.#records);
  }

  getSince(cursor) {
    guardUnavailable('payments', this.#unavailable, 'Payments API 503');
    validateIncrementalFetch({ source: 'payments', cursor, staleThreshold: this.#staleThreshold, expiredToken: undefined });
    return filterRecordsSince(this.#records, cursor, (r) => r.updated_at);
  }

  upsertFromWebhook(payload) {
    guardUnavailable('payments', this.#unavailable, 'Payments API 503');
    const idx = this.#records.findIndex((r) => r.charge_id === payload.charge_id);
    const record = { ...payload, updated_at: new Date().toISOString() };
    if (idx >= 0) this.#records[idx] = { ...this.#records[idx], ...record };
    else this.#records.push(record);
    return this.#records.find((r) => r.charge_id === payload.charge_id);
  }
}