import api from "./axios";

export const registerApi = (data) => api.post("/auth/register", data);
export const loginApi = (data) => api.post("/auth/login", data);
export const verify2FAApi = (data) => api.post("/auth/2fa/verify-login", data);
export const forgotPasswordApi = (data) => api.post("/auth/forgot-password", data);
export const resetPasswordApi = (token, data) => api.post(`/auth/reset-password/${token}`, data);
export const getMeApi = () => api.get("/auth/me");
