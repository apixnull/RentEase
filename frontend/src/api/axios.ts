import axios from "axios";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000/api";

export const publicApi = axios.create({
  baseURL: BACKEND_URL,
});

export const privateApi = axios.create({
  baseURL: BACKEND_URL,
  withCredentials: true,
});
