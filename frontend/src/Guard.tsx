// file: Guard.tsx
import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "@/stores/useAuthStore";
import type { JSX } from "react";

// ---------------------- ProtectedRoute ----------------------
interface ProtectedRouteProps {
  children: JSX.Element;
  allowedRoles?: string[];
}

export const ProtectedRoute = ({
  children,
  allowedRoles = ["ANY_ROLE"],
}: ProtectedRouteProps) => {
  const { user, loading, validated } = useAuthStore();
  const location = useLocation();

  if (loading || !validated) {
    return (
      <div className="flex items-center justify-center h-screen">
        Loading...
      </div>
    );
  }

  // ❌ Not logged in → kick to login, preserve intended path
  if (!user) {
    return <Navigate to="/auth/login" replace state={{ from: location }} />;
  }

  // If user hasn't completed onboarding, redirect to onboarding first
  if (!user.hasSeenOnboarding) {
    return <Navigate to="/auth/onboarding" replace />;
  }

  if (
    !allowedRoles.includes("ANY_ROLE") &&
    !allowedRoles.includes(user.role)
  ) {
    return <Navigate to="/unauthorized" replace />;
  }

  // ✅ Pass through
  return children;
};

// ---------------------- AuthRedirectRoute ----------------------
interface AuthRedirectRouteProps {
  children: JSX.Element;
}

export const AuthRedirectRoute = ({ children }: AuthRedirectRouteProps) => {
  const { user, loading, validated } = useAuthStore();

  if (loading || !validated) {
    return (
      <div className="flex items-center justify-center h-screen">
        Loading...
      </div>
    );
  }

  if (user) {
    if (!user.hasSeenOnboarding) {
      return <Navigate to="/auth/onboarding" replace />;
    }
    switch (user.role) {
      case "ADMIN":
        return <Navigate to="/admin" replace />;
      case "LANDLORD":
        return <Navigate to="/landlord" replace />;
      case "TENANT":
        return <Navigate to="/tenant" replace />;
      default:
        return <Navigate to="/" replace />;
    }
  }

  return children; // no user → allow access to auth pages
};

// ---------------------- OnboardingRoute ----------------------
// Only allow authenticated users who have NOT completed onboarding.
// If user completed onboarding, redirect them to their role home.
export const OnboardingRoute = ({ children }: { children: JSX.Element }) => {
  const { user, loading, validated } = useAuthStore();

  if (loading || !validated) {
    return (
      <div className="flex items-center justify-center h-screen">
        Loading...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth/login" replace />;
  }

  if (user.hasSeenOnboarding) {
    switch (user.role) {
      case "ADMIN":
        return <Navigate to="/admin" replace />;
      case "LANDLORD":
        return <Navigate to="/landlord" replace />;
      case "TENANT":
        return <Navigate to="/tenant" replace />;
      default:
        return <Navigate to="/" replace />;
    }
  }

  return children;
};
