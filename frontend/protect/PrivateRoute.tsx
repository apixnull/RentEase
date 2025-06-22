// src/components/GlobalLoader.tsx
import React from "react";

type Size = "sm" | "md" | "lg" | "xl";
type Variant = "primary" | "success" | "danger";

interface GlobalLoaderProps {
  isLoading: boolean;
  text?: string;
  size?: Size;
  variant?: Variant;
}

export const GlobalLoader = ({
  isLoading,
  text = "Processing...",
  size = "xl",
  variant = "primary"
}: GlobalLoaderProps) => {
  const sizeClasses = {
    sm: "h-8 w-8 border-2",
    md: "h-10 w-10 border-[3px]",
    lg: "h-12 w-12 border-[3px]",
    xl: "h-14 w-14 border-4",
  };

  const variantClasses = {
    primary: "border-blue-100 border-t-blue-600",
    success: "border-green-100 border-t-green-600",
    danger: "border-red-100 border-t-red-600",
  };

  if (!isLoading) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm"
      aria-live="assertive"
      aria-busy={isLoading}
    >
      <div className="flex flex-col items-center gap-4">
        <div
          className={`animate-spin rounded-full ${sizeClasses[size]} ${variantClasses[variant]}`}
          aria-hidden="true"
        />
        {text && (
          <span className="text-sm font-medium text-gray-900">
            {text}
          </span>
        )}
      </div>
    </div>
  );
};