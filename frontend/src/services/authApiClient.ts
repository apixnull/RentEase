import axios from "axios";
import { toast } from "sonner";
import { refreshAccessTokenRequest, logoutRequest } from "./api/auth.api";

const authApiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true, // send cookies automatically (refresh token cookie)
});

let isRefreshing = false;

let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (error: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  console.debug("[authApiClient] processQueue: token refreshed =", !!token);
  failedQueue.forEach(({ resolve, reject }) => {
    error ? reject(error) : resolve(token);
  });
  failedQueue = [];
};

/**
 * Force logout by calling logout API and then redirecting
 * Does NOT clear localStorage or React state here
 */
const logoutUser = async () => {
  console.warn("[authApiClient] Refresh token invalid. Triggering logout.");

  try {
    const response = await logoutRequest();
    const message = response.data?.message || "Logged out successfully";
    console.log("[logoutUser] Logout message:", message);
    toast.success(message);
  } catch (error) {
    console.error("[logoutUser] Logout failed:", error);
    toast.error("Logout failed. Please try again.");
  }

  // Redirect to login page after logout
  window.location.href = "/auth/login";
};

authApiClient.interceptors.request.use((config) => {
  console.debug(`[authApiClient] Request: ${config.method?.toUpperCase()} ${config.url}`);
  return config;
});

authApiClient.interceptors.response.use(
  (response) => {
    // Successful response, return as is
    console.debug(`[authApiClient] Response success: ${response.config.url}`);
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      console.warn("[authApiClient] 401 detected. Attempting token refresh...");

      if (isRefreshing) {
        console.debug("[authApiClient] Refresh already in progress. Queuing request.");
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => authApiClient(originalRequest));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await refreshAccessTokenRequest();

        if (data?.message) toast.success(data.message);

        processQueue(null);

        return authApiClient(originalRequest);
      } catch (err) {
        console.error("[authApiClient] Token refresh failed. Forcing logout.");

        if (axios.isAxiosError(err)) {
          const msg = err.response?.data?.message || "Refresh token failed";
          toast.error(msg);
        }

        processQueue(err);
        await logoutUser();

        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    console.error(`[authApiClient] Unhandled response error (${error.response?.status}):`, error);
    return Promise.reject(error);
  }
);

export default authApiClient;
