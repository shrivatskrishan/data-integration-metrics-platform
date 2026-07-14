import { COLLECTED_REVENUE_METRIC_ID, COLLECTED_STATUS_ALLOW_LIST } from '../../utils/constants.js';
import { bucketKey, isWithinRange, roundMoney } from '../../utils/date.js';
import { RevenueCalculationStrategy } from './revenue-calculation-strategy.js';

const DEFINITION_VERSION = 'allow-list-v1';

export class AllowListCollectedStrategy extends RevenueCalculationStrategy {
  #allowList;

  constructor(allowList = COLLECTED_STATUS_ALLOW_LIST) {
    super();
    this.#allowList = new Set(allowList.map((s) => s.toLowerCase()));
  }

  getMetricId() { return COLLECTED_REVENUE_METRIC_ID; }
  getDefinitionVersion() { return DEFINITION_VERSION; }
  getAllowList() { return [...this.#allowList]; }

  isCollected(transaction) {
    const normalized = String(transaction.status ?? '').trim().toLowerCase();
    return this.#allowList.has(normalized);
  }

  groupCollectedByPeriod(transactions: any[], { granularity, from, to }: { granularity: string; from: string; to: string }) {
    const buckets = new Map();

    for (const tx of this.filterCollected(transactions)) {
      if (!isWithinRange(tx.occurred_at, from, to)) continue;
      const key = bucketKey(tx.occurred_at, granularity);
      if (!key) continue;
      const bucket = buckets.get(key) ?? { period: key, total: 0, count: 0, sources: {} };
      bucket.total = roundMoney(bucket.total + Number(tx.amount));
      bucket.count += 1;
      bucket.sources[tx.source] = (bucket.sources[tx.source] ?? 0) + 1;
      buckets.set(key, bucket);
    }

    return [...buckets.values()].sort((a, b) => a.period.localeCompare(b.period));
  }
}