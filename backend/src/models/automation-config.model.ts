import { Document, Schema, Types, model } from "mongoose";

export interface AutomationConfig {
  userId: Types.ObjectId;
  enabled: boolean;
  universe: string;
  initialCapital: number;
  riskPerTradePercent: number;
  rewardRiskRatio: number;
  maxPositions: number;
  stopDistancePercent: number;
  vwapDeviationPercent: number;
  scanIntervalMinutes: number;
  entryStartTime: string;
  lastResetDate?: string;
  lastScanAt?: Date;
  updatedAt: Date;
  createdAt: Date;
}
export type AutomationConfigDocument = AutomationConfig & Document;
const schema = new Schema<AutomationConfigDocument>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
  enabled: { type: Boolean, default: false },
  universe: { type: String, default: "NIFTY50" },
  initialCapital: { type: Number, default: 100000 },
  riskPerTradePercent: { type: Number, default: 1 },
  rewardRiskRatio: { type: Number, default: 2 },
  maxPositions: { type: Number, default: 5 },
  stopDistancePercent: { type: Number, default: 0.5 },
  vwapDeviationPercent: { type: Number, default: 0.5 },
  scanIntervalMinutes: { type: Number, default: 5 },
  entryStartTime: { type: String, default: "09:30" },
  lastResetDate: String,
  lastScanAt: Date
}, { timestamps: true });
export const AutomationConfigModel = model<AutomationConfigDocument>("AutomationConfig", schema);
