# Data Integration & Metrics Platform

Sync pipeline + drift-free collected revenue metrics (Strategy Pattern).

## Revenue metrics (never drifts)

One canonical **allow-list** defines collected revenue: `paid`, `succeeded`, `completed`, `settled`.
Unknown statuses (e.g. `processing`, `voided`) never count — no exclusion list.

### Strategy Pattern

```
metrics/strategies/
  revenue-calculation-strategy.js   # Strategy interface
  allow-list-collected-strategy.js  # Concrete strategy (single source of truth)
revenue-definition-registry.js      # Throws if a 2nd strategy is registered
revenue-consistency-guard.js        # Summary must equal sum(breakdown)
revenue-metrics-service.js          # Both views use the same strategy instance
```

Run `npm test` — catches drift and duplicate strategy registration.

### API

| Endpoint | Description |
|----------|-------------|
| `GET /api/metrics/revenue/summary?from=&to=` | Total collected |
| `GET /api/metrics/revenue/breakdown?from=&to=&granularity=day\|week` | Period breakdown |
| `GET /api/metrics/revenue?from=&to=&granularity=day` | Both views + consistency check |

### Supabase (free Postgres)

1. Create a free project at supabase.com
2. Run `src/db/schema.sql` in the SQL Editor
3. Copy `.env.example` to `.env` and set `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY`
4. Run `npm run seed`

Without Supabase credentials, transactions use in-memory seeded mock data (Stripe / QuickBooks / Square test-mode shapes).

## Quick start

```bash
npm install
npm test
npm start
```

## License

MIT