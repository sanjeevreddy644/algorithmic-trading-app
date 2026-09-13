import { Request, Response } from "express";
import { BacktestService } from "../services/backtest.service";
import { AppError } from "../utils/errors";

const backtestService = new BacktestService();

export async function runBacktest(req: Request, res: Response) {
  if (!req.user) {
    throw new AppError(401, "Authentication required");
  }

  const { csv, symbol, initialCapital, slippageBps } = req.body;

  if (!csv || !symbol || !initialCapital) {
    throw new AppError(400, "csv, symbol, and initialCapital are required");
  }

  res.json(
    backtestService.run({
      csv,
      symbol,
      initialCapital,
      slippageBps
    })
  );
}
