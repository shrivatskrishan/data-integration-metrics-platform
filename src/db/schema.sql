CREATE TABLE IF NOT EXISTS normalized_transactions (
  id            TEXT PRIMARY KEY,
  source        TEXT NOT NULL,
  external_id   TEXT NOT NULL,
  amount        NUMERIC(15, 2) NOT NULL CHECK (amount >= 0),
  currency      TEXT NOT NULL DEFAULT 'USD',
  status        TEXT NOT NULL,
  occurred_at   TIMESTAMPTZ NOT NULL,
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  metadata      JSONB NOT NULL DEFAULT '{}'::jsonb,
  UNIQUE (source, external_id)
);
CREATE INDEX IF NOT EXISTS idx_transactions_occurred_at ON normalized_transactions (occurred_at);
CREATE INDEX IF NOT EXISTS idx_transactions_source ON normalized_transactions (source);