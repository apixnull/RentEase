// file: src/config/constants.js
// --------------------------------------
// Centralized configuration for shared values
// --------------------------------------

const DEFAULT_FRONTEND_URLS = {
  production: "https://rent-ease-management.vercel.app",
  development: "http://localhost:5173",
};

const DEFAULT_API_PREFIX = "/api";
export const API_PREFIX = process.env.API_PREFIX ?? DEFAULT_API_PREFIX;
export const ENABLE_LEGACY_ROUTES =
  process.env.ENABLE_LEGACY_ROUTES !== "false";

const createPrefix = (segment) => `${API_PREFIX}${segment}`;

const ROUTE_SEGMENTS = {
  auth: "/auth",
  landlord: "/landlord",
  tenant: "/tenant",
  admin: "/admin",
  chat: "/chat",
  webhook: "/webhook",
  notification: "/notification",
};

export const ROUTE_PREFIXES = Object.entries(ROUTE_SEGMENTS).reduce(
  (acc, [key, segment]) => {
    acc[key] = createPrefix(segment);
    return acc;
  },
  {}
);

export const LEGACY_ROUTE_PREFIXES =
  ENABLE_LEGACY_ROUTES && API_PREFIX !== ""
    ? ROUTE_SEGMENTS
    : Object.fromEntries(Object.keys(ROUTE_SEGMENTS).map((key) => [key, null]));

export const getFrontendUrl = () => {
  if (process.env.FRONTEND_URL) {
    return process.env.FRONTEND_URL;
  }

  const mode = process.env.NODE_ENV === "production" ? "production" : "development";
  return DEFAULT_FRONTEND_URLS[mode];
};

export const getAllowedOrigins = () => {
  const frontendUrl = getFrontendUrl();
  // Normalize URL (remove trailing slash) and include both versions
  const normalizedUrl = frontendUrl.replace(/\/$/, "");
  return [
    normalizedUrl,
    `${normalizedUrl}/`, // Include with trailing slash
    frontendUrl, // Original
  ];
};

