import { describe, expect, it } from "vitest";
import { app } from "../../src/app";
import request from "supertest";
describe("trading mode routes",()=>{it("requires authentication",async()=>{const r=await request(app).get("/api/trading/mode");expect(r.status).toBe(401);});it("requires authentication to switch mode",async()=>{const r=await request(app).post("/api/trading/mode").send({mode:"live"});expect(r.status).toBe(401);});});
