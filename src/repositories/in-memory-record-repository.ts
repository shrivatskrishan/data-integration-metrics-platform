export class InMemoryRecordRepository {
  #records = new Map<string, any>();

  async upsert(record: any) {
    const existing = this.#records.get(record.id);
    if (!existing) {
      this.#records.set(record.id, { ...record, syncedAt: new Date().toISOString() });
      return { action: 'inserted', record: this.#records.get(record.id) };
    }
    if (existing.contentHash === record.contentHash) return { action: 'unchanged', record: existing };
    const updated = { ...record, syncedAt: new Date().toISOString() };
    this.#records.set(record.id, updated);
    return { action: 'updated', record: updated };
  }

  async findAll({ source }: { source?: string } = {}) {
    const all = [...this.#records.values()];
    return source ? all.filter((r) => r.source === source) : all;
  }

  async findById(id: string) { return this.#records.get(id) ?? null; }

  async count({ source }: { source?: string } = {}) {
    if (!source) return this.#records.size;
    return [...this.#records.values()].filter((r) => r.source === source).length;
  }
}