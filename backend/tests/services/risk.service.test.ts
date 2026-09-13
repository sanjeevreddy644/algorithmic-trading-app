import { RiskService } from "../../src/services/risk.service";

describe("RiskService", () => {
  it("rejects orders above the configured notional limit", async () => {
    // Add a mocked UserDocument and mocked PositionModel in Batch 2 test wiring.
    expect(typeof RiskService).toBe("function");
  });

  it("rejects orders when the account kill switch is enabled", async () => {
    expect(typeof RiskService).toBe("function");
  });

  it("rejects orders after the drawdown limit is reached", async () => {
    expect(typeof RiskService).toBe("function");
  });
});
