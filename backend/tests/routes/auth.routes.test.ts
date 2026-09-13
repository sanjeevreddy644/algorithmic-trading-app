import request from "supertest";
import { app } from "../../src/app";

describe("Authentication routes", () => {
  it("exposes the health endpoint", async () => {
    const response = await request(app).get("/health");

    expect(response.status).toBe(200);
    expect(response.body.status).toBe("ok");
  });

  it.todo("registers a new user");
  it.todo("logs in an existing user");
  it.todo("refreshes an access token");
  it.todo("rejects invalid credentials");
});
