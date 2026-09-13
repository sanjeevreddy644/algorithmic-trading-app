import { api } from "./client";
export const getPositions = () => api.get("/positions");
export const getTradingMode = () => api.get("/trading/mode");
export const setTradingMode = (mode, confirmation) => api.post("/trading/mode", { mode, confirmation });
export const placePaperOrder = (order) => api.post("/trading/orders", order);
export const getTrades = () => api.get("/trading/trades");
export const getMetrics = () => api.get("/trading/metrics");
export const saveStrategyConfig = (config) => api.post("/trading/config", config);
export const getStrategyConfig = () => api.get("/trading/config");
