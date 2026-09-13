import { describe, expect, it, vi } from "vitest";
import { getPositions, getTrades, getMetrics } from "../api/trading";
import { runBacktest } from "../api/backtest";
import { apiFetch } from "../api/client";

vi.mock("../api/client", () => ({
  api: {
    get: vi.fn((path) => Promise.resolve({ path })),
    post: vi.fn((path, body) => Promise.resolve({ path, body }))
  },
  apiFetch: vi.fn()
}));

import { api } from "../api/client";

describe("Batch 6 API call mocks", () => {
  it("maps trading API functions to expected routes", async () => {
    await getPositions(); await getTrades(); await getMetrics();
    expect(api.get).toHaveBeenNthCalledWith(1, "/positions");
    expect(api.get).toHaveBeenNthCalledWith(2, "/trading/trades");
    expect(api.get).toHaveBeenNthCalledWith(3, "/trading/metrics");
  });

  it("maps backtest API to the backend backtests route", async () => {
    await runBacktest({ csv: "x", symbol: "NIFTY", initialCapital: 100000 });
    expect(api.post).toHaveBeenCalledWith("/backtest", expect.any(Object));
  });
});
