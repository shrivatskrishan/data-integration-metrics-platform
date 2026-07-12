import { COLLECTED_REVENUE_METRIC_ID } from '../utils/constants.js';
import { parseDateRange, roundMoney } from '../utils/date.js';
import { assertViewsAgree } from './revenue-consistency-guard.js';

/**
 * Single metrics service — both views delegate to the registered Strategy.
 * No independent revenue math lives here; only orchestration.
 */
export class RevenueMetricsService {
  #transactionRepo;
  #registry;
  #logger;

  constructor(transactionRepository, revenueDefinitionRegistry, logger) {
    this.#transactionRepo = transactionRepository;
    this.#registry = revenueDefinitionRegistry;
    this.#logger = logger;
  }

  #getStrategy() {
    return this.#registry.get(COLLECTED_REVENUE_METRIC_ID);
  }

  async #loadTransactions(from, to) {
    const range = parseDateRange(from, to);
    const transactions = await this.#transactionRepo.findByDateRange(range.from, range.to);
    return { range, transactions };
  }

  async getCollectedRevenueSummary(from, to) {
    const strategy = this.#getStrategy();
    const { range, transactions } = await this.#loadTransactions(from, to);
    const collected = strategy.filterCollected(transactions);
    const total = roundMoney(strategy.sumCollected(transactions));

    return {
      metricId: strategy.getMetricId(),
      definitionVersion: strategy.getDefinitionVersion(),
      allowList: strategy.getAllowList?.() ?? [],
      from: range.from,
      to: range.to,
      total,
      currency: 'USD',
      transactionCount: collected.length,
      excludedCount: transactions.length - collected.length,
    };
  }

  async getCollectedRevenueBreakdown(from, to, granularity = 'day') {
    const strategy = this.#getStrategy();
    const { range, transactions } = await this.#loadTransactions(from, to);
    const breakdown = strategy.groupCollectedByPeriod(transactions, {
      granularity,
      fromDate: range.fromDate,
      toDate: range.toDate,
    });
    const total = roundMoney(strategy.sumCollected(transactions));

    return {
      metricId: strategy.getMetricId(),
      definitionVersion: strategy.getDefinitionVersion(),
      from: range.from,
      to: range.to,
      granularity,
      total,
      currency: 'USD',
      breakdown,
    };
  }

  /** Returns both views and verifies they agree — use for API responses. */
  async getCollectedRevenueVerified(from, to, granularity = 'day') {
    const strategy = this.#getStrategy();
    const { range, transactions } = await this.#loadTransactions(from, to);
    const total = roundMoney(strategy.sumCollected(transactions));
    const breakdown = strategy.groupCollectedByPeriod(transactions, {
      granularity,
      fromDate: range.fromDate,
      toDate: range.toDate,
    });
    const collected = strategy.filterCollected(transactions);

    assertViewsAgree(total, breakdown);

    this.#logger.debug('Revenue views verified', { total, periods: breakdown.length });

    return {
      metricId: strategy.getMetricId(),
      definitionVersion: strategy.getDefinitionVersion(),
      allowList: strategy.getAllowList?.() ?? [],
      from: range.from,
      to: range.to,
      total,
      currency: 'USD',
      transactionCount: collected.length,
      excludedCount: transactions.length - collected.length,
      breakdown,
      consistency: { verified: true },
    };
  }
}