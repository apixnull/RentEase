// src/components/GlobalLoader.tsx

type Size = "sm" | "md" | "lg" | "xl";
type Variant = "blue-green" | "green-blue" | "custom";

interface GlobalLoaderProps {
  isLoading: boolean;
  text?: string;
  size?: Size;
  variant?: Variant;
  customColors?: [string, string];
  spinSpeed?: "slow" | "normal" | "fast";
}

export const GlobalLoader = ({
  isLoading,
  text = "Processing...",
  size = "md",
  variant = "blue-green",
  customColors = ["#3b82f6", "#10b981"],
  spinSpeed = "normal",
}: GlobalLoaderProps) => {
  // Size configuration
  const sizeConfig = {
    sm: { icon: "h-5 w-5", text: "text-xs" },
    md: { icon: "h-7 w-7", text: "text-sm" },
    lg: { icon: "h-9 w-9", text: "text-base" },
    xl: { icon: "h-12 w-12", text: "text-lg" },
  };

  // Animation speeds
  const animationSpeeds = {
    slow: "animate-[spin_1.8s_ease-in-out_infinite]",
    normal: "animate-[spin_1.2s_linear_infinite]",
    fast: "animate-[spin_0.7s_linear_infinite]",
  };

  // Get gradient colors
  const getGradient = () => {
    switch (variant) {
      case "blue-green": return { from: "#3b82f6", to: "#10b981" };
      case "green-blue": return { from: "#10b981", to: "#3b82f6" };
      case "custom": return { from: customColors[0], to: customColors[1] };
      default: return { from: "#3b82f6", to: "#10b981" };
    }
  };

  const { from, to } = getGradient();

  if (!isLoading) return null;

  return (
    <div 
      className="fixed inset-0 z-[999] flex items-center justify-center pointer-events-none"
      aria-live="assertive"
      aria-busy={isLoading}
    >
      <div className="flex flex-col items-center gap-3">
        {/* Smooth spinning zap icon */}
        <svg
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={`${sizeConfig[size].icon} ${animationSpeeds[spinSpeed]}`}
        >
          <defs>
            <linearGradient id="zapGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={from} />
              <stop offset="100%" stopColor={to} />
            </linearGradient>
          </defs>
          <path
            d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"
            fill="url(#zapGradient)"
          />
        </svg>
        
        {/* Clean text display */}
        {text && (
          <span className={`${sizeConfig[size].text} font-medium text-gray-600`}>
            {text}
          </span>
        )}
      </div>
    </div>
  );
};

{/*
  
  // Basic usage
<GlobalLoader isLoading={true} />

// Fast spinning with custom text
<GlobalLoader
  isLoading={true}
  spinSpeed="fast"
  text="Almost done..."
/>

// Large with custom colors
<GlobalLoader
  isLoading={true}
  size="lg"
  variant="custom"
  customColors={["#ec4899", "#8b5cf6"]} // Pink to purple
/>*/}