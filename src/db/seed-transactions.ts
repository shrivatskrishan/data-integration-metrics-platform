import { config } from '../config/index.js';
import { getSeededTransactions } from '../mock/finance-transactions-seed.js';
import { SupabaseTransactionRepository } from '../repositories/transactions/supabase-transaction-repository.js';
import { Logger } from '../utils/logger.js';

const logger = new Logger(config.logLevel);

async function main() {
  if (!config.supabase.enabled) {
    logger.error('Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env to seed Supabase', {});
    process.exitCode = 1;
    return;
  }

  const repo = new SupabaseTransactionRepository({
    url: config.supabase.url,
    serviceRoleKey: config.supabase.serviceRoleKey,
  });

  const txs = getSeededTransactions();
  const result = await repo.upsertMany(txs);
  logger.info('Seeded normalized_transactions', { count: txs.length, ...result });
}

main().catch((err) => {
  logger.error('Seed failed', { error: err.message });
  process.exitCode = 1;
});