import { api } from "./client";
export const getAutomation = () => api.get("/automation");
export const setAutomation = (enabled) => api.post("/automation/toggle", { enabled });
export const resetAutomation = () => api.post("/automation/reset", {});
export const scanAutomation = () => api.post("/automation/scan", {});
export const getDailyPerformance = (limit=30) => api.get(`/performance?limit=${limit}`);
