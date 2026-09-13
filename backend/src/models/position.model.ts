import { Document, Schema, model } from "mongoose";

export interface Position {
  userId: Schema.Types.ObjectId;
  symbol: string;
  quantity: number;
  averageEntryPrice: number;
  markPrice: number;
  unrealizedPnl: number;
  realizedPnl: number;
  openedAt?: Date;
  updatedAt: Date;
  stopLossPrice?: number;
  targetPrice?: number;
  automated?: boolean;
  tradingDate?: string;
  entryTradeId?: Schema.Types.ObjectId;
}

export type PositionDocument = Position & Document;

const positionSchema = new Schema<PositionDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    symbol: { type: String, required: true, uppercase: true },
    quantity: { type: Number, default: 0 },
    averageEntryPrice: { type: Number, default: 0 },
    markPrice: { type: Number, default: 0 },
    unrealizedPnl: { type: Number, default: 0 },
    realizedPnl: { type: Number, default: 0 },
    openedAt: Date,
    stopLossPrice: Number,
    targetPrice: Number,
    automated: { type: Boolean, default: false, index: true },
    tradingDate: { type: String, index: true },
    entryTradeId: { type: Schema.Types.ObjectId, ref: "Trade" }
  },
  { timestamps: true }
);

positionSchema.index({ userId: 1, symbol: 1 }, { unique: true });

export const PositionModel = model<PositionDocument>(
  "Position",
  positionSchema
);
