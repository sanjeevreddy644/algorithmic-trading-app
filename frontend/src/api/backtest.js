import { api } from "./client";
export const runBacktest = (payload) => api.post("/backtest", payload);
