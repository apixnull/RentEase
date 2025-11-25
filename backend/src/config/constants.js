// file: src/config/constants.js
// --------------------------------------
// Centralized configuration for shared values
// --------------------------------------

const DEFAULT_FRONTEND_URLS = {
  production: "https://rent-ease-management.vercel.app",
  development: "http://localhost:5173",
};

export const API_PREFIX = "/api";

const createPrefix = (segment) => `${API_PREFIX}${segment}`;

export const ROUTE_PREFIXES = {
  auth: createPrefix("/auth"),
  landlord: createPrefix("/landlord"),
  tenant: createPrefix("/tenant"),
  admin: createPrefix("/admin"),
  chat: createPrefix("/chat"),
  webhook: createPrefix("/webhook"),
};

export const getFrontendUrl = () => {
  if (process.env.FRONTEND_URL) {
    return process.env.FRONTEND_URL;
  }

  const mode = process.env.NODE_ENV === "production" ? "production" : "development";
  return DEFAULT_FRONTEND_URLS[mode];
};

export const getAllowedOrigins = () => [getFrontendUrl()];


