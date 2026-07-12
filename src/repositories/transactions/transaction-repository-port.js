/** Port for normalized transaction persistence. */
export function assertTransactionRepository(repo) {
  for (const method of ['upsertMany', 'findByDateRange', 'count']) {
    if (typeof repo[method] !== 'function') {
      throw new TypeError(`TransactionRepository missing method: ${method}`);
    }
  }
  return repo;
}