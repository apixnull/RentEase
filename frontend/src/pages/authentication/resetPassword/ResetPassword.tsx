import { useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, Eye, EyeOff, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { GenericButton } from "@/components/shared/GenericButton";
import { motion } from "framer-motion";
import { Zap } from "lucide-react";
import { useEffect } from "react";
import { resetPasswordRequest } from "@/services/api/auth.api";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const resetToken = searchParams.get("token");
  const navigate = useNavigate();
  
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({ 
    password: "", 
    confirmPassword: "" 
  });
  const [success, setSuccess] = useState(false);

  // Redirect if token is missing
  useEffect(() => {
    if (!resetToken) {
      toast.error("Invalid reset link");
      navigate("/auth/forgot-password");
    }
  }, [resetToken, navigate]);

  const validateForm = () => {
  const newErrors = { password: "", confirmPassword: "" };
  let isValid = true;

  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

  if (!password) {
    newErrors.password = "Password is required";
    isValid = false;
  } else if (!passwordRegex.test(password)) {
    newErrors.password =
      "Password must be at least 8 characters, include uppercase, lowercase, number, and special character";
    isValid = false;
  }

  if (!confirmPassword) {
    newErrors.confirmPassword = "Confirm your password";
    isValid = false;
  } else if (password !== confirmPassword) {
    newErrors.confirmPassword = "Passwords do not match";
    isValid = false;
  }

  setErrors(newErrors);
  return isValid;
};

const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  if (!resetToken) return;

  if (!validateForm()) return;

  setIsLoading(true);

  try {
    const response = await resetPasswordRequest({
      token: resetToken,
      password,
      confirmPassword,
    });

    toast.success("Password reset successful!", {
      description: response.data?.message || "You can now log in with your new password.",
    });

    setSuccess(true);

    setTimeout(() => navigate("/auth/login"), 3000);
  } catch (error: any) {
    const errorMsg =
      error?.response?.data?.message || "Something went wrong. Please try again.";
    toast.error("Password reset failed", { description: errorMsg });
  } finally {
    setIsLoading(false);
  }
};


  if (!resetToken) {
    return (
      <div className="min-h-svh flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 p-2">
            <Lock className="h-8 w-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Invalid Reset Link
          </h1>
          <p className="text-gray-600 mb-6">
            The password reset link is invalid or has expired. Please request a new one.
          </p>
          <Link
            to="/auth/forgot-password"
            className="inline-flex items-center justify-center px-4 py-2 bg-gradient-to-r from-teal-600 to-blue-600 text-white rounded-md hover:from-teal-700 hover:to-blue-700 transition-all"
          >
            Request New Reset Link
          </Link>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-svh flex items-center justify-center p-6 bg-gradient-to-br from-white to-gray-50">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="max-w-md w-full text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
            className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100 p-2"
          >
            <CheckCircle className="h-10 w-10 text-green-600" strokeWidth={1.5} />
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-2xl font-bold text-gray-800 mb-2"
          >
            Password Reset Successfully!
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-gray-600 mb-8"
          >
            Your password has been updated. Redirecting to login...
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <div className="h-1 w-48 mx-auto bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-teal-500 to-blue-500"
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ duration: 3, ease: "linear" }}
              />
            </div>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      {/* Left Panel - Form Section */}
      <div className="flex flex-col gap-4 p-6 md:p-10 bg-gradient-to-br from-white to-gray-50">
        {/* Logo */}
        <div className="flex justify-center md:justify-start">
          <Link to="/" className="flex items-center gap-2 font-medium">
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
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="w-full max-w-xs">
            <form className={cn("flex flex-col gap-6")} onSubmit={handleSubmit}>
              <div className="flex flex-col items-center gap-2 text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-teal-500 to-blue-500 p-2 shadow-lg">
                  <Lock className="h-6 w-6 text-white" />
                </div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent">
                  Reset Password
                </h1>
                <p className="text-muted-foreground text-sm">
                  Create a new password for your account
                </p>
              </div>

              <div className="grid gap-6">
                <div className="grid gap-3">
                  <Label
                    htmlFor="password"
                    className="flex items-center gap-2 text-foreground/80"
                  >
                    <Lock className="h-4 w-4" />
                    New Password
                  </Label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      <Lock className="h-4 w-4" />
                    </div>
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter new password"
                      required
                      className={cn(
                        "pl-10 focus-visible:ring-teal-200 border-border/70 pr-10",
                        errors.password && "border-red-500 focus:border-red-500"
                      )}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isLoading}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-red-500 text-xs -mt-2">{errors.password}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    Must be at least 8 characters
                  </p>
                </div>

                <div className="grid gap-3">
                  <Label
                    htmlFor="confirmPassword"
                    className="flex items-center gap-2 text-foreground/80"
                  >
                    <Lock className="h-4 w-4" />
                    Confirm Password
                  </Label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      <Lock className="h-4 w-4" />
                    </div>
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm new password"
                      required
                      className={cn(
                        "pl-10 focus-visible:ring-teal-200 border-border/70 pr-10",
                        errors.confirmPassword && "border-red-500 focus:border-red-500"
                      )}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      disabled={isLoading}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-red-500 text-xs -mt-2">{errors.confirmPassword}</p>
                  )}
                </div>

                <div>
                  <GenericButton
                    type="submit"
                    variant="solid"
                    color="primary"
                    size="md"
                    fullwidth
                    shadow="lg"
                    isLoading={isLoading}
                    loadingText="Updating password..."
                    spinnerColor="#ffffff"
                    className="bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 text-white hover:shadow-teal-500/20"
                  >
                    Reset Password
                  </GenericButton>
                </div>
              </div>

              <div className="text-center text-sm">
                Remember your password?{" "}
                <Link
                  to="/auth/login"
                  className="text-teal-600 font-medium hover:text-teal-800 transition-colors"
                >
                  Sign in
                </Link>
              </div>
            </form>
          </div>
        </motion.div>
      </div>

      {/* Right Panel - Visual Design */}
      <div className="bg-gradient-to-br from-teal-600 to-blue-700 relative hidden lg:block overflow-hidden">
        {/* Floating Shapes */}
        <motion.div
          className="absolute top-1/4 left-1/4 w-40 h-40 rounded-full bg-teal-400/20 backdrop-blur-md"
          animate={{
            y: [0, -30, 0],
            scale: [1, 1.05, 1]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        <motion.div
          className="absolute top-1/3 right-1/3 w-24 h-24 rotate-45 bg-white/15 backdrop-blur-sm border border-white/20"
          animate={{
            rotate: [45, 90, 45],
            x: [0, 20, 0]
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        <motion.div
          className="absolute bottom-1/4 left-1/3 w-36 h-36 rounded-lg bg-blue-400/20 backdrop-blur-md"
          animate={{
            y: [0, 40, 0],
            borderRadius: ["20%", "30%", "20%"]
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        <motion.div
          className="absolute bottom-1/3 right-1/4 w-20 h-20 rounded-full bg-teal-300/20 backdrop-blur-sm"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        {/* Center Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-10 z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="max-w-md"
          >
            <div className="mb-6 inline-flex items-center justify-center rounded-full bg-white/10 p-4 backdrop-blur-sm">
              <Lock className="h-12 w-12 text-white" />
            </div>
            
            <motion.h2 
              className="text-4xl font-bold text-white mb-4"
              animate={{
                textShadow: [
                  "0 0 0px rgba(255,255,255,0.3)",
                  "0 0 12px rgba(255,255,255,0.5)",
                  "0 0 0px rgba(255,255,255,0.3)"
                ]
              }}
              transition={{
                duration: 3,
                repeat: Infinity
              }}
            >
              Secure Password Reset
            </motion.h2>
            
            <motion.p
              className="text-xl text-white/90 mb-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              Create a new strong password to protect your account
            </motion.p>
            
            <motion.div
              className="flex flex-col gap-3 text-white/80 text-left max-w-xs mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              <div className="flex items-center gap-3">
                <span className="h-2 w-2 rounded-full bg-teal-300"></span>
                <span>Create a strong, unique password</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="h-2 w-2 rounded-full bg-teal-300"></span>
                <span>Confirm your new password</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="h-2 w-2 rounded-full bg-teal-300"></span>
                <span>Immediate access after reset</span>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Animated Grid Pattern */}
        <div className="absolute inset-0 opacity-20">
          <svg
            className="absolute inset-0 h-full w-full"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <pattern
                id="grid-pattern"
                width="40"
                height="40"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M 40 0 L 0 0 0 40"
                  fill="none"
                  stroke="white"
                  strokeWidth="0.5"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid-pattern)" />
          </svg>
        </div>
      </div>
    </div>
  );
}