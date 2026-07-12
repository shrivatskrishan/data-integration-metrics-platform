import { config } from '../../config/index.js';
import { InMemoryTransactionRepository } from './in-memory-transaction-repository.js';
import { SupabaseTransactionRepository } from './supabase-transaction-repository.js';

export async function createTransactionRepository(logger) {
  if (config.supabase.enabled) {
    logger.info('Using Supabase transaction repository');
    const repo = new SupabaseTransactionRepository({
      url: config.supabase.url,
      serviceRoleKey: config.supabase.serviceRoleKey,
    });
    await repo.seedIfEmpty();
    return repo;
  }

  logger.info('Using in-memory transaction repository (set SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY for Postgres)');
  return new InMemoryTransactionRepository({ seed: true });
}