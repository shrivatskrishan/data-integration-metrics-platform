import { Router } from 'express';
import { invalidSourceMessage, isValidSource } from '../../utils/validation.js';

export function createWebhooksRoutes({ webhookService }) {
  const router = Router();

  router.post('/:source', async (req, res, next) => {
    try {
      const { source } = req.params;
      if (!isValidSource(source)) return res.status(400).json({ error: invalidSourceMessage() });
      const result = await webhookService.handle(source, req.body);
      res.status(200).json(result);
    } catch (error) { next(error); }
  });

  return router;
}