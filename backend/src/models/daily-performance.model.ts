import { Document, Schema, Types, model } from "mongoose";

export interface DailyPerformance {
  userId: Types.ObjectId;
  tradingDate: string;
  initialCapital: number;
  finalEquity: number;
  pnl: number;
  returnPercent: number;
  tradeCount: number;
  winningTrades: number;
  losingTrades: number;
  winRate: number;
  grossProfit: number;
  grossLoss: number;
  profitFactor: number;
  maxDrawdownPercent: number;
  expectancy: number;
  positiveExpectancy20d: boolean;
  automationStatus: "running" | "closed" | "no_data";
  updatedAt: Date;
  createdAt: Date;
}

export type DailyPerformanceDocument = DailyPerformance & Document;
const schema = new Schema<DailyPerformanceDocument>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  tradingDate: { type: String, required: true, index: true },
  initialCapital: { type: Number, required: true },
  finalEquity: { type: Number, required: true },
  pnl: { type: Number, required: true },
  returnPercent: { type: Number, required: true },
  tradeCount: { type: Number, default: 0 },
  winningTrades: { type: Number, default: 0 },
  losingTrades: { type: Number, default: 0 },
  winRate: { type: Number, default: 0 },
  grossProfit: { type: Number, default: 0 },
  grossLoss: { type: Number, default: 0 },
  profitFactor: { type: Number, default: 0 },
  maxDrawdownPercent: { type: Number, default: 0 },
  expectancy: { type: Number, default: 0 },
  positiveExpectancy20d: { type: Boolean, default: false },
  automationStatus: { type: String, enum: ["running", "closed", "no_data"], default: "running" }
}, { timestamps: true });
schema.index({ userId: 1, tradingDate: 1 }, { unique: true });
export const DailyPerformanceModel = model<DailyPerformanceDocument>("DailyPerformance", schema);
