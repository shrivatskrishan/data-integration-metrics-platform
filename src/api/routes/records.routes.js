import { Router } from 'express';

export function createRecordsRoutes({ repository }) {
  const router = Router();

  router.get('/', async (req, res, next) => {
    try {
      const source = req.query.source ?? undefined;
      const records = await repository.findAll({ source });
      res.json({ count: records.length, records });
    } catch (error) { next(error); }
  });

  router.get('/:id', async (req, res, next) => {
    try {
      const record = await repository.findById(req.params.id);
      if (!record) return res.status(404).json({ error: 'Record not found' });
      res.json(record);
    } catch (error) { next(error); }
  });

  return router;
}