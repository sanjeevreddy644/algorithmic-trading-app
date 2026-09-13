# Algorithmic Trading Web Application — Batch 7

Batch 7 adds an automated, paper-first intraday trading workflow for the NIFTY 50 while preserving the existing Zerodha/live-trading safeguards from Batch 6.

## Batch 7 additions

- NIFTY 50 universe with a versioned constituent list.
- Daily paper account reset to **₹100,000 at 09:15 IST**.
- Automated scans during the NSE session and simulated order/position management.
- Entry signals: previous **15-minute breakout/breakdown** or **VWAP deviation**.
- Risk budget: **1% of ₹100,000 = ₹1,000 maximum planned loss per trade**.
- Default stop distance: 0.5% of entry price; target distance is 2× stop distance, giving **1:2 risk/reward**.
- Maximum 5 simultaneous automated positions.
- Automatic stop/target handling and forced square-off at **15:20 IST**; no overnight automated positions.
- MongoDB persistence for paper accounts, trades, positions, daily performance, and validation state.
- Dashboard capital curve, daily P&L, profit factor, drawdown and live-trading validation status.
- Live mode remains locked until the last 20 completed paper days show:
  - Profit factor **> 1.2**
  - Maximum drawdown **< 15%**
  - Positive expectancy over the last 20 trading days
- Backend scheduler runs in **Asia/Kolkata** and only operates users who explicitly enable automated paper trading.

## Important data requirement

Automated scans use the Zerodha Kite Connect session to obtain NSE instrument tokens and 5-minute historical bars. Therefore, automated paper trading requires a connected Zerodha session even though **no real order is sent**. The automation uses the broker only as a market-data source and records simulated fills in MongoDB.

## 1. Install and test

```bash
cd backend
npm install
npm test

cd ../frontend
npm install
npm test
```

## 2. Configure environment

Create `backend/.env` from `backend/.env.example`. Set MongoDB and JWT secrets as before, plus Zerodha credentials/session settings required by the existing Batch 4 integration.

Daily automation defaults can be overridden with:

```env
PAPER_AUTOMATION_ENABLED=false
PAPER_INITIAL_CAPITAL=100000
PAPER_RISK_PER_TRADE_PERCENT=1
PAPER_REWARD_RISK_RATIO=2
PAPER_MAX_POSITIONS=5
PAPER_STOP_DISTANCE_PERCENT=0.5
PAPER_VWAP_DEVIATION_PERCENT=0.5
PAPER_SCAN_INTERVAL_MINUTES=5
PAPER_ENTRY_START_TIME=09:30
PAPER_MARKET_CLOSE_TIME=15:20
```

Keep `PAPER_AUTOMATION_ENABLED=false` until the application has been validated locally. A user can enable automation from the dashboard after login.

## 3. Run locally

Start MongoDB, then:

```bash
cd backend
npm run dev
```

In another terminal:

```bash
cd frontend
npm run dev
```

Backend: `http://localhost:4000`  
Frontend: `http://localhost:5173`

## 4. Daily automation workflow

The scheduler uses India Standard Time:

| Time | Workflow |
|---|---|
| 09:15 | Reset enabled paper accounts to ₹100,000 |
| 09:30 onward | Scan NIFTY 50 every ~5 minutes |
| During scan | Check existing positions, stop/target exits, then look for new signals |
| Max positions | 5 |
| 15:20 | Close all automated positions and finalize the day |

The scheduler is process-local. Run one backend worker for the local paper-trading scheduler; do not run multiple scheduler instances against the same database unless you add a distributed lock.

## 5. API

Authenticated endpoints:

```text
GET  /api/automation
POST /api/automation/toggle
POST /api/automation/reset
POST /api/automation/scan
GET  /api/performance?limit=30
```

The existing trading-mode endpoint remains the gate for paper/live mode. Enabling automated paper trading does not unlock live trading.

## 6. Live trading validation

The dashboard displays a validation gate based on the last 20 completed automated paper days. Live mode is eligible only when all three conditions pass:

```text
Profit factor > 1.2
Maximum drawdown < 15%
20-day average daily expectancy > 0
```

The server must still have `LIVE_TRADING_ENABLED=true`, and the user must provide the exact configured live-trading confirmation string before the existing live-order safeguards allow live mode.

## 7. Seed account

```bash
cd backend
npm run seed
```

Local seed credentials:

```text
Email:    seed@example.com
Password: SeedPassword123!
```

## Safety

- Automated trading is **paper-only** while `tradingMode=paper`.
- The automation never calls Zerodha's real order-placement API.
- Zerodha is used for market data/instrument discovery only.
- Live trading remains disabled by default.
- Never commit `.env`, API secrets, access tokens, or encryption keys.
- The NIFTY 50 constituent list can change; update `backend/src/config/nifty50.ts` when NSE publishes a constituent change.
