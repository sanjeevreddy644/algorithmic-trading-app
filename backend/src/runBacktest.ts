import { readFile } from "node:fs/promises";
import path from "node:path";
import { BacktestService } from "./services/backtest.service";

async function main() {
  const file = path.resolve(
    process.cwd(),
    process.argv[2] ?? "data/nifty_midcap100_5m_sample.csv",
  );

  const csv = await readFile(file, "utf8");

  const report = new BacktestService().run({
    csv,
    symbol: "NIFTY MIDCAP 100",
    initialCapital: 1_000_000,
    slippageBps: 5,
  });

  console.table({
    symbol: report.symbol,
    barsProcessed: report.barsProcessed,
    initialCapital: report.initialCapital,
    finalCapital: report.finalCapital,
    totalPnl: report.totalPnl,
    returnPercent: report.returnPercent,
    signal: report.signal.action,
    status: report.status,
  });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
