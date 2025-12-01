import { publicApi, privateApi } from "./axios";
import { apiRoutes } from "./routes";

// ---- Public Endpoints ----
export const registerRequest = (data: any) =>
  publicApi.post(apiRoutes.auth("/register"), data);

export const loginRequest = (data: any) =>
  publicApi.post(apiRoutes.auth("/login"), data, { withCredentials: true });

export const forgotPasswordRequest = (data: any) =>
  publicApi.post(apiRoutes.auth("/forgot-password"), data);

export const resetPasswordRequest = (data: any) =>
  publicApi.post(apiRoutes.auth("/reset-password"), data);

export const verifyEmailRequest = (data: any) =>
  publicApi.post(apiRoutes.auth("/verify-email"), data);

export const resendVerificationRequest = (data: any) =>
  publicApi.post(apiRoutes.auth("/resend-verification"), data);

// ---- Private Endpoints ----
export const getUserInfoRequest = (options?: { signal?: AbortSignal }) =>
  privateApi.get(apiRoutes.auth("/me"), { signal: options?.signal });

export const onboardingRequest = (data: any, options?: { signal?: AbortSignal }) =>
  privateApi.put(apiRoutes.auth("/onboarding"), data, { signal: options?.signal });

// 🔹 Update profile (protected)
export const updateProfileRequest = (data: any, options?: { signal?: AbortSignal }) =>
  privateApi.put(apiRoutes.auth("/update-profile"), data, { signal: options?.signal });

export const logoutRequest = () =>
  privateApi.post(apiRoutes.auth("/logout"), {}, { withCredentials: true });

// Delete account (protected)
export const deleteAccountRequest = (options?: { signal?: AbortSignal }) =>
  privateApi.delete(apiRoutes.auth("/delete-account"), { signal: options?.signal });