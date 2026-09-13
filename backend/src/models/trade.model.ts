import { Document, Schema, model } from "mongoose";

export type OrderSide = "buy" | "sell";
export type OrderStatus = "submitted" | "filled" | "rejected" | "cancelled";

export interface Trade {
  userId: Schema.Types.ObjectId;
  symbol: string;
  side: OrderSide;
  quantity: number;
  requestedPrice: number;
  fillPrice?: number;
  notional?: number;
  status: OrderStatus;
  strategy?: string;
  realizedPnl?: number;
  rejectionReason?: string;
  submittedAt: Date;
  filledAt?: Date;
  automated?: boolean;
  tradingDate?: string;
  stopLossPrice?: number;
  targetPrice?: number;
  entryReason?: string;
  exitReason?: string;
}

export type TradeDocument = Trade & Document;

const tradeSchema = new Schema<TradeDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    symbol: { type: String, required: true, uppercase: true },
    side: { type: String, enum: ["buy", "sell"], required: true },
    quantity: { type: Number, required: true, min: 0 },
    requestedPrice: { type: Number, required: true, min: 0 },
    fillPrice: Number,
    notional: Number,
    status: {
      type: String,
      enum: ["submitted", "filled", "rejected", "cancelled"],
      required: true
    },
    strategy: String,
    realizedPnl: Number,
    rejectionReason: String,
    submittedAt: { type: Date, default: Date.now },
    filledAt: Date,
    automated: { type: Boolean, default: false, index: true },
    tradingDate: { type: String, index: true },
    stopLossPrice: Number,
    targetPrice: Number,
    entryReason: String,
    exitReason: String
  },
  { timestamps: true }
);

export const TradeModel = model<TradeDocument>("Trade", tradeSchema);
