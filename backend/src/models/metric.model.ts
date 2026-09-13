import { Document, Schema, model } from "mongoose";

export interface Metric {
  userId: Schema.Types.ObjectId;
  equity: number;
  cash: number;
  drawdownPercent: number;
  dailyPnl: number;
  recordedAt: Date;
}

export type MetricDocument = Metric & Document;

const metricSchema = new Schema<MetricDocument>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true
  },
  equity: { type: Number, required: true },
  cash: { type: Number, required: true },
  drawdownPercent: { type: Number, required: true },
  dailyPnl: { type: Number, required: true },
  recordedAt: { type: Date, default: Date.now }
});

export const MetricModel = model<MetricDocument>("Metric", metricSchema);
