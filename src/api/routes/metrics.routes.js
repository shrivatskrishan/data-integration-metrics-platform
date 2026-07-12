import { Router } from 'express';

function parseQuery(req) {
  const { from, to, granularity = 'day' } = req.query;
  if (!from || !to) {
    const err = new Error('Query params "from" and "to" (ISO dates) are required');
    err.statusCode = 400;
    throw err;
  }
  if (granularity !== 'day' && granularity !== 'week') {
    const err = new Error('granularity must be "day" or "week"');
    err.statusCode = 400;
    throw err;
  }
  return { from, to, granularity };
}

export function createMetricsRoutes({ revenueMetricsService }) {
  const router = Router();

  /** Summary total — uses canonical Strategy only */
  router.get('/revenue/summary', async (req, res, next) => {
    try {
      const { from, to } = parseQuery(req);
      const summary = await revenueMetricsService.getCollectedRevenueSummary(from, to);
      res.json(summary);
    } catch (error) { next(error); }
  });

  /** Day/week breakdown — same Strategy, verified against summary */
  router.get('/revenue/breakdown', async (req, res, next) => {
    try {
      const { from, to, granularity } = parseQuery(req);
      const breakdown = await revenueMetricsService.getCollectedRevenueBreakdown(from, to, granularity);
      const summary = await revenueMetricsService.getCollectedRevenueSummary(from, to);
      if (Math.abs(summary.total - breakdown.total) > 0.001) {
        const err = new Error('Revenue drift detected between summary and breakdown');
        err.statusCode = 500;
        err.code = 'REVENUE_DRIFT';
        throw err;
      }
      res.json({ ...breakdown, consistency: { verified: true, matchesSummary: true } });
    } catch (error) { next(error); }
  });

  /** Both views in one response with consistency guard */
  router.get('/revenue', async (req, res, next) => {
    try {
      const { from, to, granularity } = parseQuery(req);
      const result = await revenueMetricsService.getCollectedRevenueVerified(from, to, granularity);
      res.json(result);
    } catch (error) { next(error); }
  });

  return router;
}