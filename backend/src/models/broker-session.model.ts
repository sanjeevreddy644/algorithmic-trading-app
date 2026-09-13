import { Document, Schema, model } from "mongoose";

export interface BrokerSession {
  userId: Schema.Types.ObjectId;
  broker: string;
  accountId?: string;
  accountEmail?: string;
  encryptedAccessToken?: string;
  status: "connected" | "disconnected" | "error";
  lastConnectedAt?: Date;
  expiresAt?: Date;
  websocketConnected: boolean;
  createdAt: Date;
  updatedAt: Date;
}
export type BrokerSessionDocument = BrokerSession & Document;
const schema = new Schema<BrokerSessionDocument>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  broker: { type: String, required: true }, accountId: String, accountEmail: String,
  encryptedAccessToken: { type: String, select: false },
  status: { type: String, enum: ["connected","disconnected","error"], default: "disconnected" },
  lastConnectedAt: Date, expiresAt: Date, websocketConnected: { type: Boolean, default: false }
}, { timestamps: true });
schema.index({ userId: 1, broker: 1 }, { unique: true });
export const BrokerSessionModel = model<BrokerSessionDocument>("BrokerSession", schema);
