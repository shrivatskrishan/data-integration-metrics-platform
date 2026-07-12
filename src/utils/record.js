import { buildContentHash, buildRecordId } from './hash.js';

export function createNormalizedRecord({
  externalId, source, entityType, title,
  email = null, amount = null, currency = null,
  status, occurredAt, updatedAt, metadata = {},
}) {
  const core = { externalId, source, entityType, title, email, amount, currency, status, occurredAt, updatedAt };
  return {
    id: buildRecordId(source, externalId),
    ...core,
    contentHash: buildContentHash(core),
    metadata,
  };
}