import { createHash } from 'node:crypto';

export function buildRecordId(source, externalId) {
  return `${source}:${externalId}`;
}

export function buildContentHash(fields) {
  const payload = JSON.stringify(fields, Object.keys(fields).sort());
  return createHash('sha256').update(payload).digest('hex');
}