import { Document, Schema, Types, model } from "mongoose";

export interface PaperAccount {
  userId: Types.ObjectId;
  tradingDate: string;
  initialCapital: number;
  cash: number;
  equity: number;
  realizedPnl: number;
  unrealizedPnl: number;
  peakEquity: number;
  maxDrawdownPercent: number;
  status: "open" | "closed";
  resetAt: Date;
  closedAt?: Date;
}

export type PaperAccountDocument = PaperAccount & Document;

const schema = new Schema<PaperAccountDocument>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  tradingDate: { type: String, required: true, index: true },
  initialCapital: { type: Number, required: true },
  cash: { type: Number, required: true },
  equity: { type: Number, required: true },
  realizedPnl: { type: Number, default: 0 },
  unrealizedPnl: { type: Number, default: 0 },
  peakEquity: { type: Number, required: true },
  maxDrawdownPercent: { type: Number, default: 0 },
  status: { type: String, enum: ["open", "closed"], default: "open" },
  resetAt: { type: Date, default: Date.now },
  closedAt: Date
}, { timestamps: true });

schema.index({ userId: 1, tradingDate: 1 }, { unique: true });

export const PaperAccountModel = model<PaperAccountDocument>("PaperAccount", schema);
