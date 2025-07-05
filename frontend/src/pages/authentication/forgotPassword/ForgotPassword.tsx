import { useState, type FormEvent, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail } from "lucide-react";
import { toast } from "sonner";
import { GenericButton } from "@/components/shared/GenericButton";
import { motion } from "framer-motion";
import { Zap } from "lucide-react";
import { forgotPasswordRequest } from "@/services/api/auth.api";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({ email: "" });
  const [isSent, setIsSent] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const cooldownRef = useRef<NodeJS.Timeout | null>(null);

  // Clear interval on unmount
  useEffect(() => {
    return () => {
      if (cooldownRef.current) {
        clearInterval(cooldownRef.current);
      }
    };
  }, []);

  const startCooldown = () => {
    setIsSent(true);
    let count = 30;
    setCooldown(count);
    
    cooldownRef.current = setInterval(() => {
      count -= 1;
      setCooldown(count);
      
      if (count <= 0 && cooldownRef.current) {
        clearInterval(cooldownRef.current);
        cooldownRef.current = null;
      }
    }, 1000);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Prevent submission during cooldown
    if (cooldown > 0) return;
    
    setIsLoading(true);
    setErrors({ email: "" });

    // Simple validation
    if (!email) {
      setErrors({ email: "Email is required" });
      setIsLoading(false);
      return;
    }

    // Check email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrors({ email: "Please enter a valid email address" });
      setIsLoading(false);
      return;
    }

    try {
      const response = await forgotPasswordRequest(email);
      const { message } = response.data;

      toast.success(message);
      // Start cooldown and show inline success message
      startCooldown();
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        "Something went wrong. Please try again.";
      toast.error("Failed to send reset email", { description: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

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
            <span
              className="text-lg font-extrabold bg-gradient-to-r from-teal-600 via-blue-600 to-teal-600 
              bg-[length:300%_auto] bg-clip-text text-transparent"
            >
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
                  <Mail className="h-6 w-6 text-white" />
                </div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent">
                  Reset Password
                </h1>
                <p className="text-muted-foreground text-sm">
                  Enter your email to receive a password reset link
                </p>
              </div>

              <div className="grid gap-6">
                <div className="grid gap-3">
                  <Label
                    htmlFor="email"
                    className="flex items-center gap-2 text-foreground/80"
                  >
                    <Mail className="h-4 w-4" />
                    Email Address
                  </Label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      <Mail className="h-4 w-4" />
                    </div>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="email@example.com"
                      required
                      className={cn(
                        "pl-10 focus-visible:ring-teal-200 border-border/70",
                        errors.email && "border-red-500 focus:border-red-500"
                      )}
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        // Reset cooldown if email changes
                        if (isSent) {
                          setIsSent(false);
                          if (cooldownRef.current) {
                            clearInterval(cooldownRef.current);
                            cooldownRef.current = null;
                          }
                          setCooldown(0);
                        }
                      }}
                      disabled={isLoading}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-red-500 text-xs -mt-2">{errors.email}</p>
                  )}
                </div>

                {/* Success message */}
                {isSent && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="bg-teal-50 border border-teal-200 rounded-lg p-4"
                  >
                    <div className="flex items-start gap-3">
                      <svg
                        className="h-5 w-5 text-teal-600 shrink-0 mt-0.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <div>
                        <p className="text-teal-800 font-medium">
                          Reset link sent successfully!
                        </p>
                        <p className="text-teal-700 text-sm mt-1">
                          We've sent a password reset link to{" "}
                          <span className="font-semibold">{email}</span>. Please
                          check your inbox and follow the instructions.
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}

                <div>
                  <GenericButton
                    type="submit"
                    variant="solid"
                    color="primary"
                    size="md"
                    fullwidth
                    shadow="lg"
                    isLoading={isLoading}
                    loadingText="Sending reset link..."
                    spinnerColor="#ffffff"
                    disabled={isLoading || cooldown > 0}
                    className={cn(
                      "bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 text-white hover:shadow-teal-500/20",
                      cooldown > 0 && "opacity-75 cursor-not-allowed"
                    )}
                  >
                    {cooldown > 0
                      ? `Resend in ${cooldown}s`
                      : "Send Reset Link"}
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
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 relative hidden lg:block overflow-hidden">
        {/* Floating Shapes */}
        <motion.div
          className="absolute top-1/4 left-1/4 w-40 h-40 rounded-full bg-blue-400/20 backdrop-blur-md"
          animate={{
            y: [0, -30, 0],
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        <motion.div
          className="absolute top-1/3 right-1/3 w-24 h-24 rotate-45 bg-white/15 backdrop-blur-sm border border-white/20"
          animate={{
            rotate: [45, 90, 45],
            x: [0, 20, 0],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        <motion.div
          className="absolute bottom-1/4 left-1/3 w-36 h-36 rounded-lg bg-indigo-400/20 backdrop-blur-md"
          animate={{
            y: [0, 40, 0],
            borderRadius: ["20%", "30%", "20%"],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        <motion.div
          className="absolute bottom-1/3 right-1/4 w-20 h-20 rounded-full bg-blue-300/20 backdrop-blur-sm"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: "easeInOut",
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
              <Zap className="h-12 w-12 text-white" fill="currentColor" />
            </div>

            <motion.h2
              className="text-4xl font-bold text-white mb-4"
              animate={{
                textShadow: [
                  "0 0 0px rgba(255,255,255,0.3)",
                  "0 0 12px rgba(255,255,255,0.5)",
                  "0 0 0px rgba(255,255,255,0.3)",
                ],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
              }}
            >
              Reset Your Password
            </motion.h2>

            <motion.p
              className="text-xl text-white/90 mb-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              We'll help you securely regain access to your account
            </motion.p>

            <motion.div
              className="flex flex-col gap-3 text-white/80 text-left max-w-xs mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              <div className="flex items-center gap-3">
                <span className="h-2 w-2 rounded-full bg-blue-300"></span>
                <span>Secure password reset process</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="h-2 w-2 rounded-full bg-blue-300"></span>
                <span>Easy-to-follow instructions</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="h-2 w-2 rounded-full bg-blue-300"></span>
                <span>Get back to your account quickly</span>
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