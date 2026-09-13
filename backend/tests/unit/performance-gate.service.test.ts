import { describe, expect, it, vi } from "vitest";
vi.mock("../../src/models/daily-performance.model",()=>({DailyPerformanceModel:{find:vi.fn()}}));
import { DailyPerformanceModel } from "../../src/models/daily-performance.model";
import { paperAutomationService } from "../../src/services/paper-automation.service";
describe("paper performance validation",()=>{
 it("requires 20 completed days and exact thresholds",async()=>{const rows=Array.from({length:20},(_,i)=>({tradingDate:`2026-08-${String(i+1).padStart(2,"0")}`,pnl:100}));vi.mocked(DailyPerformanceModel.find).mockReturnValue({sort:()=>({limit:()=>({lean:async()=>rows})})} as any);const result=await paperAutomationService.validation({_id:"507f1f77bcf86cd799439011"} as any);expect(result.days).toBe(20);expect(result.expectancy).toBe(100);expect(result.eligible).toBe(true);});
});
