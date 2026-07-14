import { Router, type NextFunction, type Request, type Response } from 'express';
import type { MetricsQueryParams, ParsedMetricsQuery } from '../../types/index.js';

type AppError = Error & {
  statusCode?: number;
  code?: string;
};

function parseQuery(req: Request): ParsedMetricsQuery {
  const { from, to, granularity = 'day' } = req.query as MetricsQueryParams;
  if (!from || !to) {
    const err = new Error('Query params "from" and "to" (ISO dates) are required') as AppError;
    err.statusCode = 400;
    throw err;
  }
  if (granularity !== 'day' && granularity !== 'week') {
    const err = new Error('granularity must be "day" or "week"') as AppError;
    err.statusCode = 400;
    throw err;
  }
  return { from, to, granularity };
}

export function createMetricsRoutes({ revenueMetricsService }: { revenueMetricsService: any }) {
  const router = Router();

  /** Summary total — uses canonical Strategy only */
  router.get('/revenue/summary', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { from, to } = parseQuery(req);
      const summary = await revenueMetricsService.getCollectedRevenueSummary(from, to);
      res.json(summary);
    } catch (error) { next(error); }
  });

  /** Day/week breakdown — same Strategy, verified against summary */
  router.get('/revenue/breakdown', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { from, to, granularity } = parseQuery(req);
      const breakdown = await revenueMetricsService.getCollectedRevenueBreakdown(from, to, granularity);
      const summary = await revenueMetricsService.getCollectedRevenueSummary(from, to);
      if (Math.abs(summary.total - breakdown.total) > 0.001) {
        const err = new Error('Revenue drift detected between summary and breakdown') as AppError;
        err.statusCode = 500;
        err.code = 'REVENUE_DRIFT';
        throw err;
      }
      res.json({ ...breakdown, consistency: { verified: true, matchesSummary: true } });
    } catch (error) { next(error); }
  });

  /** Both views in one response with consistency guard */
  router.get('/revenue', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { from, to, granularity } = parseQuery(req);
      const result = await revenueMetricsService.getCollectedRevenueVerified(from, to, granularity);
      res.json(result);
    } catch (error) { next(error); }
  });

  return router;
}