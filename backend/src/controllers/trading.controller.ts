import { Request, Response } from "express";
import { TradingService } from "../services/trading.service";
import { AppError } from "../utils/errors";

const tradingService = new TradingService();

export async function placeOrder(req: Request, res: Response) {
  if (!req.user) {
    throw new AppError(401, "Authentication required");
  }

  const result = await tradingService.placePaperOrder(req.user, req.body);
  res.status(201).json(result);
}
