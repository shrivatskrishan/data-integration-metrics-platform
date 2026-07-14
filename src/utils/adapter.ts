/** Shared fetch-result builders used by all source adapters. */
export function buildFetchResult(records, nextCursor) {
  return { records, nextCursor, hasMore: false };
}

export function resolveLatestCursor(records, getUpdatedAt) {
  if (!records.length) return null;
  return records.map(getUpdatedAt).sort().at(-1) ?? null;
}