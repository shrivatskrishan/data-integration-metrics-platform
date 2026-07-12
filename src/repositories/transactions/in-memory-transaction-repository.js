import { getSeededTransactions } from '../../mock/finance-transactions-seed.js';

export class InMemoryTransactionRepository {
  #records = new Map();

  constructor({ seed = true } = {}) {
    if (seed) {
      for (const tx of getSeededTransactions()) {
        this.#records.set(tx.id, { ...tx });
      }
    }
  }

  async upsertMany(transactions) {
    let inserted = 0;
    let updated = 0;
    for (const tx of transactions) {
      if (this.#records.has(tx.id)) updated += 1;
      else inserted += 1;
      this.#records.set(tx.id, { ...tx, updated_at: new Date().toISOString() });
    }
    return { inserted, updated };
  }

  async findByDateRange(from, to) {
    const fromDate = new Date(from);
    const toDate = new Date(to);
    return [...this.#records.values()]
      .filter((tx) => {
        const d = new Date(tx.occurred_at);
        return d >= fromDate && d <= toDate;
      })
      .sort((a, b) => a.occurred_at.localeCompare(b.occurred_at));
  }

  async count() { return this.#records.size; }
}