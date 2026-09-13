import { describe, expect, it, vi } from "vitest";
import { TradingService } from "../../src/services/trading.service";

vi.mock("../../src/models/trade.model", () => ({ TradeModel: { create: vi.fn() } }));
vi.mock("../../src/models/position.model", () => ({ PositionModel: { findOneAndUpdate: vi.fn(), findOne: vi.fn().mockResolvedValue(null), find: vi.fn().mockResolvedValue([]) } }));
vi.mock("../../src/models/metric.model", () => ({ MetricModel: { create: vi.fn() } }));

import { TradeModel } from "../../src/models/trade.model";
import { PositionModel } from "../../src/models/position.model";
import { MetricModel } from "../../src/models/metric.model";

describe("TradingService", () => {
  it("rejects through the risk service before writing trades", async () => {
    const risk = { validateOrder: vi.fn().mockRejectedValue(new Error("risk blocked")) };
    const service = new TradingService(risk as any);
    const user: any = { _id: "507f1f77bcf86cd799439011", accountBalance: 100000 };
    await expect(service.placePaperOrder(user, { symbol: "NIFTY", side: "buy", quantity: 1, price: 100 })).rejects.toThrow("risk blocked");
    expect(TradeModel.create).not.toHaveBeenCalled();
  });

  it("fills a valid paper buy and updates the position", async () => {
    vi.mocked(TradeModel.create).mockResolvedValue({
      realizedPnl: 0, save: vi.fn().mockResolvedValue(undefined), id: "trade-1"
    } as any);
    const position: any = {
      quantity: 0, averageEntryPrice: 0, realizedPnl: 0,
      save: vi.fn().mockResolvedValue(undefined)
    };
    vi.mocked(PositionModel.findOneAndUpdate).mockResolvedValue(position);
    vi.mocked(MetricModel.create).mockResolvedValue({} as any);
    const risk = { validateOrder: vi.fn().mockResolvedValue(undefined) };
    const service = new TradingService(risk as any);
    const user: any = { _id: "507f1f77bcf86cd799439011", id: "507f1f77bcf86cd799439011", accountBalance: 100000, peakEquity: 100000, save: vi.fn().mockResolvedValue(undefined) };
    const result = await service.placePaperOrder(user, { symbol: "NIFTY", side: "buy", quantity: 2, price: 100 });
    expect(result.position.quantity).toBe(2);
    expect(user.accountBalance).toBeLessThan(100000);
    expect(position.save).toHaveBeenCalled();
    expect(MetricModel.create).toHaveBeenCalled();
  });

  it("rejects an oversized sell without writing a trade", async () => {
    vi.mocked(TradeModel.create).mockClear();
    vi.mocked(PositionModel.findOne).mockResolvedValueOnce({ quantity: 1, averageEntryPrice: 100 } as any);
    const service = new TradingService({ validateOrder: vi.fn().mockResolvedValue(undefined) } as any);
    const user: any = { _id: "507f1f77bcf86cd799439011", accountBalance: 100000 };
    await expect(service.placePaperOrder(user, { symbol: "NIFTY", side: "sell", quantity: 5, price: 100 })).rejects.toThrow("Cannot sell more");
    expect(TradeModel.create).not.toHaveBeenCalled();
  });

  it("coerces string quantities instead of concatenating them", async () => {
    vi.mocked(TradeModel.create).mockResolvedValue({ save: vi.fn().mockResolvedValue(undefined) } as any);
    const position: any = { quantity: 5, averageEntryPrice: 100, realizedPnl: 0, markPrice: 100, save: vi.fn().mockResolvedValue(undefined) };
    vi.mocked(PositionModel.findOne).mockResolvedValueOnce(position);
    const service = new TradingService({ validateOrder: vi.fn().mockResolvedValue(undefined) } as any);
    const user: any = { _id: "507f1f77bcf86cd799439011", id: "507f1f77bcf86cd799439011", accountBalance: 100000, peakEquity: 100000, save: vi.fn().mockResolvedValue(undefined) };
    await service.placePaperOrder(user, { symbol: "nifty", side: "BUY" as any, quantity: "10" as any, price: "100" as any });
    expect(position.quantity).toBe(15);
  });

  it("rejects non-numeric quantities", async () => {
    const service = new TradingService({ validateOrder: vi.fn() } as any);
    await expect(service.placePaperOrder({} as any, { symbol: "NIFTY", side: "buy", quantity: "abc" as any, price: 100 })).rejects.toThrow("quantity");
  });
});
