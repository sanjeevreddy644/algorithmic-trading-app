import { describe, expect, it, vi } from "vitest";
import { BacktestService } from "../../src/services/backtest.service";

const csv = `timestamp,open,high,low,close,volume\n2026-01-02T09:15:00Z,100,101,99,100.5,1000\n2026-01-02T09:20:00Z,100.5,102,100,101.5,1200`;

describe("BacktestService", () => {
  it("parses OHLCV CSV and returns summary metadata", () => {
    const strategy = { generateSignal: vi.fn().mockReturnValue({ action: "hold", confidence: 0, reason: "test" }) };
    const service = new BacktestService(strategy as any);
    const result = service.run({ csv, symbol: "NIFTY MIDCAP 100", initialCapital: 100000 });
    expect(result.barsProcessed).toBe(2);
    expect(result.symbol).toBe("NIFTY MIDCAP 100");
    expect(result.initialCapital).toBe(100000);
    expect(result.status).toBe("stub");
    expect(strategy.generateSignal).toHaveBeenCalledTimes(1);
  });
});
