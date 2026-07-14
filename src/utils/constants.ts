export const SOURCES = Object.freeze({ CRM: 'crm', PAYMENTS: 'payments', CALENDAR: 'calendar' });
export const ENTITY_TYPES = Object.freeze({ CONTACT: 'contact', DEAL: 'deal', PAYMENT: 'payment', EVENT: 'event' });
export const STALE_CURSOR_THRESHOLD = '2026-07-01T00:00:00.000Z';
export const FINANCE_SOURCES = Object.freeze({ STRIPE: 'stripe', QUICKBOOKS: 'quickbooks', SQUARE: 'square' });
export const COLLECTED_STATUS_ALLOW_LIST = Object.freeze(['paid', 'succeeded', 'completed', 'settled']);
export const COLLECTED_REVENUE_METRIC_ID = 'collected_revenue';