import { Document, Model, Schema, model } from "mongoose";
import bcrypt from "bcryptjs";

export interface User {
  email: string;
  passwordHash: string;
  displayName?: string;
  accountBalance: number;
  peakEquity: number;
  killSwitchEnabled: boolean;
  tradingMode: "paper" | "live";
  liveTradingUnlockedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserDocument extends User, Document {
  comparePassword(password: string): Promise<boolean>;
}

interface UserModel extends Model<UserDocument> {
  hashPassword(password: string): Promise<string>;
}

const userSchema = new Schema<UserDocument>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    passwordHash: {
      type: String,
      required: true
    },
    displayName: String,
    accountBalance: {
      type: Number,
      default: 100000
    },
    peakEquity: {
      type: Number,
      default: 100000
    },
    killSwitchEnabled: {
      type: Boolean,
      default: false
    },
    tradingMode: { type: String, enum: ["paper", "live"], default: "paper" },
    liveTradingUnlockedAt: Date
  },
  {
    timestamps: true
  }
);

userSchema.methods.comparePassword = function (
  password: string
): Promise<boolean> {
  return bcrypt.compare(password, this.passwordHash);
};

userSchema.statics.hashPassword = function (password: string): Promise<string> {
  return bcrypt.hash(password, 12);
};

export const UserModel = model<UserDocument, UserModel>("User", userSchema);
