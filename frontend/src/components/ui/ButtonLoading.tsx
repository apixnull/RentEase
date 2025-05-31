// File: src/components/ui/ButtonLoading.tsx
import { Button } from "@/components/ui/button";
import type { ButtonProps } from "@/components/ui/button";
import { Zap } from "lucide-react";
import { motion } from "framer-motion";

interface ButtonLoadingProps extends ButtonProps {
  isLoading?: boolean;
  spinnerClassName?: string;
}

export function ButtonLoading({
  isLoading = false,
  children,
  spinnerClassName = "",
  ...props
}: ButtonLoadingProps) {
  return (
    <Button 
      disabled={isLoading}
      {...props}
      className={`relative overflow-hidden transition-all ${props.className || ''}`}
    >
      {isLoading ? (
        <div className="flex items-center justify-center w-full">
          <motion.div
            animate={{ 
              rotate: [0, 360],
              scale: [1, 1.2, 1]
            }}
            transition={{ 
              duration: 1,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className={spinnerClassName}
          >
            <Zap className="h-5 w-5 fill-current" />
          </motion.div>
        </div>
      ) : (
        children
      )}
    </Button>
  );
}