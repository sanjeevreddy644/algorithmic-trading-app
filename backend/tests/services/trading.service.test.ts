import { TradingService } from "../../src/services/trading.service";

describe("TradingService", () => {
  it("exposes the paper order execution service", () => {
    expect(new TradingService()).toBeInstanceOf(TradingService);
  });

  it.todo("places and fills a paper buy order");
  it.todo("updates the average entry price");
  it.todo("realizes P&L when a position is reduced");
  it.todo("applies configured slippage");
});
