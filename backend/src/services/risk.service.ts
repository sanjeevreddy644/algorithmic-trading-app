import { env } from "../config/env";
import { PositionModel } from "../models/position.model";
import { UserDocument } from "../models/user.model";
import { AppError } from "../utils/errors";

export interface RiskCheckInput {
  symbol: string;
  side: "buy" | "sell";
  quantity: number;
  price: number;
}

/**
 * Manual paper equity: cash plus the market value of manually traded positions.
 * Automated positions are funded by the daily PaperAccount, not accountBalance.
 */
export async function calculatePaperEquity(user: UserDocument): Promise<number> {
  const positions = await PositionModel.find({
    userId: user._id,
    automated: { $ne: true }
  });

  return user.accountBalance + positions.reduce(
    (total, position) =>
      total + Number(position.quantity || 0) * Number(position.markPrice || 0),
    0
  );
}

export class RiskService {
  async validateOrder(
    user: UserDocument,
    input: RiskCheckInput
  ): Promise<void> {
    if (user.killSwitchEnabled) {
      throw new AppError(403, "Trading is disabled by the account kill switch");
    }

    if (!env.paperTradingEnabled) {
      throw new AppError(503, "Paper trading is disabled");
    }

    if (
      !Number.isFinite(input.quantity) ||
      !Number.isFinite(input.price) ||
      input.quantity <= 0 ||
      input.price <= 0
    ) {
      throw new AppError(400, "Quantity and price must be positive");
    }

    const notional = input.quantity * input.price;

    if (notional > env.maxPositionNotional) {
      throw new AppError(400, "Order exceeds maximum position notional");
    }

    const equity = await calculatePaperEquity(user);

    const drawdownPercent =
      user.peakEquity > 0
        ? ((user.peakEquity - equity) / user.peakEquity) * 100
        : 0;

    if (drawdownPercent >= env.maxDrawdownPercent) {
      throw new AppError(403, "Maximum drawdown limit reached");
    }
  }
}
