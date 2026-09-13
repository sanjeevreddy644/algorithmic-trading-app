import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

const fakeUser: any = {
  _id: "507f1f77bcf86cd799439011",
  id: "507f1f77bcf86cd799439011",
  email: "test@example.com",
  accountBalance: 100000,
  peakEquity: 100000,
  killSwitchEnabled: false,
  tradingMode: "paper",
  save: vi.fn().mockResolvedValue(undefined)
};

vi.mock("../../src/middleware/auth.middleware", () => ({
  requireAuth: (req: any, _res: any, next: any) => { req.user = fakeUser; next(); }
}));

vi.mock("../../src/services/trading.service", () => ({
  TradingService: class { placePaperOrder = vi.fn().mockResolvedValue({ trade: { id: "trade-1" }, position: { symbol: "NIFTY" }, accountBalance: 99900 }); }
}));

vi.mock("../../src/services/backtest.service", () => ({
  BacktestService: class { run = vi.fn().mockReturnValue({ symbol: "NIFTY MIDCAP 100", barsProcessed: 2, totalPnl: 0, returnPercent: 0, status: "ok" }); }
}));

vi.mock("../../src/services/live-risk.service", () => ({ validateLiveOrder: vi.fn().mockResolvedValue(undefined) }));
vi.mock("../../src/services/brokers/broker.service", () => ({ brokerService: { place: vi.fn() } }));
vi.mock("../../src/models/order-log.model", () => ({ OrderLogModel: { create: vi.fn().mockResolvedValue({}) } }));
vi.mock("../../src/services/paper-automation.service", () => ({ paperAutomationService: { snapshot: vi.fn().mockResolvedValue({ enabled: false, universe: "NIFTY50", validation: { eligible: false, days: 0 } }), setEnabled: vi.fn().mockResolvedValue({ enabled: true }), resetDay: vi.fn().mockResolvedValue({ tradingDate: "2026-09-13", initialCapital: 100000 }), scanUser: vi.fn().mockResolvedValue({ scanned: 50, entries: 0 }) } }));

import { app } from "../../src/app";

describe("API integration routes", () => {

  beforeEach(() => { fakeUser.tradingMode = "paper"; });

  it("POST /api/trading/orders reaches the paper trading service", async () => {
    const res = await request(app).post("/api/trading/orders").send({ symbol: "NIFTY", side: "buy", quantity: 1, price: 100 });
    expect(res.status).toBe(201);
    expect(res.body.trade.id).toBe("trade-1");
  });

  it("POST /api/backtests accepts a backtest payload", async () => {
    const res = await request(app).post("/api/backtest").send({ csv: "timestamp,open,high,low,close\n2026-01-01,1,2,1,2", symbol: "NIFTY", initialCapital: 100000 });
    expect(res.status).toBe(200);
    expect(res.body.barsProcessed).toBe(2);
  });

  it("GET /api/automation exposes the paper automation state", async () => {
    const res = await request(app).get("/api/automation");
    expect(res.status).toBe(200);
    expect(res.body.universe).toBe("NIFTY50");
  });

  it("POST /api/orders remains paper-safe in paper mode", async () => {
    const res = await request(app).post("/api/orders").send({ symbol: "NIFTY", side: "buy", quantity: 1, price: 100 });
    expect(res.status).toBe(201);
    expect(res.body.mode).toBe("paper");
  });
});
