import { Router } from 'express';
import { invalidSourceMessage, isValidSource } from '../../utils/validation.js';

export function createSyncRoutes({ orchestrator, cursorStore, mockStores }) {
  const router = Router();

  router.post('/', async (req, res, next) => {
    try {
      const result = await orchestrator.syncAll({ forceFull: req.body?.forceFull === true });
      res.status(result.allSucceeded ? 200 : 207).json(result);
    } catch (error) { next(error); }
  });

  router.get('/status', (_req, res) => {
    res.json({ lastRun: orchestrator.getLastRun(), cursors: cursorStore.getAll() });
  });

  router.put('/cursors/:source', (req, res) => {
    const { source } = req.params;
    if (!isValidSource(source)) return res.status(400).json({ error: invalidSourceMessage() });
    cursorStore.set(source, req.body?.cursor ?? null);
    res.json({ source, cursor: cursorStore.get(source) });
  });

  router.delete('/cursors/:source?', (req, res) => {
    cursorStore.reset(req.params.source);
    res.json({ reset: req.params.source ?? 'all', cursors: cursorStore.getAll() });
  });

  router.post('/simulate/:source/:scenario', (req, res) => {
    const { source, scenario } = req.params;
    const store = mockStores?.[source];
    if (!store) return res.status(400).json({ error: `Unknown source: ${source}` });

    switch (scenario) {
      case 'unavailable': store.setUnavailable(true); break;
      case 'expired-token':
        if (typeof store.setExpiredToken === 'function') store.setExpiredToken(true);
        else return res.status(400).json({ error: `${source} does not support expired-token simulation` });
        break;
      case 'recover':
        store.setUnavailable(false);
        if (typeof store.setExpiredToken === 'function') store.setExpiredToken(false);
        break;
      default: return res.status(400).json({ error: 'Use: unavailable, expired-token, recover' });
    }
    res.json({ source, scenario, applied: true });
  });

  router.post('/:source', async (req, res, next) => {
    try {
      const { source } = req.params;
      if (!isValidSource(source)) return res.status(400).json({ error: invalidSourceMessage() });
      const result = await orchestrator.syncOne(source, { forceFull: req.body?.forceFull === true });
      res.status(result.success ? 200 : 502).json(result);
    } catch (error) { next(error); }
  });

  return router;
}