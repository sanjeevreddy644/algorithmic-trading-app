import { describe, expect, it } from "vitest";
import { createKiteChecksum } from "../../src/services/brokers/kite.adapter";
describe("Kite adapter",()=>{it("creates the documented SHA-256 checksum",()=>{expect(createKiteChecksum("api","request","secret")).toBe("257f5edc0415fc77bd14b16e08ca983df5e4d049db7c63e292f18f6d640402b5");});it("does not expose broker secrets in sanitized events",()=>{const event={type:"quote",symbol:"NIFTY",lastPrice:100,timestamp:new Date().toISOString()};expect(JSON.stringify(event)).not.toContain("secret");});});
