import React from "react";
import { Navigate } from "react-router-dom";
import { GlobalLoader } from "@/components/shared/GlobalLoader";
import useAuth  from "@/hooks/useAuth";

interface ProtectedRouteProps {
  allowedRoles: string[];
  children: React.ReactNode;
}

const ProtectedRoute = ({ allowedRoles, children }: ProtectedRouteProps) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <GlobalLoader isLoading={true} text="Loading user data..." />;
  }

  if (!user) {
    // Not authenticated
    return <Navigate to="/auth/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    // Authenticated but role not allowed
    return <Navigate to="/unauthorized" replace />;
  }

  // Authenticated and role allowed
  return <>{children}</>;
};

export default ProtectedRoute;
