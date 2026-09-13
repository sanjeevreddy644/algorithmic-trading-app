import { Types } from "mongoose";
import { env } from "../config/env";
import { MetricModel } from "../models/metric.model";
import { PositionModel } from "../models/position.model";
import { TradeModel } from "../models/trade.model";
import { UserDocument } from "../models/user.model";
import { AppError } from "../utils/errors";
import { RiskService, calculatePaperEquity } from "./risk.service";
import { paperAutomationService } from "./paper-automation.service";

export interface PlaceOrderInput {
  symbol: string;
  side: "buy" | "sell";
  quantity: number;
  price: number;
  strategy?: string;
}

// Request bodies are untyped JSON: coerce and validate before any arithmetic,
// otherwise a string quantity like "10" is concatenated instead of added.
function normalizeOrderInput(input: PlaceOrderInput): PlaceOrderInput {
  const symbol =
    typeof input?.symbol === "string" ? input.symbol.trim().toUpperCase() : "";
  const side = String(input?.side ?? "").toLowerCase();
  const quantity = Number(input?.quantity);
  const price = Number(input?.price);

  if (!symbol) {
    throw new AppError(400, "symbol is required");
  }

  if (side !== "buy" && side !== "sell") {
    throw new AppError(400, "side must be buy or sell");
  }

  if (!Number.isInteger(quantity) || quantity <= 0) {
    throw new AppError(400, "quantity must be a positive whole number");
  }

  if (!Number.isFinite(price) || price <= 0) {
    throw new AppError(400, "price must be a positive number");
  }

  return {
    symbol,
    side,
    quantity,
    price,
    strategy: typeof input.strategy === "string" ? input.strategy : undefined
  };
}

export class TradingService {
  constructor(private readonly riskService = new RiskService()) {}

  async runAutomatedNifty50Scan(user: UserDocument) { return paperAutomationService.scanUser(user); }

  async resetAutomatedPaperAccount(user: UserDocument, force = false) { return paperAutomationService.resetDay(user, force); }

  async closeAutomatedPositions(user: UserDocument, reason = "market_close") { return paperAutomationService.closeAll(user, reason, true); }

  async placePaperOrder(user: UserDocument, rawInput: PlaceOrderInput) {
    const input = normalizeOrderInput(rawInput);

    await this.riskService.validateOrder(user, input);

    const fillPrice =
      input.side === "buy"
        ? input.price * (1 + env.defaultSlippageBps / 10000)
        : input.price * (1 - env.defaultSlippageBps / 10000);

    const notional = fillPrice * input.quantity;

    if (input.side === "buy" && user.accountBalance < notional) {
      throw new AppError(400, "Insufficient paper trading cash");
    }

    // Validate against the current position before anything is written, so a
    // rejected order never leaves a filled trade or an empty position behind.
    const existing = await PositionModel.findOne({
      userId: user._id,
      symbol: input.symbol
    });

    if (existing?.automated && existing.quantity !== 0) {
      throw new AppError(409, "Symbol has an open automated paper position");
    }

    if (
      input.side === "sell" &&
      (!existing || existing.quantity < input.quantity)
    ) {
      throw new AppError(400, "Cannot sell more than the current position");
    }

    const trade = await TradeModel.create({
      userId: user._id,
      symbol: input.symbol,
      side: input.side,
      quantity: input.quantity,
      requestedPrice: input.price,
      fillPrice,
      notional,
      status: "filled",
      strategy: input.strategy,
      submittedAt: new Date(),
      filledAt: new Date()
    });

    const position =
      existing ??
      (await PositionModel.findOneAndUpdate(
        {
          userId: user._id,
          symbol: input.symbol
        },
        { $setOnInsert: { userId: user._id, symbol: input.symbol } },
        { upsert: true, new: true }
      ));

    if (!position) {
      throw new AppError(500, "Unable to create position");
    }

    let realizedPnl = 0;
    position.automated = false;

    if (input.side === "buy") {
      const oldQuantity = position.quantity;
      const newQuantity = oldQuantity + input.quantity;

      position.averageEntryPrice =
        newQuantity === 0
          ? 0
          : (oldQuantity * position.averageEntryPrice + notional) /
            newQuantity;
      position.quantity = newQuantity;
      user.accountBalance -= notional;
      position.openedAt ??= new Date();
    } else {
      realizedPnl =
        (fillPrice - position.averageEntryPrice) * input.quantity;

      position.quantity -= input.quantity;
      position.realizedPnl += realizedPnl;
      user.accountBalance += notional;

      if (position.quantity === 0) {
        position.averageEntryPrice = 0;
        position.openedAt = undefined;
      }
    }

    position.markPrice = fillPrice;
    position.unrealizedPnl =
      (position.markPrice - position.averageEntryPrice) * position.quantity;

    trade.realizedPnl = realizedPnl;
    await trade.save();
    await position.save();
    await user.save();

    const equity = await calculatePaperEquity(user);

    if (equity > user.peakEquity) {
      user.peakEquity = equity;
      await user.save();
    }

    await MetricModel.create({
      userId: new Types.ObjectId(user.id),
      equity,
      cash: user.accountBalance,
      drawdownPercent:
        user.peakEquity > 0
          ? ((user.peakEquity - equity) / user.peakEquity) * 100
          : 0,
      dailyPnl: realizedPnl + position.unrealizedPnl
    });

    return {
      trade,
      position,
      accountBalance: user.accountBalance
    };
  }
}
