import { parse } from "csv-parse/sync";
import { env } from "../config/env";
import { StrategyService } from "./strategy.service";

export interface BacktestInput {
  csv: string;
  symbol: string;
  initialCapital: number;
  slippageBps?: number;
}

export class BacktestService {
  constructor(private readonly strategyService = new StrategyService()) {}

  run(input: BacktestInput) {
    const rows = parse(input.csv, {
      columns: true,
      skip_empty_lines: true,
      cast: true
    }) as Array<Record<string, unknown>>;

    const bars = rows.map((row) => ({
      timestamp: new Date(String(row.timestamp)),
      open: Number(row.open),
      high: Number(row.high),
      low: Number(row.low),
      close: Number(row.close),
      volume: row.volume ? Number(row.volume) : undefined
    }));

    const signal = this.strategyService.generateSignal(input.symbol, bars);
    const slippageBps = input.slippageBps ?? env.defaultSlippageBps;

    return {
      symbol: input.symbol.toUpperCase(),
      barsProcessed: bars.length,
      initialCapital: input.initialCapital,
      finalCapital: input.initialCapital,
      totalPnl: 0,
      returnPercent: 0,
      slippageBps,
      signal,
      status: "stub",
      message: "Backtesting execution is reserved for Batch 3"
    };
  }
}
