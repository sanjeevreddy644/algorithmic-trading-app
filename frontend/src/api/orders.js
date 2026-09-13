import { api } from "./client";
export const placeOrder = (order) => api.post("/orders", order);
export const modifyOrder = (orderId, payload) => api.put(`/orders/${encodeURIComponent(orderId)}`, payload);
export const cancelOrder = (orderId, variety = "regular", symbol) => api.delete(`/orders/${encodeURIComponent(orderId)}`, { variety, symbol });
