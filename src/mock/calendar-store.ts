import { STALE_CURSOR_THRESHOLD } from '../utils/constants.js';
import { cloneRecords, filterRecordsSince, guardUnavailable, validateIncrementalFetch } from '../utils/mock-store.js';

export const CALENDAR_SEED = [
  { id: 'gcal-event-001', summary: 'Q3 Pipeline Review', status: 'confirmed', start: { dateTime: '2026-07-10T09:00:00.000Z' }, end: { dateTime: '2026-07-10T10:00:00.000Z' }, organizer: { email: 'alice@acme.io', displayName: 'Alice Nguyen' }, updated: '2026-07-09T17:00:00.000Z' },
  { id: 'gcal-event-002', summary: 'Demo with Startup Co', status: 'confirmed', start: { dateTime: '2026-07-11T14:00:00.000Z' }, end: { dateTime: '2026-07-11T15:00:00.000Z' }, organizer: { email: 'carla@startup.co', displayName: 'Carla Mendez' }, updated: '2026-07-10T12:00:00.000Z' },
  { id: 'gcal-event-003', summary: 'Renewal Discussion', status: 'tentative', start: { dateTime: '2026-07-12T16:00:00.000Z' }, end: { dateTime: '2026-07-12T17:00:00.000Z' }, organizer: { email: 'bob@acme.io', displayName: 'Bob Patel' }, updated: '2026-07-11T08:00:00.000Z' },
  { id: 'gcal-event-004', summary: 'Onboarding Kickoff', status: 'confirmed', start: { dateTime: '2026-07-08T13:00:00.000Z' }, end: { dateTime: '2026-07-08T14:30:00.000Z' }, organizer: { email: 'alice@acme.io', displayName: 'Alice Nguyen' }, updated: '2026-07-07T20:00:00.000Z' },
  { id: 'gcal-event-005', summary: 'Cancelled Sync', status: 'cancelled', start: { dateTime: '2026-07-06T11:00:00.000Z' }, end: { dateTime: '2026-07-06T11:30:00.000Z' }, organizer: { email: 'bob@acme.io', displayName: 'Bob Patel' }, updated: '2026-07-06T10:00:00.000Z' },
];

export class CalendarMockStore {
  #records;
  #staleThreshold;
  #unavailable = false;
  #expiredToken = { active: false };

  constructor(options: { staleCursorThreshold?: number } = {}) {
    this.#records = structuredClone(CALENDAR_SEED);
    this.#staleThreshold = options.staleCursorThreshold ?? STALE_CURSOR_THRESHOLD;
  }

  setUnavailable(v) { this.#unavailable = v; }
  setExpiredToken(v) { this.#expiredToken.active = v; }

  getAll() {
    guardUnavailable('calendar', this.#unavailable, 'Google Calendar API error');
    return cloneRecords(this.#records);
  }

  getSince(syncToken) {
    guardUnavailable('calendar', this.#unavailable, 'Google Calendar API error');
    validateIncrementalFetch({ source: 'calendar', cursor: syncToken, staleThreshold: this.#staleThreshold, expiredToken: this.#expiredToken });
    return filterRecordsSince(this.#records, syncToken, (r) => r.updated);
  }

  upsertFromWebhook(payload) {
    guardUnavailable('calendar', this.#unavailable, 'Google Calendar API error');
    const idx = this.#records.findIndex((r) => r.id === payload.id);
    const record = { ...payload, updated: new Date().toISOString() };
    if (idx >= 0) this.#records[idx] = { ...this.#records[idx], ...record };
    else this.#records.push(record);
    return this.#records.find((r) => r.id === payload.id);
  }
}