import { describe, expect, it } from "vitest";
import { StrategyService } from "../../src/services/strategy.service";
const bar=(close:number, high=close+1, low=close-1, i=0)=>({timestamp:new Date(Date.UTC(2026,0,1,9,15+i*5)),open:close,high,low,close,volume:1000});
describe("StrategyService",()=>{
 it("detects a breakout above the previous 15-minute range",()=>{const s=new StrategyService();const signal=s.generateSignal("RELIANCE",[bar(100,101,99,0),bar(101,102,100,1),bar(102,103,101,2),bar(104,105,103,3)]);expect(signal.action).toBe("buy");expect(signal.stopPrice).toBeLessThan(signal.entryPrice!);expect(signal.targetPrice).toBeGreaterThan(signal.entryPrice!);});
 it("detects a bearish VWAP deviation",()=>{const s=new StrategyService();const signal=s.generateSignal("TCS",[bar(100),bar(100),bar(100),bar(99,99.2,98.8)]);expect(signal.action).toBe("sell");});
 it("returns hold with insufficient bars",()=>{expect(new StrategyService().generateSignal("NIFTY",[bar(100)]).action).toBe("hold");});
});
