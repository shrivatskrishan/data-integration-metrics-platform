import { createNormalizedRecord, ENTITY_TYPES, SOURCES } from '../../utils/index.js';
import { InvalidPayloadError } from '../../utils/errors.js';

export function normalizePaymentRecord(raw) {
  if (!raw?.charge_id) throw new InvalidPayloadError('payments', 'missing charge_id');
  return createNormalizedRecord({
    externalId: raw.charge_id, source: SOURCES.PAYMENTS, entityType: ENTITY_TYPES.PAYMENT,
    title: raw.description ?? `Payment ${raw.charge_id}`, email: raw.customer_email ?? null,
    amount: raw.amount_cents != null ? raw.amount_cents / 100 : null,
    currency: raw.currency_code?.toUpperCase() ?? null, status: raw.payment_status ?? 'unknown',
    occurredAt: raw.created_at, updatedAt: raw.updated_at,
    metadata: { chargeId: raw.charge_id },
  });
}