// src/components/ui/GenericButton.tsx
import React from 'react';
import { Zap } from 'lucide-react';

type ButtonVariant = 'solid' | 'outline' | 'ghost';
type ButtonColor = 'primary' | 'success' | 'warning' | 'danger' | 'custom';
type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface GenericButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  color?: ButtonColor;
  size?: ButtonSize;
  isLoading?: boolean;
  loadingText?: string;
  gradientFrom?: string;
  gradientTo?: string;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  spinnerColor?: string;
  disabled?: boolean; // New disabled prop
}

export const GenericButton = React.forwardRef<HTMLButtonElement, GenericButtonProps>(
  (
    {
      children,
      variant = 'solid',
      color = 'primary',
      size = 'md',
      isLoading = false,
      loadingText,
      spinnerColor = '#ffffff',
      className = '',
      disabled = false, // Default to false
      ...props
    },
    ref
  ) => {
    // Size classes
    const sizeClasses = {
      xs: 'text-xs h-7 px-2.5',
      sm: 'text-sm h-8 px-3',
      md: 'text-sm h-9 px-4',
      lg: 'text-base h-10 px-6',
      xl: 'text-base h-11 px-8',
    };

    // Build the class names
    const baseClasses = 'inline-flex items-center justify-center font-medium rounded-md transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed';
    const widthClass = props.fullWidth ? 'w-full' : '';
    const shadowClass = props.shadow ? `shadow-${props.shadow} hover:shadow-${props.shadow === 'xl' ? '2xl' : 'lg'}` : '';

    return (
      <button
        ref={ref}
        className={`${baseClasses} ${sizeClasses[size]} ${widthClass} ${shadowClass} ${className}`}
        disabled={isLoading || disabled} // Combine both disabled states
        {...props}
      >
        {isLoading ? (
          <div className="flex items-center justify-center gap-2">
            <div className="relative">
              <div className="absolute inset-0 bg-current opacity-20 rounded-full blur-sm" />
              <Zap 
                className={`animate-spin ${sizeClasses[size].includes('xs') ? 'h-3.5 w-3.5' : 'h-4 w-4'}`}
                style={{ color: spinnerColor }}
              />
            </div>
            {loadingText}
          </div>
        ) : (
          <>
            {props.icon && props.iconPosition === 'left' && props.icon}
            {children}
            {props.icon && props.iconPosition === 'right' && props.icon}
          </>
        )}
      </button>
    );
  }
);

GenericButton.displayName = 'GenericButton';

{/**
    <GenericButton
  disabled={!acceptedTerms || !passwordsMatch}
  onClick={handleSubmit}
>
  Create Account
</GenericButton>



<GenericButton
  isLoading={isLoading}
  disabled={isDisabled} // External disabled condition
  loadingText="Processing..."
>
  Submit
</GenericButton>


<GenericButton
  type="submit"
  variant="solid"
  color="primary"
  size="md"
  fullWidth
  shadow="lg"
  isLoading={isLoading}
  disabled={!isFormValid}
  spinnerColor="#ffffff"
  className="bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 text-white hover:shadow-teal-500/20"
>
  Login
</GenericButton>
    
    */}