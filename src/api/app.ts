import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createSyncRoutes } from './routes/sync.routes.js';
import { createRecordsRoutes } from './routes/records.routes.js';
import { createWebhooksRoutes } from './routes/webhooks.routes.js';
import { createHealthRoutes } from './routes/health.routes.js';
import { createMetricsRoutes } from './routes/metrics.routes.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function createApp(container) {
  const app = express();
  app.use(express.json());
  app.use(express.static(path.join(__dirname, '../../public')));
  app.use('/api/health', createHealthRoutes());
  app.use('/api/sync', createSyncRoutes(container));
  app.use('/api/records', createRecordsRoutes(container));
  app.use('/api/webhooks', createWebhooksRoutes(container));
  app.use('/api/metrics', createMetricsRoutes(container));
  app.use((err, _req, res, _next) => {
    res.status(err.statusCode ?? err.status ?? 500).json({ error: err.message, code: err.code ?? 'INTERNAL_ERROR' });
  });
  return app;
}