import { FINANCE_SOURCES } from '../utils/constants.js';
import { buildRecordId } from '../utils/hash.js';

/** Sample transactions shaped like Stripe / QuickBooks / Square test-mode payloads. */
export const FINANCE_TRANSACTIONS_SEED = [
  // Stripe test-mode charges
  { source: FINANCE_SOURCES.STRIPE, external_id: 'ch_001', amount: 48000.00, currency: 'USD', status: 'succeeded', occurred_at: '2026-07-09T15:50:00.000Z', metadata: { description: 'Enterprise License' } },
  { source: FINANCE_SOURCES.STRIPE, external_id: 'ch_002', amount: 99.00, currency: 'USD', status: 'succeeded', occurred_at: '2026-07-08T10:00:00.000Z', metadata: { description: 'Starter Plan' } },
  { source: FINANCE_SOURCES.STRIPE, external_id: 'ch_003', amount: 12000.00, currency: 'USD', status: 'pending', occurred_at: '2026-07-10T14:00:00.000Z', metadata: { description: 'Pilot Deposit' } },
  { source: FINANCE_SOURCES.STRIPE, external_id: 'ch_004', amount: 2500.00, currency: 'USD', status: 'failed', occurred_at: '2026-07-11T08:30:00.000Z', metadata: { description: 'Add-on Seats' } },
  { source: FINANCE_SOURCES.STRIPE, external_id: 'ch_005', amount: 1500.00, currency: 'USD', status: 'refunded', occurred_at: '2026-07-07T16:00:00.000Z', metadata: { description: 'Refund' } },
  // QuickBooks sandbox invoices
  { source: FINANCE_SOURCES.QUICKBOOKS, external_id: 'inv_001', amount: 5000.00, currency: 'USD', status: 'paid', occurred_at: '2026-07-08T11:00:00.000Z', metadata: { invoice_number: 'QB-1001' } },
  { source: FINANCE_SOURCES.QUICKBOOKS, external_id: 'inv_002', amount: 3000.00, currency: 'USD', status: 'completed', occurred_at: '2026-07-09T12:00:00.000Z', metadata: { invoice_number: 'QB-1002' } },
  { source: FINANCE_SOURCES.QUICKBOOKS, external_id: 'inv_003', amount: 800.00, currency: 'USD', status: 'pending', occurred_at: '2026-07-10T09:00:00.000Z', metadata: { invoice_number: 'QB-1003' } },
  { source: FINANCE_SOURCES.QUICKBOOKS, external_id: 'inv_004', amount: 200.00, currency: 'USD', status: 'voided', occurred_at: '2026-07-06T14:00:00.000Z', metadata: { invoice_number: 'QB-1004' } },
  { source: FINANCE_SOURCES.QUICKBOOKS, external_id: 'inv_005', amount: 750.00, currency: 'USD', status: 'Paid', occurred_at: '2026-07-11T10:00:00.000Z', metadata: { invoice_number: 'QB-1005' } },
  // Square sandbox payments
  { source: FINANCE_SOURCES.SQUARE, external_id: 'sq_001', amount: 450.00, currency: 'USD', status: 'COMPLETED', occurred_at: '2026-07-07T16:30:00.000Z', metadata: { location: 'Store A' } },
  { source: FINANCE_SOURCES.SQUARE, external_id: 'sq_002', amount: 1200.00, currency: 'USD', status: 'paid', occurred_at: '2026-07-08T17:00:00.000Z', metadata: { location: 'Store B' } },
  { source: FINANCE_SOURCES.SQUARE, external_id: 'sq_003', amount: 100.00, currency: 'USD', status: 'failed', occurred_at: '2026-07-09T08:00:00.000Z', metadata: { location: 'Store A' } },
  { source: FINANCE_SOURCES.SQUARE, external_id: 'sq_004', amount: 500.00, currency: 'USD', status: 'processing', occurred_at: '2026-07-10T18:00:00.000Z', metadata: { location: 'Store C' } },
  { source: FINANCE_SOURCES.SQUARE, external_id: 'sq_005', amount: 2200.00, currency: 'USD', status: 'succeeded', occurred_at: '2026-07-11T19:00:00.000Z', metadata: { location: 'Store B' } },
];

export function toNormalizedTransaction(raw) {
  return {
    id: buildRecordId(raw.source, raw.external_id),
    source: raw.source,
    external_id: raw.external_id,
    amount: Number(raw.amount),
    currency: raw.currency ?? 'USD',
    status: raw.status,
    occurred_at: raw.occurred_at,
    updated_at: raw.updated_at ?? raw.occurred_at,
    metadata: raw.metadata ?? {},
  };
}

export function getSeededTransactions() {
  return FINANCE_TRANSACTIONS_SEED.map(toNormalizedTransaction);
}