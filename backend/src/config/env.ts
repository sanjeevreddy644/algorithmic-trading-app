import dotenv from "dotenv";

dotenv.config();

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}
function optional(name: string, fallback = ""): string { return process.env[name] ?? fallback; }
function numberValue(name: string, fallback: number): number {
  const value = process.env[name];
  if (!value) return fallback;
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) throw new Error(`Environment variable ${name} must be numeric`);
  return parsed;
}
function booleanValue(name: string, fallback: boolean): boolean {
  const value = process.env[name];
  if (value === undefined) return fallback;
  return value.toLowerCase() === "true";
}

const allowlist = optional("ZERODHA_SYMBOL_ALLOWLIST")
  .split(",").map(s => s.trim().toUpperCase()).filter(Boolean);

const corsOrigins = optional("CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173")
  .split(",").map(s => s.trim()).filter(Boolean);

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: numberValue("PORT", 4000),
  corsOrigins,
  mongodbUri: required("MONGODB_URI"),
  jwtAccessSecret: required("JWT_ACCESS_SECRET"),
  jwtRefreshSecret: required("JWT_REFRESH_SECRET"),
  jwtAccessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN ?? "15m",
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? "7d",
  paperTradingEnabled: booleanValue("PAPER_TRADING_ENABLED", true),
  defaultTradingMode: (optional("TRADING_MODE", "paper") === "live" ? "live" : "paper") as "paper" | "live",
  liveTradingEnabled: booleanValue("LIVE_TRADING_ENABLED", false),
  liveTradingConfirmation: optional("LIVE_TRADING_CONFIRMATION", "I_UNDERSTAND_LIVE_TRADING_RISK"),
  liveMinPaperTrades: numberValue("LIVE_MIN_PAPER_TRADES", 0),
  liveMinPaperReturnPercent: numberValue("LIVE_MIN_PAPER_RETURN_PERCENT", 0),
  liveMinProfitFactor: numberValue("LIVE_MIN_PROFIT_FACTOR", 1.2),
  liveMaxPaperDrawdownPercent: numberValue("LIVE_MAX_PAPER_DRAWDOWN_PERCENT", 15),
  maxPositionNotional: numberValue("MAX_POSITION_NOTIONAL", 10000),
  maxDrawdownPercent: numberValue("MAX_DRAWDOWN_PERCENT", 10),
  maxLiveOrderNotional: numberValue("MAX_LIVE_ORDER_NOTIONAL", 10000),
  maxRiskPerTradePercent: numberValue("MAX_RISK_PER_TRADE_PERCENT", 0.5),
  zerodhaSymbolAllowlist: allowlist,
  liveRequireVolatilityState: booleanValue("LIVE_REQUIRE_VOLATILITY_STATE", true),
  liveVolatilityKillSwitch: booleanValue("LIVE_VOLATILITY_KILL_SWITCH", true),
  defaultSlippageBps: numberValue("DEFAULT_SLIPPAGE_BPS", 5),
  paperAutomationEnabled: booleanValue("PAPER_AUTOMATION_ENABLED", false),
  paperInitialCapital: numberValue("PAPER_INITIAL_CAPITAL", 100000),
  paperRiskPerTradePercent: numberValue("PAPER_RISK_PER_TRADE_PERCENT", 1),
  paperRewardRiskRatio: numberValue("PAPER_REWARD_RISK_RATIO", 2),
  paperMaxPositions: numberValue("PAPER_MAX_POSITIONS", 5),
  paperStopDistancePercent: numberValue("PAPER_STOP_DISTANCE_PERCENT", 0.5),
  paperVwapDeviationPercent: numberValue("PAPER_VWAP_DEVIATION_PERCENT", 0.5),
  paperScanIntervalMinutes: numberValue("PAPER_SCAN_INTERVAL_MINUTES", 5),
  paperEntryStartTime: optional("PAPER_ENTRY_START_TIME", "09:30"),
  paperMarketCloseTime: optional("PAPER_MARKET_CLOSE_TIME", "15:20"),
  zerodhaApiKey: optional("ZERODHA_API_KEY"),
  zerodhaApiSecret: optional("ZERODHA_API_SECRET"),
  zerodhaRedirectUrl: optional("ZERODHA_REDIRECT_URL"),
  tokenEncryptionKey: optional("TOKEN_ENCRYPTION_KEY"),
  wsReconnectMaxMs: numberValue("ZERODHA_WS_RECONNECT_MAX_MS", 30000),
  wsReconnectBaseMs: numberValue("ZERODHA_WS_RECONNECT_BASE_MS", 1000)
};
