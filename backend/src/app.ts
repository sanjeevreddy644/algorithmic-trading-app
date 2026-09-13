import express from "express";
import morgan from "morgan";
import authRoutes from "./routes/auth.routes";
import tradingRoutes from "./routes/trading.routes";
import positionRoutes from "./routes/position.routes";
import backtestRoutes from "./routes/backtest.routes";
import tradingModeRoutes from "./routes/trading-mode.routes";
import brokerRoutes from "./routes/broker.routes";
import ordersRoutes from "./routes/orders.routes";
import automationRoutes from "./routes/automation.routes";
import dailyPerformanceRoutes from "./routes/daily-performance.routes";
import {
  errorMiddleware,
  notFoundMiddleware
} from "./middleware/error.middleware";
import { env } from "./config/env";

export const app = express();

app.use((req, res, next) => {
  const origin = req.headers.origin;

  if (origin && env.corsOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Headers", "Authorization, Content-Type");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.setHeader("Vary", "Origin");
  }

  if (req.method === "OPTIONS") {
    res.sendStatus(204);
    return;
  }

  next();
});

app.use(express.json({ limit: "5mb" }));
app.use(morgan("dev"));

app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "algorithmic-trading-backend"
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/trading", tradingRoutes);
app.use("/api/positions", positionRoutes);
app.use("/api/backtests", backtestRoutes);
// Batch 6 compatibility alias: both singular and plural backtest paths are supported.
app.use("/api/backtest", backtestRoutes);
app.use("/api/trading", tradingModeRoutes);
app.use("/api/broker", brokerRoutes);
app.use("/api/orders", ordersRoutes);
app.use("/api/automation", automationRoutes);
app.use("/api/performance", dailyPerformanceRoutes);

app.use(notFoundMiddleware);
app.use(errorMiddleware);
