import { createClient } from '@supabase/supabase-js';
import { getSeededTransactions } from '../../mock/finance-transactions-seed.js';

export class SupabaseTransactionRepository {
  #client;
  #table = 'normalized_transactions';

  constructor({ url, serviceRoleKey }) {
    this.#client = createClient(url, serviceRoleKey, { auth: { persistSession: false } });
  }

  async upsertMany(transactions) {
    const rows = transactions.map((tx) => ({
      id: tx.id,
      source: tx.source,
      external_id: tx.external_id,
      amount: tx.amount,
      currency: tx.currency,
      status: tx.status,
      occurred_at: tx.occurred_at,
      updated_at: tx.updated_at ?? tx.occurred_at,
      metadata: tx.metadata ?? {},
    }));

    const { error } = await this.#client.from(this.#table).upsert(rows, { onConflict: 'id' });
    if (error) throw new Error(`Supabase upsert failed: ${error.message}`);
    return { inserted: rows.length, updated: 0 };
  }

  async findByDateRange(from, to) {
    const { data, error } = await this.#client
      .from(this.#table)
      .select('*')
      .gte('occurred_at', from)
      .lte('occurred_at', to)
      .order('occurred_at', { ascending: true });

    if (error) throw new Error(`Supabase query failed: ${error.message}`);
    return (data ?? []).map(mapRow);
  }

  async count() {
    const { count, error } = await this.#client.from(this.#table).select('*', { count: 'exact', head: true });
    if (error) throw new Error(`Supabase count failed: ${error.message}`);
    return count ?? 0;
  }

  async seedIfEmpty() {
    const total = await this.count();
    if (total === 0) {
      await this.upsertMany(getSeededTransactions());
    }
    return total;
  }
}

function mapRow(row) {
  return {
    id: row.id,
    source: row.source,
    external_id: row.external_id,
    amount: Number(row.amount),
    currency: row.currency,
    status: row.status,
    occurred_at: row.occurred_at,
    updated_at: row.updated_at,
    metadata: row.metadata ?? {},
  };
}