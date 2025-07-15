// services/auth.api.ts

import axios from "axios";
import authApiClient from "../authApiClient";


const API_URL = import.meta.env.VITE_API_URL;

/**
 * ============================================================
 * 📦 Public Auth APIs — No access token required
 * ============================================================
 */

/**
 * Login user and receive HTTP-only tokens via Set-Cookie.
 */
export const loginRequest = (email: string, password: string) => {
  return axios.post(
    `${API_URL}/auth/login`,
    { email, password },
    { withCredentials: true } // send/receive cookies
  );
};

/**
 * Register a new user.
 */
export const registerRequest = (data: {
  email: string;
  password: string;
  confirmPassword: string;
  role: string;
}) => {
  return axios.post(`${API_URL}/auth/register`, data);
};

/**
 * Submit OTP to verify email address.
 */
export const verifyEmailRequest = (email: string, otpCode: string) => {
  return axios.post(`${API_URL}/auth/verify-email`, {
    email,
    otpCode,
  });
};

/**
 * Request a new OTP to be sent to user's email.
 */
export const resendOtpRequest = (email: string) => {
  return axios.post(`${API_URL}/auth/resend-otp`, { email });
};

/**
 * Send password reset email to user.
 */
export const forgotPasswordRequest = (email: string) => {
  return axios.post(`${API_URL}/auth/forget-password`, { email });
};

/**
 * Submit a new password with reset token to update the user's password.
 */
export const resetPasswordRequest = (data: {
  token: string;
  password: string;
  confirmPassword: string;
}) => {
  return axios.post(`${API_URL}/auth/reset-password`, data);
};

/**
 * Refresh access token using stored refresh token cookie.
 * ⚠️ This must NOT use authApiClient (which may trigger 401 again).
 */
export const refreshAccessTokenRequest = () => {
  return axios.post(`${API_URL}/auth/refresh-token`, {}, { withCredentials: true });
};

/**
 * Logout user — clears cookies and revokes refresh tokens.
 * ⚠️ This must NOT use authApiClient since access token may already be expired.
 */
export const logoutRequest = () => {
  return axios.post(`${API_URL}/auth/logout`, {}, { withCredentials: true });
};

/**
 * ============================================================
 * 🔐 Protected APIs — Access token required
 * ============================================================
 */

/**
 * Get current authenticated user info (only if accessToken is valid).
 */
export const getUserInfo = () => {
  return authApiClient.get("/auth/get-user-info");
};
