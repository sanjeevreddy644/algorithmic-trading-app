# Environment Variables

## Backend

Copy `backend/.env.example` to `backend/.env` before starting the backend locally or with Docker.

| Variable | Required | Default / example | Purpose |
|---|---|---|---|
| `NODE_ENV` | No | `development` | Runtime environment |
| `PORT` | No | `4000` | Backend HTTP port |
| `MONGODB_URI` | Yes | `mongodb://localhost:27017/algorithmic_trading` | MongoDB connection |
| `JWT_ACCESS_SECRET` | Yes | random secret | Signs access tokens |
| `JWT_REFRESH_SECRET` | Yes | random secret | Signs refresh tokens |
| `JWT_ACCESS_EXPIRES_IN` | No | `15m` | Access-token lifetime |
| `JWT_REFRESH_EXPIRES_IN` | No | `7d` | Refresh-token lifetime |
| `PAPER_TRADING_ENABLED` | No | `true` | Enables paper trading |
| `TRADING_MODE` | No | `paper` | Default account mode |
| `LIVE_TRADING_ENABLED` | No | `false` | Server-level live trading gate |
| `LIVE_TRADING_CONFIRMATION` | No | safety confirmation string | Exact confirmation required to unlock live mode |
| `MAX_POSITION_NOTIONAL` | No | `10000` | Paper position notional limit |
| `MAX_LIVE_ORDER_NOTIONAL` | No | `10000` | Live order notional limit |
| `MAX_RISK_PER_TRADE_PERCENT` | No | `0.5` | Live risk limit |
| `ZERODHA_API_KEY` | Live only | empty | Backend-only Kite API key |
| `ZERODHA_API_SECRET` | Live only | empty | Backend-only Kite API secret |
| `ZERODHA_REDIRECT_URL` | Live only | local callback | Kite redirect URL |
| `TOKEN_ENCRYPTION_KEY` | Live only | 64 hex chars | AES-256 key for stored broker access tokens |
| `ZERODHA_SYMBOL_ALLOWLIST` | Live only | empty | Explicitly permitted live symbols |
| `LIVE_REQUIRE_VOLATILITY_STATE` | No | `true` | Blocks live orders without a known volatility state |
| `LIVE_VOLATILITY_KILL_SWITCH` | No | `true` | Blocks live orders in extreme volatility |

## Frontend

Copy `frontend/.env.example` to `frontend/.env` for local Vite development.

| Variable | Default | Purpose |
|---|---|---|
| `VITE_API_BASE_URL` | `http://localhost:4000/api` | Public backend API base URL |
| `VITE_APP_NAME` | `Algorithmic Trading App` | UI title/branding |
| `VITE_REQUEST_TIMEOUT_MS` | `10000` | Frontend request timeout |

Never put Zerodha API secrets, broker access tokens, JWT signing secrets, or encryption keys in `frontend/.env` because Vite variables are client-visible.

## Docker

The Docker Compose backend overrides `MONGODB_URI` to use the Compose service name `mongodb`. The frontend's `VITE_API_BASE_URL` is a build-time public URL, so set it to a URL reachable from the user's browser, not an internal Docker hostname.

## Batch 7 daily paper automation

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
LIVE_MIN_PROFIT_FACTOR=1.2
LIVE_MAX_PAPER_DRAWDOWN_PERCENT=15
```

Automation uses Zerodha only for NSE market-data/instrument discovery. Real broker order placement is not used by the automated paper workflow.
