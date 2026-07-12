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

## Deploy on Render (free tier)

Repo: `https://github.com/shrivatskrishan/data-integration-metrics-platform`

1. Sign up / log in at [render.com](https://render.com)
2. **New +** → **Web Service**
3. Connect GitHub and select `data-integration-metrics-platform`
4. Use these settings:

| Setting | Value |
|---------|-------|
| **Branch** | `main` |
| **Runtime** | Node |
| **Build Command** | `npm install` |
| **Start Command** | `npm start` |
| **Plan** | Free |

5. Add environment variables (optional — app works without Supabase):

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `SUPABASE_URL` | *(optional)* |
| `SUPABASE_SERVICE_ROLE_KEY` | *(optional)* |

6. Click **Create Web Service** — Render assigns a URL like:
   `https://data-integration-metrics-platform.onrender.com`

### Live endpoints to test

| What | URL |
|------|-----|
| Browser test UI | `https://YOUR-APP.onrender.com/` |
| Health check | `https://YOUR-APP.onrender.com/api/health` |
| Sync all sources (POST) | `https://YOUR-APP.onrender.com/api/sync` |
| Normalized records | `https://YOUR-APP.onrender.com/api/records` |
| Revenue summary | `https://YOUR-APP.onrender.com/api/metrics/revenue/summary?from=2026-07-01T00:00:00.000Z&to=2026-07-31T23:59:59.999Z` |

> **Note:** Free tier sleeps after ~15 min idle. First request after sleep may take 30–60 seconds (cold start).

Alternatively, use the included `render.yaml` blueprint: **New +** → **Blueprint** → select this repo.

## Quick start

```bash
npm install
npm test
npm start
```

## License

MIT