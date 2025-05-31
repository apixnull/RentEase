import { supabase } from "@/lib/supabaseClient";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ButtonLoading } from "@/components/ui/ButtonLoading";
import { FcGoogle } from "react-icons/fc";

export default function Login({ className }: { className?: string }) {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const [isFocused, setIsFocused] = useState({
    email: false,
    password: false,
  });

  useEffect(() => {
    emailRef.current?.focus();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    const startTime = Date.now();

    const email = emailRef.current?.value || "";
    const password = passwordRef.current?.value || "";

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      // Ensure loading lasts at least 2 seconds
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(2000 - elapsed, 0);
      await new Promise((resolve) => setTimeout(resolve, remaining));

      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Logged in successfully");
        navigate("/dashboard");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    const startTime = Date.now();

    try {
      toast.loading("Redirecting to Google...");
      await supabase.auth.signInWithOAuth({ provider: "google" });

      // Ensure loading lasts at least 2 seconds
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(2000 - elapsed, 0);
      await new Promise((resolve) => setTimeout(resolve, remaining));
    } catch (error) {
      toast.error("Google sign-in failed");
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleFocus = (field: string) => {
    setIsFocused((prev) => ({ ...prev, [field]: true }));
  };

  const handleBlur = (field: string) => {
    setIsFocused((prev) => ({ ...prev, [field]: false }));
  };

  // Animation settings
  const fieldAnimation = {
    hidden: { opacity: 0, x: 50 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.4, ease: "easeOut" },
    },
  };

  return (
    <div className={cn("w-full max-w-md space-y-6", className)}>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Heading */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fieldAnimation}
          transition={{ delay: 0.1 }}
          className="text-center"
        >
          <h1 className="text-2xl font-bold bg-gradient-to-r from-teal-600 to-blue-700 bg-clip-text text-transparent">
            Welcome back
          </h1>
          <p className="mt-2 text-gray-500 text-sm">
            Sign in to continue to your account
          </p>
        </motion.div>

        {/* Email Field */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fieldAnimation}
          transition={{ delay: 0.2 }}
          className="grid gap-3"
        >
          <Label
            htmlFor="email"
            className="text-gray-700 font-medium flex items-center gap-2"
          >
            <Mail className="h-4 w-4 text-teal-500" />
            Email
          </Label>
          <div
            className={`relative transition-all duration-300 ${
              isFocused.email ? "ring-2 ring-teal-300 rounded-lg" : ""
            }`}
          >
            <Input
              ref={emailRef}
              id="email"
              type="email"
              placeholder="name@example.com"
              required
              className="pl-10 focus-visible:ring-0 focus-visible:outline-none"
              onFocus={() => handleFocus("email")}
              onBlur={() => handleBlur("email")}
            />
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          </div>
        </motion.div>

        {/* Password Field */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fieldAnimation}
          transition={{ delay: 0.3 }}
          className="grid gap-3"
        >
          <div className="flex items-center">
            <Label
              htmlFor="password"
              className="text-gray-700 font-medium flex items-center gap-2"
            >
              <Lock className="h-4 w-4 text-teal-500" />
              Password
            </Label>
            <Link
              to="/auth/forgot-password"
              className="ml-auto text-sm text-teal-600 hover:text-teal-800 underline-offset-4 hover:underline transition-colors"
            >
              Forgot password?
            </Link>
          </div>
          <div
            className={`relative transition-all duration-300 ${
              isFocused.password ? "ring-2 ring-teal-300 rounded-lg" : ""
            }`}
          >
            <Input
              ref={passwordRef}
              id="password"
              type="password"
              required
              className="pl-10 focus-visible:ring-0 focus-visible:outline-none"
              onFocus={() => handleFocus("password")}
              onBlur={() => handleBlur("password")}
            />
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          </div>
        </motion.div>

        {/* Submit Button */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fieldAnimation}
          transition={{ delay: 0.4 }}
        >
          <ButtonLoading
            type="submit"
            isLoading={isLoading}
            className="w-full bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 text-white"
          >
            {!isLoading && "Login"}
          </ButtonLoading>
        </motion.div>

        {/* Divider */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fieldAnimation}
          transition={{ delay: 0.5 }}
          className="relative my-6"
        >
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-transparent text-gray-500">
              Or continue with
            </span>
          </div>
        </motion.div>

        {/* Google Button - Updated with visible loading spinner */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fieldAnimation}
          transition={{ delay: 0.6 }}
        >
          <ButtonLoading
            isLoading={googleLoading}
            className="w-full bg-gray-50 border border-gray-200 hover:bg-gray-100 text-gray-700 font-medium transition-colors"
            spinnerClassName="text-blue-500" // Added custom spinner class
            onClick={handleGoogleSignIn}
          >
            {!googleLoading && (
              <div className="flex items-center justify-center">
                <div className="bg-white rounded-full p-1 mr-3">
                  <FcGoogle className="h-5 w-5" />
                </div>
                <span>Sign in with Google</span>
              </div>
            )}
          </ButtonLoading>
        </motion.div>

        {/* Sign Up Link */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fieldAnimation}
          transition={{ delay: 0.7 }}
          className="mt-6 text-center text-sm text-gray-600"
        >
          Don't have an account?{" "}
          <Link
            to="/auth/register"
            className="font-medium text-teal-600 hover:text-teal-800 underline underline-offset-4 transition-colors"
          >
            Sign up
          </Link>
        </motion.div>
      </form>
    </div>
  );
}
