import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Lock, Eye, EyeOff, User, Check } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Zap } from "lucide-react";
import Footer from "@/components/public/Footer";
import { motion } from "framer-motion";

type RegisterProps = React.HTMLAttributes<HTMLFormElement> & {
  className?: string;
};

export function RegisterForm({
  className,
  ...props
}: RegisterProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [userRole, setUserRole] = useState<'tenant' | 'landlord'>('tenant');
  const [passwordsMatch, setPasswordsMatch] = useState(true);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Validate passwords match
    if (password !== confirmPassword) {
      setPasswordsMatch(false);
      return;
    }
    
    setIsLoading(true);
    // Simulate registration process
    setTimeout(() => setIsLoading(false), 1500);
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    if (confirmPassword && value !== confirmPassword) {
      setPasswordsMatch(false);
    } else {
      setPasswordsMatch(true);
    }
  };

  const handleConfirmPasswordChange = (value: string) => {
    setConfirmPassword(value);
    if (password !== value) {
      setPasswordsMatch(false);
    } else {
      setPasswordsMatch(true);
    }
  };

  return (
    <form
      className={cn("flex flex-col gap-6", className)}
      onSubmit={handleSubmit}
      {...props}
    >
      <div className="flex flex-col items-center gap-2 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-teal-500 to-blue-500 p-2 shadow-lg">
          <User className="h-6 w-6 text-white" />
        </div>
        <h1 className="text-2xl font-bold bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent">
          Create an account
        </h1>
        <p className="text-muted-foreground text-sm text-balance">
          Enter your details to get started
        </p>
      </div>

      <div className="grid gap-6">
        {/* Role Selection */}
        <div className="grid gap-3">
          <Label className="flex items-center gap-2 text-foreground/80">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            I am a
          </Label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setUserRole('tenant')}
              className={cn(
                "flex items-center justify-center gap-2 py-2 rounded-md border transition-all",
                userRole === 'tenant'
                  ? "border-teal-500 bg-teal-50 text-teal-700"
                  : "border-input hover:bg-accent text-muted-foreground"
              )}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
              </svg>
              Tenant
            </button>
            <button
              type="button"
              onClick={() => setUserRole('landlord')}
              className={cn(
                "flex items-center justify-center gap-2 py-2 rounded-md border transition-all",
                userRole === 'landlord'
                  ? "border-blue-500 bg-blue-50 text-blue-700"
                  : "border-input hover:bg-accent text-muted-foreground"
              )}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              Landlord
            </button>
          </div>
        </div>

        {/* Name fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="grid gap-3">
            <Label htmlFor="firstName" className="flex items-center gap-2 text-foreground/80">
              <User className="h-4 w-4" />
              First Name
            </Label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                <User className="h-4 w-4" />
              </div>
              <Input 
                id="firstName" 
                type="text" 
                placeholder="John" 
                required 
                className="pl-10 focus-visible:ring-teal-200 border-border/70"
              />
            </div>
          </div>

          <div className="grid gap-3">
            <Label htmlFor="lastName" className="flex items-center gap-2 text-foreground/80">
              <User className="h-4 w-4" />
              Last Name
            </Label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                <User className="h-4 w-4" />
              </div>
              <Input 
                id="lastName" 
                type="text" 
                placeholder="Doe" 
                required 
                className="pl-10 focus-visible:ring-teal-200 border-border/70"
              />
            </div>
          </div>
        </div>

        {/* Email field */}
        <div className="grid gap-3">
          <Label htmlFor="email" className="flex items-center gap-2 text-foreground/80">
            <Mail className="h-4 w-4" />
            Email Address
          </Label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              <Mail className="h-4 w-4" />
            </div>
            <Input 
              id="email" 
              type="email" 
              placeholder="email@example.com" 
              required 
              className="pl-10 focus-visible:ring-teal-200 border-border/70"
            />
          </div>
        </div>

        {/* Password field */}
        <div className="grid gap-3">
          <Label htmlFor="password" className="flex items-center gap-2 text-foreground/80">
            <Lock className="h-4 w-4" />
            Password
          </Label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              <Lock className="h-4 w-4" />
            </div>
            <Input 
              id="password" 
              type={showPassword ? "text" : "password"} 
              required 
              value={password}
              onChange={(e) => handlePasswordChange(e.target.value)}
              className="pl-10 focus-visible:ring-teal-200 border-border/70 pr-10"
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Confirm Password field */}
        <div className="grid gap-3">
          <Label htmlFor="confirmPassword" className="flex items-center gap-2 text-foreground/80">
            <Lock className="h-4 w-4" />
            Confirm Password
          </Label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              <Lock className="h-4 w-4" />
            </div>
            <Input 
              id="confirmPassword" 
              type={showConfirmPassword ? "text" : "password"} 
              required 
              value={confirmPassword}
              onChange={(e) => handleConfirmPasswordChange(e.target.value)}
              className={cn(
                "pl-10 focus-visible:ring-teal-200 border-border/70 pr-10",
                !passwordsMatch && "border-red-500 focus-visible:ring-red-200"
              )}
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {!passwordsMatch && (
            <p className="text-red-500 text-xs -mt-2 flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              Passwords do not match
            </p>
          )}
        </div>

        {/* Terms and Conditions */}
        <div className="flex items-start gap-3 mt-2">
          <button
            type="button"
            onClick={() => setAcceptedTerms(!acceptedTerms)}
            className={cn(
              "mt-0.5 flex h-5 w-5 items-center justify-center rounded-md border transition-all",
              acceptedTerms 
                ? 'bg-teal-500 border-teal-500 text-white' 
                : 'border-input'
            )}
          >
            {acceptedTerms && <Check className="h-4 w-4" />}
          </button>
          <div className="text-sm text-left">
            <div className="font-normal">
              <span className="select-none">I agree to the </span>
              <a 
                href="#" 
                className="text-teal-600 hover:text-teal-800 transition-colors underline"
                onClick={(e) => e.stopPropagation()}
              >
                Terms of Service
              </a>
              <span className="select-none"> and </span>
              <a 
                href="#" 
                className="text-teal-600 hover:text-teal-800 transition-colors underline"
                onClick={(e) => e.stopPropagation()}
              >
                Privacy Policy
              </a>
            </div>
            <p className="text-muted-foreground text-xs mt-1">
              By creating an account, you agree to our terms and privacy policy
            </p>
          </div>
        </div>

        {/* Submit button */}
        <div>
          <Button 
            type="submit" 
            className="w-full bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 text-white shadow-lg hover:shadow-teal-500/20 transition-all relative"
            disabled={isLoading || !acceptedTerms || !passwordsMatch}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="h-5 w-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
              </div>
            ) : (
              "Create Account"
            )}
          </Button>
        </div>
      </div>

      <div className="text-center text-sm">
        Already have an account?{" "}
        <Link to={"/auth/login"} className="text-teal-600 font-medium hover:text-teal-800 transition-colors">
            Login
        </Link>
      </div>
    </form>
  );
}

export const Register = () => {
  return (
    <>
      <div className="grid min-h-svh lg:grid-cols-2">
        {/* Left Panel - Form Section */}
        <div className="flex flex-col gap-4 p-6 md:p-10 bg-gradient-to-br from-white to-gray-50">
          {/* Logo */}
          <div className="flex justify-center md:justify-start">
            <Link to={"/"} className="flex items-center gap-2 font-medium">
              <div className="relative">
                <div className="absolute inset-0 bg-teal-500/20 rounded-full blur-sm" />
                <Zap className="size-6 text-teal-500" fill="currentColor" />
              </div>
              <span className="text-lg font-extrabold bg-gradient-to-r from-teal-600 via-blue-600 to-teal-600 
                bg-[length:300%_auto] bg-clip-text text-transparent">
                RentEase
              </span>
            </Link>
          </div>

          {/* Form Container */}
          <motion.div
            className="flex-1 flex items-center justify-center"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ 
              type: "spring",
              stiffness: 100,
              damping: 15,
              delay: 0.1
            }}
          >
            <div className="w-full max-w-xs">
              <RegisterForm />
            </div>
          </motion.div>
        </div>

        {/* Right Panel - Visual Section */}
        <div className="bg-muted relative hidden lg:block overflow-hidden">
          {/* Animated Blob Background */}
          <motion.div
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              className="absolute top-1/3 -left-1/4 w-[150%] h-[70%] bg-gradient-to-br from-teal-400/30 to-blue-600/40 rounded-full"
              animate={{
                borderRadius: [
                  "60% 40% 30% 70%/60% 30% 70% 40%",
                  "50% 50% 70% 30%/40% 60% 40% 60%",
                  "60% 40% 30% 70%/60% 30% 70% 40%"
                ],
                x: ["0%", "10%", "0%"],
                rotate: [0, 5, 0]
              }}
              transition={{
                duration: 15,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            
            <motion.div
              className="absolute top-1/4 right-1/4 w-[80%] h-[80%] bg-gradient-to-tr from-teal-500/20 to-blue-500/30 rounded-full blur-xl"
              animate={{
                borderRadius: [
                  "30% 70% 70% 30%/30% 30% 70% 70%",
                  "50% 50% 60% 40%/40% 70% 30% 60%",
                  "30% 70% 70% 30%/30% 30% 70% 70%"
                ],
                x: ["0%", "-10%", "0%"],
                rotate: [0, -8, 0]
              }}
              transition={{
                duration: 18,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          </motion.div>
          
          {/* Background Image */}
          <img
            src="/bg.jpg"
            alt="Authentication Background"
            className="absolute inset-0 h-full w-full object-cover -z-10"
          />
          
          {/* Animated Text Overlay */}
          <motion.div 
            className="absolute bottom-10 left-10 right-10 text-white"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7, duration: 0.7 }}
          >
            <motion.h2 
              className="text-3xl font-bold mb-3"
              animate={{ 
                textShadow: [
                  "0 0 0px rgba(255,255,255,0.5)", 
                  "0 0 12px rgba(255,255,255,0.8)", 
                  "0 0 0px rgba(255,255,255,0.5)"
                ]
              }}
              transition={{
                duration: 3,
                repeat: Infinity
              }}
            >
              Join RentEase Today
            </motion.h2>
            <motion.p className="text-lg max-w-md"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
            >
              Create an account to access exclusive features and start your rental journey.
            </motion.p>
          </motion.div>
        </div>
      </div>
      <Footer />
    </>
  );
};