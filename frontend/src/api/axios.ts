// src/api.ts
import axios, { type AxiosResponse } from "axios";
import { refreshTokenRequest } from "./authApi";
import { useAuthStore } from "@/stores/useAuthStore";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000/api";

// --- Public API ---
export const publicApi = axios.create({ baseURL: BACKEND_URL });

// --- Private API ---
export const privateApi = axios.create({
  baseURL: BACKEND_URL,
  withCredentials: true,
});

// --- Track single refresh globally ---
let refreshPromise: Promise<AxiosResponse<any>> | null = null;

// --- Response interceptor ---
privateApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;

    if (status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // Start refresh if not already in progress
      if (!refreshPromise) {
        refreshPromise = refreshTokenRequest()
          .then((res: AxiosResponse<any>) => {
            return res;
          })
          .catch((err) => {
            
            const { setUser } = useAuthStore.getState();
            setUser(null);

            // Force React Router navigation without reload
            window.history.pushState({}, "", "/auth/login");
            window.dispatchEvent(new PopStateEvent("popstate"));

            throw err; // propagate
          })
          .finally(() => {
            refreshPromise = null;
          });
      }

      try {
        await refreshPromise;
        // Retry the original request after refresh
        return privateApi(originalRequest);
      } catch {
        // Refresh failed → original request fails
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);
