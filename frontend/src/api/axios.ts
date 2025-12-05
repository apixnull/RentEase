// src/api.ts
import axios from "axios";
import { useAuthStore } from "@/stores/useAuthStore";
import { toast } from "sonner";

// Environment-based backend URL configuration
const getBackendUrl = () => {
  // If VITE_BACKEND_URL is explicitly set, use it
  if (import.meta.env.VITE_BACKEND_URL) {
    return import.meta.env.VITE_BACKEND_URL;
  }
  
  // Otherwise, use environment-based defaults
  if (import.meta.env.MODE === "production") {
    // Production backend URL (Railway)
    return "https://rentease-production-1e1b.up.railway.app/api";
  }
  
  // Development backend URL
  return "http://localhost:5000/api";
};

const BACKEND_URL = getBackendUrl();

// --- Public API ---
export const publicApi = axios.create({ baseURL: BACKEND_URL });

// --- Private API ---
export const privateApi = axios.create({
  baseURL: BACKEND_URL,
  withCredentials: true,
});

// Response interceptor to handle account disabled errors globally
// This is set up after the axios instance is created to avoid circular dependencies
privateApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Check if the error is due to account being disabled
    if (
      error.response?.status === 403 &&
      error.response?.data?.code === "ACCOUNT_DISABLED"
    ) {
      // Clear user from store
      const { clearUser } = useAuthStore.getState();
      clearUser();
      
      // Show notification
      toast.error(
        error.response?.data?.message || 
        "Your account has been disabled. You have been logged out."
      );
      
      // Redirect to login page
      if (window.location.pathname !== "/auth/login") {
        window.location.href = "/auth/login";
      }
    }
    
    return Promise.reject(error);
  }
);

