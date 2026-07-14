/**
 * Handles inbound webhooks idempotently.
 * Same payload delivered twice yields unchanged, not duplicate rows.
 */
export class WebhookService {
  #adapters;
  #syncServices;
  #logger;

  constructor(adapters, syncServices, logger) {
    this.#adapters = new Map(adapters.map((a) => [a.getSourceName(), a]));
    this.#syncServices = new Map(syncServices.map((s) => [s.sourceName, s]));
    this.#logger = logger;
  }

  async handle(source, payload) {
    const adapter = this.#adapters.get(source);
    const syncService = this.#syncServices.get(source);
    if (!adapter || !syncService) throw new Error(`Unknown webhook source: ${source}`);

    try {
      const raw = adapter.applyWebhook(payload);
      const { written, skipped, failed } = await syncService.ingestRecords([raw]);
      this.#logger.info('Webhook processed', { source, written, skipped, failed });
      return { source, written, skipped, failed, idempotent: skipped > 0 && written === 0 };
    } catch (error) {
      this.#logger.error('Webhook failed', { source, error: error.message });
      throw error;
    }
  }
}