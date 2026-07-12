import { CrmAdapter } from './adapters/crm/crm-adapter.js';
import { PaymentsAdapter } from './adapters/payments/payments-adapter.js';
import { CalendarAdapter } from './adapters/calendar/calendar-adapter.js';
import { CrmMockStore } from './mock/crm-store.js';
import { PaymentsMockStore } from './mock/payments-store.js';
import { CalendarMockStore } from './mock/calendar-store.js';
import { InMemoryRecordRepository } from './repositories/in-memory-record-repository.js';
import { createTransactionRepository } from './repositories/transactions/create-transaction-repository.js';
import { CursorStore } from './services/cursor-store.js';
import { SourceSyncService } from './services/source-sync-service.js';
import { SyncOrchestrator } from './services/sync-orchestrator.js';
import { WebhookService } from './services/webhook-service.js';
import { AllowListCollectedStrategy } from './metrics/strategies/allow-list-collected-strategy.js';
import { revenueDefinitionRegistry } from './metrics/revenue-definition-registry.js';
import { RevenueMetricsService } from './metrics/revenue-metrics-service.js';
import { Logger } from './utils/logger.js';
import { config } from './config/index.js';

export async function createAppContainer() {
  const logger = new Logger(config.logLevel);
  const repository = new InMemoryRecordRepository();
  const cursorStore = new CursorStore();
  const transactionRepository = await createTransactionRepository(logger);

  // Register the ONE canonical revenue strategy (throws if duplicated)
  revenueDefinitionRegistry.register(new AllowListCollectedStrategy());
  const revenueMetricsService = new RevenueMetricsService(
    transactionRepository,
    revenueDefinitionRegistry,
    logger,
  );

  const crmStore = new CrmMockStore();
  const paymentsStore = new PaymentsMockStore();
  const calendarStore = new CalendarMockStore();

  const adapters = [
    new CrmAdapter(crmStore),
    new PaymentsAdapter(paymentsStore),
    new CalendarAdapter(calendarStore),
  ];

  const syncServices = adapters.map(
    (adapter) => new SourceSyncService(adapter, repository, cursorStore, logger),
  );

  return {
    logger,
    repository,
    transactionRepository,
    cursorStore,
    orchestrator: new SyncOrchestrator(syncServices, logger),
    webhookService: new WebhookService(adapters, syncServices, logger),
    revenueMetricsService,
    revenueDefinitionRegistry,
    mockStores: { crm: crmStore, payments: paymentsStore, calendar: calendarStore },
  };
}