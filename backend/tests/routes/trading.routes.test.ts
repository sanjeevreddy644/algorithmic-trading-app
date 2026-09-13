import request from "supertest";
import { app } from "../../src/app";

describe("Trading routes", () => {
  it("rejects unauthenticated order requests", async () => {
    const response = await request(app)
      .post("/api/trading/orders")
      .send({
        symbol: "AAPL",
        side: "buy",
        quantity: 1,
        price: 100
      });

    expect(response.status).toBe(401);
  });

  it.todo("places an authenticated paper order");
  it.todo("rejects orders blocked by risk management");
});
