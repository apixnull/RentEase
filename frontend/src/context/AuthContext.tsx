// src/context/AuthContext.tsx
import axios from "axios";
import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { GlobalLoader } from "@/components/shared/GlobalLoader";

interface User {
  id: string;
  email: string;
  role: string;
  isVerified: boolean;
  isDisabled: boolean;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  initialized: boolean;
  isLoggingOut: boolean;
  loginUser: (user: User) => void;
  logoutUser: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const api = axios.create({
  baseURL: "http://localhost:4000/api",
  withCredentials: true,
});

let isRefreshing = false;
let failedQueue: {
  resolve: (value?: unknown) => void;
  reject: (reason?: any) => void;
}[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => api(originalRequest));
      }
      originalRequest._retry = true;
      isRefreshing = true;

      return new Promise(async (resolve, reject) => {
        try {
          await api.post("/auth/refresh-token");
          processQueue(null);
          resolve(api(originalRequest));
        } catch (err) {
          processQueue(err, null);
          reject(err);
        } finally {
          isRefreshing = false;
        }
      });
    }
    return Promise.reject(error);
  }
);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [initialized, setInitialized] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // isAuthenticated derived from user existence
  const isAuthenticated = !!user;

  const fetchUserInfo = async () => {
    if (!localStorage.getItem("hasRefreshToken") || isLoggingOut) {
      setUser(null);
      setInitialized(true);
      return;
    }

    try {
      // Try to fetch user info directly first
      const res = await api.get("/auth/user-info");
      setUser(res.data.user);
      console.log("[AuthProvider] User data loaded", res.data.user);
    } catch (error: any) {
      if (error.response?.status === 401) {
        // If 401, try refresh token then fetch user info again
        try {
          await api.post("/auth/refresh-token");
          const res = await api.get("/auth/user-info");
          setUser(res.data.user);
          console.log("[AuthProvider] User data loaded after refresh", res.data.user);
        } catch {
          localStorage.removeItem("hasRefreshToken");
          setUser(null);
          console.log("[AuthProvider] Refresh token expired or invalid, user logged out");
        }
      } else {
        setUser(null);
      }
    } finally {
      setInitialized(true);
    }
  };

  const loginUser = (userData: User) => {
    setUser(userData);
    setIsLoggingOut(false);
    localStorage.setItem("hasRefreshToken", "true"); // flag login state
    console.log("[AuthProvider] User logged in", userData);
  };

  const logoutUser = async () => {
    setIsLoggingOut(true);
    setUser(null);
    localStorage.removeItem("hasRefreshToken"); // clear flag on logout
    try {
      await api.post("/auth/logout");
      console.log("[AuthProvider] User logged out");
    } catch (error) {
      console.error("Logout error:", error);
    }
    setIsLoggingOut(false);
  };

  useEffect(() => {
    fetchUserInfo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        initialized,
        isLoggingOut,
        loginUser,
        logoutUser,
      }}
    >
      {!initialized ? <GlobalLoader isLoading size="lg" variant="blue-green" /> : children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};

export { api };
