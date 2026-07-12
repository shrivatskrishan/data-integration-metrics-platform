/**
 * Strategy interface for revenue calculation.
 * All views (summary, breakdown) MUST use the same strategy instance.
 */
export class RevenueCalculationStrategy {
  getMetricId() { throw new Error('RevenueCalculationStrategy.getMetricId() must be implemented'); }
  getDefinitionVersion() { throw new Error('RevenueCalculationStrategy.getDefinitionVersion() must be implemented'); }
  isCollected(transaction) { throw new Error('RevenueCalculationStrategy.isCollected() must be implemented'); }
  filterCollected(transactions) { return transactions.filter((t) => this.isCollected(t)); }
  sumCollected(transactions) {
    return this.filterCollected(transactions).reduce((sum, t) => sum + Number(t.amount), 0);
  }
  groupCollectedByPeriod(transactions, { granularity, from, to }) {
    throw new Error('RevenueCalculationStrategy.groupCollectedByPeriod() must be implemented');
  }
}