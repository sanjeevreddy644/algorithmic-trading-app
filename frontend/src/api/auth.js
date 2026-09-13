import { api } from "./client";
export const login = (email, password) => api.post("/auth/login", { email, password });
export const register = (email, password, displayName) => api.post("/auth/register", { email, password, displayName });
export const refresh = (refreshToken) => api.post("/auth/refresh", { refreshToken });
export const me = () => api.get("/auth/me");
