// src/components/GlobalLoader.tsx
import React from 'react';

// Simple Zustand-like state management emulation
const createLoaderStore = () => {
  let state = { isLoading: false };
  const subscribers = new Set<() => void>();
  
  return {
    getState: () => state,
    setState: (newState: Partial<typeof state>) => {
      state = { ...state, ...newState };
      subscribers.forEach(cb => cb());
    },
    subscribe: (callback: () => void) => {
      subscribers.add(callback);
      return () => subscribers.delete(callback);
    }
  };
};

export const loaderStore = createLoaderStore();

// Hook to use the loader store
export const useLoader = () => {
  const [state, setState] = React.useState(loaderStore.getState());
  
  React.useEffect(() => {
    return loaderStore.subscribe(() => setState(loaderStore.getState()));
  }, []);
  // error here
  {/* Argument of type '() => () => boolean' is not assignable to parameter of type 'EffectCallback'.
  Type '() => boolean' is not assignable to type 'void | Destructor'.
    Type '() => boolean' is not assignable to type 'Destructor'.
      Type 'boolean' is not assignable to type 'void | { [UNDEFINED_VOID_ONLY]: never; }'.ts(2345) */}
  return state;
};

type Size = "sm" | "md" | "lg" | "xl";

interface GlobalLoaderProps {
  size?: Size;
  text?: string;
}

export const GlobalLoader = ({
  size = "md",
  text = "Processing..."
}: GlobalLoaderProps) => {
  const { isLoading } = useLoader();
  
  const sizeClasses = {
    sm: "h-6 w-6",
    md: "h-8 w-8",
    lg: "h-10 w-10",
    xl: "h-12 w-12",
  };
  
  const textClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
    xl: "text-lg",
  };

  if (!isLoading) return null;

  return (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center pointer-events-none"
      aria-live="assertive"
      aria-busy={isLoading}
    >
      <div className="flex flex-col items-center gap-3">
        <div className="relative">
          {/* Blurred background */}
          <div className="absolute inset-0 bg-gradient-to-r from-teal-500/20 to-blue-500/20 rounded-full blur-sm" />
          
          {/* Spinning zap icon with gradient */}
          <div className={`${sizeClasses[size]} animate-spin`}>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-full h-full"
            >
              <defs>
                <linearGradient id="zap-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#0d9488" /> {/* teal-600 */}
                  <stop offset="50%" stopColor="#2563eb" /> {/* blue-600 */}
                  <stop offset="100%" stopColor="#0d9488" /> {/* teal-600 */}
                </linearGradient>
              </defs>
              <path
                d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"
                fill="url(#zap-gradient)"
              />
            </svg>
          </div>
        </div>
        
        {text && (
          <span className={`font-medium text-gray-600 ${textClasses[size]} bg-white/80 px-2 py-1 rounded-md backdrop-blur-sm`}>
            {text}
          </span>
        )}
      </div>
    </div>
  );
};

// Utility functions to control the loader globally
export const showGlobalLoader = () => {
  loaderStore.setState({ isLoading: true });
};

export const hideGlobalLoader = () => {
  loaderStore.setState({ isLoading: false });
};