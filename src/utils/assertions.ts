export function assertSourceAdapter(adapter) {
  for (const method of ['getSourceName', 'fetchIncremental', 'fetchFull', 'normalize']) {
    if (typeof adapter[method] !== 'function') {
      throw new TypeError(`Source adapter missing method: ${method}`);
    }
  }
  return adapter;
}

export function assertRecordRepository(repo) {
  for (const method of ['upsert', 'findAll', 'findById', 'count']) {
    if (typeof repo[method] !== 'function') {
      throw new TypeError(`Record repository missing method: ${method}`);
    }
  }
  return repo;
}