import mongoose from "mongoose";
import { env } from "../src/config/env";
import { ConfigurationModel } from "../src/models/configuration.model";
import { PositionModel } from "../src/models/position.model";
import { TradeModel } from "../src/models/trade.model";
import { UserModel } from "../src/models/user.model";
import bcrypt from "bcryptjs";

async function main() {
  await mongoose.connect(env.mongodbUri);
  const email = "seed@example.com";
  const passwordHash = await bcrypt.hash("SeedPassword123!", 10);
  const user = await UserModel.findOneAndUpdate(
    { email },
    { $setOnInsert: { email, passwordHash, displayName: "Seed Trader", accountBalance: 100000, peakEquity: 100000 }, $set: { tradingMode: "paper" } },
    { upsert: true, new: true }
  );
  if (!user) throw new Error("Unable to create seed user");
  await Promise.all([
    TradeModel.deleteMany({ userId: user._id }),
    PositionModel.deleteMany({ userId: user._id }),
    ConfigurationModel.deleteMany({ userId: user._id })
  ]);
  await TradeModel.insertMany([
    { userId: user._id, symbol: "NIFTY", side: "buy", quantity: 10, requestedPrice: 100, fillPrice: 100.05, notional: 1000.5, status: "filled", strategy: "sample", submittedAt: new Date(), filledAt: new Date() },
    { userId: user._id, symbol: "NIFTY", side: "sell", quantity: 5, requestedPrice: 102, fillPrice: 101.95, notional: 509.75, status: "filled", strategy: "sample", realizedPnl: 9.5, submittedAt: new Date(), filledAt: new Date() }
  ]);
  await PositionModel.create({ userId: user._id, symbol: "NIFTY", quantity: 5, averageEntryPrice: 100.05, markPrice: 101.5, unrealizedPnl: 7.25, realizedPnl: 9.5, openedAt: new Date() });
  await ConfigurationModel.create({ userId: user._id, name: "Default Intraday", strategyName: "regime-adaptive", parameters: { atrMin: 10, atrMax: 80, rvolMin: 1.2, rvolMax: 3, stopDistanceAtr: 1.5 }, enabled: true });
  console.log(`Seeded ${email} / SeedPassword123!`);
}

main().catch((error) => { console.error(error); process.exitCode = 1; }).finally(async () => { await mongoose.disconnect(); });
