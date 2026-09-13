# Setup and Daily Paper Trading

## Requirements

- Node.js 18+
- npm
- MongoDB 7 or Docker Desktop
- A Zerodha Kite Connect app/session for automated market-data scans

## Install

```bash
cd backend
npm install
npm test

cd ../frontend
npm install
npm test
```

## Environment

Copy:

```text
backend/.env.example -> backend/.env
frontend/.env.example -> frontend/.env
```

For automation, verify the existing Zerodha configuration is present. The paper trader needs the broker session to discover NSE instrument tokens and read 5-minute bars; it does not place real orders.

Recommended paper settings:

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

## Start MongoDB

```bash
docker compose up -d mongodb
```

## Start backend

```bash
cd backend
npm run dev
```

The backend runs at `http://localhost:4000`.

At startup the backend starts the India-time scheduler. It performs the daily reset at 09:15 IST, scans approximately every five minutes during market hours, and closes automated paper positions at 15:20 IST.

## Start frontend

```bash
cd frontend
npm run dev
```

Open `http://localhost:5173`.

## Enable automated paper trading

1. Log in.
2. Confirm the account is in **PAPER** trading mode.
3. Connect the Zerodha session from the broker controls.
4. In the Dashboard, open **NIFTY 50 paper trader**.
5. Click **Start automated paper trading**.
6. The system will create today's paper account with ₹100,000 and begin scheduled scans.

You can use **Run scan now** for a controlled test. This is still paper trading.

## Strategy and risk model

Each scan uses completed 5-minute bars. The strategy checks:

- Breakout above the previous three 5-minute bars (15-minute range) → BUY.
- Breakdown below the previous three 5-minute bars → SELL.
- Otherwise, a move at least 0.5% above/below session VWAP can trigger a directional signal.

The default risk model is:

```text
Initial capital                 ₹100,000
Risk budget / trade             1% = ₹1,000
Stop distance                   0.5% of entry price
Reward:risk                     2:1
Maximum simultaneous positions  5
Forced square-off               15:20 IST
```

Position size is calculated from the ₹1,000 risk budget divided by the per-share stop distance. This means the **₹1,000 figure is the maximum planned loss budget**, not a literal ₹1,000 stock-price stop.

## MongoDB records

Batch 7 stores:

- `PaperAccount` — one paper account per user/trading date.
- `AutomationConfig` — user automation settings.
- `Trade` — automated entry/exit fills and P&L.
- `Position` — current automated positions, stop and target.
- `DailyPerformance` — daily P&L, win rate, profit factor, expectancy and drawdown.

## Live trading gate

Live mode is eligible only after at least 20 completed paper days and all of these are true:

```text
Profit factor > 1.2
Maximum drawdown < 15%
Average daily expectancy over last 20 days > 0
```

The existing `LIVE_TRADING_ENABLED` server flag and explicit confirmation remain mandatory. Passing the performance gate alone never sends a live order.

## Scheduler deployment note

The scheduler is intentionally process-local. In a single local backend process this is sufficient. In production, run one scheduler-enabled worker or add a distributed lock before horizontally scaling backend replicas; otherwise multiple instances could scan the same account.
