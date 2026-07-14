/**
 * Strategy interface for revenue calculation.
 * All views (summary, breakdown) MUST use the same strategy instance.
 */
export class RevenueCalculationStrategy {
  getMetricId() { throw new Error('RevenueCalculationStrategy.getMetricId() must be implemented'); }
  getDefinitionVersion() { throw new Error('RevenueCalculationStrategy.getDefinitionVersion() must be implemented'); }
  isCollected(transaction: any) { throw new Error('RevenueCalculationStrategy.isCollected() must be implemented'); }
  filterCollected(transactions: any[]) { return transactions.filter((t) => this.isCollected(t)); }
  sumCollected(transactions: any[]) {
    return this.filterCollected(transactions).reduce((sum, t) => sum + Number(t.amount), 0);
  }
  groupCollectedByPeriod(transactions: any[], { granularity, from, to }: { granularity: string; from: string; to: string }) {
    throw new Error('RevenueCalculationStrategy.groupCollectedByPeriod() must be implemented');
  }
}