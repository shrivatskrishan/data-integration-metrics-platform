import { createNormalizedRecord, ENTITY_TYPES, SOURCES } from '../../utils/index.js';
import { InvalidPayloadError } from '../../utils/errors.js';

export function normalizeCrmRecord(raw) {
  if (!raw?.id || !raw?.properties) throw new InvalidPayloadError('crm', 'missing id or properties');
  const { id, objectType, properties } = raw;

  if (objectType === 'deal') {
    return createNormalizedRecord({
      externalId: id, source: SOURCES.CRM, entityType: ENTITY_TYPES.DEAL,
      title: properties.dealname ?? 'Untitled Deal', email: null,
      amount: properties.amount ? Number(properties.amount) : null, currency: 'USD',
      status: properties.dealstage ?? 'unknown',
      occurredAt: properties.closedate ?? properties.hs_lastmodifieddate,
      updatedAt: properties.hs_lastmodifieddate,
      metadata: { objectType, dealstage: properties.dealstage },
    });
  }

  const title = [properties.firstname, properties.lastname].filter(Boolean).join(' ') || 'Unknown Contact';
  return createNormalizedRecord({
    externalId: id, source: SOURCES.CRM, entityType: ENTITY_TYPES.CONTACT, title,
    email: properties.email ?? null, amount: null, currency: null,
    status: properties.lifecyclestage ?? 'unknown',
    occurredAt: properties.createdate ?? properties.hs_lastmodifieddate,
    updatedAt: properties.hs_lastmodifieddate,
    metadata: { objectType, lifecyclestage: properties.lifecyclestage },
  });
}