// src/context/AuthContext.tsx
import { createContext, useState, useEffect, type ReactNode } from "react";
import authApiClient from "@/services/authApiClient";
import { logoutRequest } from "@/services/api/auth.api";

interface User {
  id: string;
  email: string;
  role: string;
  isVerified: boolean;
  isDisabled: boolean;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  login: (userData: User) => void;
  logout: () => Promise<string>;
  fetchUserInfo: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
AuthContext.displayName = "AuthContext";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const login = (userData: User) => {
    console.log("[AuthContext] login() called", userData);
    localStorage.setItem("hasLoggedIn", "true");
    setUser(userData);
    setError(null);
  };

  const logout = async (): Promise<string> => {
    console.log("[AuthContext] logout() called");
    try {
      const response = await logoutRequest();
      const message = response.data?.message || "Logged out successfully";
      console.log("[AuthContext] Server logout response:", message);
      localStorage.removeItem("hasLoggedIn");
      setUser(null);
      return message;
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error("[AuthContext] Server logout failed:", err.message);
      } else {
        console.error("[AuthContext] Server logout failed:", err);
      }
      localStorage.removeItem("hasLoggedIn");
      setUser(null);
      return "Logout failed. Please try again.";
    }
  };

  const fetchUserInfo = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { data } = await authApiClient.get("/auth/get-user-info");
      console.log("[AuthContext] API returned user:", data.user);
      setUser(data.user);
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error("[AuthContext] Failed to fetch user info:", err.message);
      } else {
        console.error("[AuthContext] Failed to fetch user info:", err);
      }
      localStorage.removeItem("hasLoggedIn");
      setUser(null);
      setError("Failed to fetch user info");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const hasLoggedIn = localStorage.getItem("hasLoggedIn");
    if (!hasLoggedIn) {
      setUser(null);
      setIsLoading(false);
    } else {
      fetchUserInfo();
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, isLoading, error, login, logout, fetchUserInfo }}
    >
      {children}
    </AuthContext.Provider>
  );
};
