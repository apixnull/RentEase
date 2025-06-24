import { GlobalLoader } from "@/components/shared/GlobalLoader";
import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

interface User {
  id: string;
  email: string;
  role: string;
  isVerified: boolean;
  isDisabled: boolean;
}

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  initialized: boolean;
  isLoggingOut: boolean;
  loginUser: (accessToken: string, user: User) => void;
  logoutUser: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ACCESS_TOKEN_KEY = "accessToken";
const USER_KEY = "user";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const isAuthenticated = !!accessToken && !!user;

  useEffect(() => {
    const storedToken = localStorage.getItem(ACCESS_TOKEN_KEY);
    const storedUser = localStorage.getItem(USER_KEY);

    if (storedToken && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setAccessToken(storedToken);
        setUser(parsedUser);
        console.log("[AuthProvider] Auth data loaded from localStorage:", { storedToken, parsedUser });
      } catch {
        localStorage.removeItem(ACCESS_TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
      }
    }

    setInitialized(true);
  }, []);

  const loginUser = (token: string, userData: User) => {
    setAccessToken(token);
    setUser(userData);
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(userData));
    setIsLoggingOut(false);
    console.log("[AuthProvider] Stored accessToken and user in localStorage:", { token, userData });
  };

  const logoutUser = () => {
    setIsLoggingOut(true);
    setAccessToken(null);
    setUser(null);
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    console.log("[AuthProvider] Logged out");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        isAuthenticated,
        initialized,
        isLoggingOut,
        loginUser,
        logoutUser,
      }}
    >
      {!initialized ? (
        <GlobalLoader isLoading size="lg" variant="blue-green" />
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
