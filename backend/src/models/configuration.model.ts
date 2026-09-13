import { Document, Schema, model } from "mongoose";

export interface Configuration {
  userId: Schema.Types.ObjectId;
  name: string;
  strategyName: string;
  parameters: Record<string, unknown>;
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type ConfigurationDocument = Configuration & Document;

const configurationSchema = new Schema<ConfigurationDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    name: { type: String, required: true },
    strategyName: { type: String, required: true },
    parameters: { type: Schema.Types.Mixed, default: {} },
    enabled: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export const ConfigurationModel = model<ConfigurationDocument>(
  "Configuration",
  configurationSchema
);
