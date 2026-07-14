export type Primitive = string | number | boolean | bigint | symbol | null | undefined;
export type JsonPrimitive = string | number | boolean | null;
export type JsonValue = JsonPrimitive | JsonValue[] | { [key: string]: JsonValue };

export type SourceName = 'crm' | 'payments' | 'calendar';
export type MetricsGranularity = 'day' | 'week';

export interface SyncErrorPayload {
  message: string;
  code: string;
}

export interface SourceSyncResult {
  source: string;
  mode: 'full' | 'incremental';
  fetched: number;
  written: number;
  skipped: number;
  failed: number;
  cursor: unknown;
  fallbackToFull: boolean;
  success: boolean;
  error: SyncErrorPayload | null;
  completedAt: string;
}

export interface SourceSyncRunResult {
  runId: string;
  sources: SourceSyncResult[];
  totals: {
    fetched: number;
    written: number;
    skipped: number;
    failed: number;
  };
  allSucceeded: boolean;
  completedAt: string;
}

export interface RevenueBreakdownRow {
  period: string;
  total: number;
  count: number;
  sources: Record<string, number>;
}

export interface RevenueSummary {
  total: number;
  metricId: string;
  definitionVersion: string;
}

export interface RevenueVerifiedResult {
  verified: boolean;
  total: number;
  breakdownTotal: number;
  breakdown?: RevenueBreakdownRow[];
  summary?: RevenueSummary;
  consistency?: {
    verified: boolean;
    matchesSummary: boolean;
  };
}

export interface RecordLike {
  id: string;
  source: SourceName;
  contentHash?: string;
  syncedAt?: string;
  [key: string]: unknown;
}

export interface TransactionLike {
  id?: string;
  amount: number | string;
  status?: string;
  occurred_at?: string;
  source?: string;
  [key: string]: unknown;
}

export interface MockStoreLike {
  setUnavailable: (value: boolean) => void;
  setExpiredToken?: (value: boolean) => void;
}

export interface SyncRouteDependencies {
  orchestrator: {
    syncAll: (options?: { forceFull?: boolean }) => Promise<SourceSyncRunResult>;
    syncOne: (source: string, options?: { forceFull?: boolean }) => Promise<{ success: boolean }>;
    getLastRun: () => unknown;
  };
  cursorStore: {
    getAll: () => Record<string, unknown>;
    set: (source: string, cursor: unknown) => void;
    get: (source: string) => unknown;
    reset: (source?: string) => void;
  };
  mockStores?: Record<string, MockStoreLike>;
}

export interface MetricsQueryParams {
  from?: string;
  to?: string;
  granularity?: string;
}

export interface ParsedMetricsQuery {
  from: string;
  to: string;
  granularity: MetricsGranularity;
}

export interface SyncErrorOptions {
  code?: string;
  source?: string;
  statusCode?: number;
  cause?: unknown;
}

export interface IncrementalFetchOptions {
  source: string;
  cursor: unknown;
  staleThreshold: number;
  expiredToken?: { active: boolean };
}
