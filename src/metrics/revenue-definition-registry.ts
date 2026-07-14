/**
 * Ensures exactly ONE canonical revenue definition is registered.
 * Registering a second strategy for the same metric throws — catches drift at startup.
 */
export class RevenueDefinitionRegistry {
  #strategies = new Map();

  register(strategy) {
    const metricId = strategy.getMetricId();
    if (this.#strategies.has(metricId)) {
      throw new Error(
        `Duplicate revenue definition for "${metricId}". ` +
        'All views must share one strategy — do not register a second calculator.',
      );
    }
    this.#strategies.set(metricId, Object.freeze(strategy));
    return strategy;
  }

  get(metricId) {
    const strategy = this.#strategies.get(metricId);
    if (!strategy) throw new Error(`No revenue strategy registered for "${metricId}"`);
    return strategy;
  }

  getRegisteredMetricIds() {
    return [...this.#strategies.keys()];
  }
}

export const revenueDefinitionRegistry = new RevenueDefinitionRegistry();