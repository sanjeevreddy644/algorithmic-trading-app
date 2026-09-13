import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
  const generateSession = vi.fn().mockResolvedValue({ access_token: "access-token", public_token: "public-token", user_id: "AB1234" });
  const placeOrder = vi.fn().mockResolvedValue({ order_id: "OID-1" });
  const modifyOrder = vi.fn().mockResolvedValue({ order_id: "OID-1" });
  const cancelOrder = vi.fn().mockResolvedValue({ order_id: "OID-1" });
  const setAccessToken = vi.fn();
  const KiteConnectMock = vi.fn(() => ({ generateSession, setAccessToken, placeOrder, modifyOrder, cancelOrder }));
  return { generateSession, placeOrder, modifyOrder, cancelOrder, setAccessToken, KiteConnectMock };
});

vi.mock("kiteconnect", () => ({
  KiteConnect: mocks.KiteConnectMock,
  KiteTicker: vi.fn()
}));

import { KiteBrokerAdapter } from "../../src/services/brokers/kite.adapter";

describe("KiteBrokerAdapter", () => {
  it("exchanges a request token for an access token", async () => {
    const adapter = new KiteBrokerAdapter();
    const result = await adapter.exchangeRequestToken("request-token");
    expect(result.accessToken).toBe("access-token");
    expect(mocks.generateSession).toHaveBeenCalledWith("request-token", expect.any(String));
  });

  it("sanitizes order placement to an order id", async () => {
    const adapter = new KiteBrokerAdapter();
    const result = await adapter.placeOrder({ exchange: "NSE", tradingsymbol: "NIFTY", transaction_type: "BUY", quantity: 1, product: "MIS", order_type: "MARKET", validity: "DAY", variety: "regular" }, "access-token");
    expect(result).toEqual({ orderId: "OID-1" });
    expect(mocks.placeOrder).toHaveBeenCalled();
  });
});
