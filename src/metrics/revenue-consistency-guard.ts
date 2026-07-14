import { roundMoney } from '../utils/date.js';

export class RevenueDriftError extends Error {
  code: string;
  statusCode: number;
  summaryTotal: number;
  breakdownTotal: number;
  diff: number;

  constructor(summaryTotal: number, breakdownTotal: number, diff: number) {
    super(`Revenue views drifted: summary=${summaryTotal}, breakdown sum=${breakdownTotal}, diff=${diff}`);
    this.name = 'RevenueDriftError';
    this.code = 'REVENUE_DRIFT';
    this.statusCode = 500;
    this.summaryTotal = summaryTotal;
    this.breakdownTotal = breakdownTotal;
    this.diff = diff;
  }
}

/**
 * Ensures summary and breakdown always agree.
 * Called on every metrics response — catches duplicate calculation paths immediately.
 */
export function assertViewsAgree(summaryTotal: number, breakdownRows: Array<{ total: number }>) {
  const breakdownTotal = roundMoney(breakdownRows.reduce((sum, row) => sum + row.total, 0));
  const summary = roundMoney(summaryTotal);
  const diff = roundMoney(Math.abs(summary - breakdownTotal));

  if (diff > 0.001) {
    throw new RevenueDriftError(summary, breakdownTotal, diff);
  }

  return { verified: true, total: summary, breakdownTotal };
}