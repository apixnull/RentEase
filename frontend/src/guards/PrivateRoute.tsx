import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import type { ReactNode } from "react";

interface ProtectedRouteProps {
  allowedRoles?: string[];
  children: ReactNode;
}

export const ProtectedRoute = ({
  allowedRoles,
  children,
}: ProtectedRouteProps) => {
  const { user, isAuthenticated, initialized, isLoggingOut } = useAuth();

  // Wait for initialization to complete
  if (!initialized) {
    return null; // or a loader if you want
  }

  // If currently logging out, redirect immediately to login page
  if (isLoggingOut) {
    return <Navigate to="/auth/login" replace />;
  }
  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/unauthorized" replace />;
  }

  // If role restrictions apply and user role not allowed, redirect unauthorized
  if (allowedRoles && !allowedRoles.includes(user!.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Authorized — render children
  return <>{children}</>;
};
