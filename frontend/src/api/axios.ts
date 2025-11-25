// src/api.ts
import axios from "axios";

// Environment-based backend URL configuration
const getBackendUrl = () => {
  // If VITE_BACKEND_URL is explicitly set, use it
  if (import.meta.env.VITE_BACKEND_URL) {
    return import.meta.env.VITE_BACKEND_URL;
  }
  
  // Otherwise, use environment-based defaults
  if (import.meta.env.MODE === "production") {
    // Production backend URL
    return "https://rentease-vnw8.onrender.com/api";
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


