import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { AllowListCollectedStrategy } from './strategies/allow-list-collected-strategy.js';
import { RevenueDefinitionRegistry } from './revenue-definition-registry.js';
import { RevenueMetricsService } from './revenue-metrics-service.js';
import { InMemoryTransactionRepository } from '../repositories/transactions/in-memory-transaction-repository.js';
import { Logger } from '../utils/logger.js';
import { COLLECTED_REVENUE_METRIC_ID } from '../utils/constants.js';

describe('Collected revenue — never drifts', () => {
  const registry = new RevenueDefinitionRegistry();
  registry.register(new AllowListCollectedStrategy());

  it('rejects duplicate strategy registration', () => {
    assert.throws(
      () => registry.register(new AllowListCollectedStrategy()),
      /Duplicate revenue definition/,
    );
  });

  it('summary and breakdown always agree', async () => {
    const service = new RevenueMetricsService(
      new InMemoryTransactionRepository(),
      registry,
      new Logger('error'),
    );

    const from = '2026-07-01T00:00:00.000Z';
    const to = '2026-07-31T23:59:59.999Z';

    const summary = await service.getCollectedRevenueSummary(from, to);
    const breakdown = await service.getCollectedRevenueBreakdown(from, to, 'day');
    const verified = await service.getCollectedRevenueVerified(from, to, 'day');

    assert.equal(summary.total, breakdown.total);
    assert.equal(verified.total, summary.total);
    assert.equal(verified.consistency.verified, true);

    const breakdownSum = breakdown.breakdown.reduce((s, r) => s + r.total, 0);
    assert.equal(Math.round(breakdownSum * 100), Math.round(summary.total * 100));
  });

  it('only allow-listed statuses count (not exclusion list)', () => {
    const strategy = new AllowListCollectedStrategy();
    assert.equal(strategy.isCollected({ status: 'succeeded', amount: 1 }), true);
    assert.equal(strategy.isCollected({ status: 'paid', amount: 1 }), true);
    assert.equal(strategy.isCollected({ status: 'completed', amount: 1 }), true);
    assert.equal(strategy.isCollected({ status: 'pending', amount: 1 }), false);
    assert.equal(strategy.isCollected({ status: 'refunded', amount: 1 }), false);
    assert.equal(strategy.isCollected({ status: 'processing', amount: 1 }), false);
    assert.equal(strategy.isCollected({ status: 'voided', amount: 1 }), false);
    assert.equal(strategy.isCollected({ status: 'brand_new_status', amount: 1 }), false);
  });

  it('expected collected total from seed data', async () => {
    const service = new RevenueMetricsService(
      new InMemoryTransactionRepository(),
      registry,
      new Logger('error'),
    );
    const summary = await service.getCollectedRevenueSummary(
      '2026-07-01T00:00:00.000Z',
      '2026-07-31T23:59:59.999Z',
    );
    // Stripe: 48000+99 | QB: 5000+3000+750 | Square: 450+1200+2200 = 60699
    assert.equal(summary.total, 60699);
    assert.equal(summary.transactionCount, 8);
    assert.equal(summary.excludedCount, 7);
    assert.equal(summary.metricId, COLLECTED_REVENUE_METRIC_ID);
  });
});