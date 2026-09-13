# Algorithmic Trading Web Application — Batch 5

Batch 5 is a frontend-only incremental update. The backend is unchanged.

## Included
- JWT login/register screens
- Auth context with access/refresh token handling
- Dashboard with positions, P&L, trade history, backtest report, strategy parameters, trading mode and safety alerts
- Navbar, sidebar and reusable widgets
- Recharts equity/backtest visualization
- Frontend API layer for auth, trading, backtest and orders
- Responsive CSS styling
- Vitest + React Testing Library unit-test stubs

## Run

```bash
cd frontend
npm install
npm start
```

The Vite UI normally starts at http://localhost:5173.

## Environment

Copy `.env.example` to `.env` and adjust `VITE_API_BASE_URL` if the backend is not running on `http://localhost:5000/api`.

## Backend compatibility

The UI calls the Batch 4 routes that are present. Trade history, metrics and strategy configuration calls are intentionally tolerant of unavailable endpoints so the UI still renders when those read/write routes are not yet exposed by the backend.

Live trading remains backend-gated. The frontend never stores Zerodha API secrets or access tokens.
