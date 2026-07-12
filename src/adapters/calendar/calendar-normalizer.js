import { createNormalizedRecord, ENTITY_TYPES, SOURCES } from '../../utils/index.js';
import { InvalidPayloadError } from '../../utils/errors.js';

export function normalizeCalendarRecord(raw) {
  if (!raw?.id || !raw?.summary) throw new InvalidPayloadError('calendar', 'missing id or summary');
  return createNormalizedRecord({
    externalId: raw.id, source: SOURCES.CALENDAR, entityType: ENTITY_TYPES.EVENT,
    title: raw.summary, email: raw.organizer?.email ?? null,
    amount: null, currency: null, status: raw.status ?? 'unknown',
    occurredAt: raw.start?.dateTime ?? raw.updated, updatedAt: raw.updated,
    metadata: { organizer: raw.organizer?.displayName, endTime: raw.end?.dateTime },
  });
}