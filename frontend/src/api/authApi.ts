import { publicApi, privateApi } from "./axios";

// ---- Public Endpoints ----
export const register = (data: any) =>
  publicApi.post("/auth/register", data);

export const login = (data: any) =>
  publicApi.post("/auth/login", data);

export const forgotPassword = (data: any) =>
  publicApi.post("/auth/forgot-password", data);

export const resetPassword = (data: any) =>
  publicApi.post("/auth/reset-password", data);

export const verifyEmail = (data: any) =>
  publicApi.post("/auth/verify-email", data);

export const resendVerification = (data: any) =>
  publicApi.post("/auth/resend-verification", data);

// ---- Private Endpoints ----
export const getUserInfo = () =>
  privateApi.get("/auth/me");

export const onboarding = (data: any) =>
  privateApi.put("/auth/onboarding", data);

export const logout = () => privateApi.post("/auth/logout");
