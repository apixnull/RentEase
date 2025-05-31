import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, User, Key, Home, Eye, EyeOff } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ButtonLoading } from "@/components/ui/ButtonLoading";
import { FcGoogle } from "react-icons/fc";
import { signupSchema } from "@/validation/auth/signupSchema";
import { z } from "zod";

export default function RegisterForm({ className }: { className?: string }) {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const confirmRef = useRef<HTMLInputElement>(null);

  const [isFocused, setIsFocused] = useState({
    name: false,
    email: false,
    password: false,
    confirm: false,
  });

  const [accountType, setAccountType] = useState<'TENANT' | 'LANDLORD'>('TENANT');
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    nameRef.current?.focus();
    
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    const name = nameRef.current?.value || "";
    const email = emailRef.current?.value || "";
    const password = passwordRef.current?.value || "";
    const confirmPassword = confirmRef.current?.value || "";

    try {
      signupSchema.parse({
        email,
        password,
        confirmPassword,
        fullName: name,
        role: accountType,
      });
    } catch (err) {
      if (err instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        err.errors.forEach((error) => {
          const path = error.path.join('.');
          newErrors[path] = error.message;
        });
        setErrors(newErrors);
      } else {
        toast.error("Validation failed");
      }
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("http://localhost:4000/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName: name,
          email,
          password,
          confirmPassword,
          role: accountType,
        }),
      });


      if (!response.ok) {
        const errorData = await response.json();
        toast.error(errorData.message || "Registration failed");
        setIsLoading(false);
        return;
      }

      const successData = await response.json();

      // Show success toast
      toast.success(successData.message, {
        duration: 2000,
        onAutoClose: () => {
          // After success toast closes, show loading toast
          const loadingToastId = toast.loading("Redirecting to verification page...");
          
          // Wait 1.5 seconds before redirecting
          setTimeout(() => {
            toast.dismiss(loadingToastId);
            navigate("/auth/verify-email", { state: { email } });
          }, 1500);
        }
      });

    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      toast.loading("Redirecting to Google...");
      // await supabase.auth.signInWithOAuth({ provider: "google" });
      setTimeout(() => setGoogleLoading(false), 2000);
    } catch (error) {
      toast.error("Google sign-in failed");
      setGoogleLoading(false);
    }
  };

  const handleFocus = (field: string) => {
    setIsFocused((prev) => ({ ...prev, [field]: true }));
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = {...prev};
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleBlur = (field: string) => {
    setIsFocused((prev) => ({ ...prev, [field]: false }));
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const fieldAnimation = {
    hidden: { opacity: 0, x: -50 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.4, ease: "easeOut" } },
  };

  const isSmallScreen = windowWidth < 640;
  const accountTypeSize = isSmallScreen ? "text-sm py-2 px-3" : "text-base py-3 px-4";
  const accountTypeIconSize = isSmallScreen ? 16 : 20;

  return (
    <div className={cn("w-full max-w-md space-y-6", className)}>
      <form onSubmit={handleSubmit} className="space-y-6">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fieldAnimation}
          transition={{ delay: 0.1 }}
          className="text-center"
        >
          <h1 className="text-2xl font-bold bg-gradient-to-r from-teal-600 to-blue-700 bg-clip-text text-transparent">
            Create your account
          </h1>
          <p className="mt-2 text-gray-500 text-sm">
            Get started with RentEase in seconds
          </p>
        </motion.div>

        {/* Name Field */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fieldAnimation}
          transition={{ delay: 0.2 }}
          className="grid gap-1"
        >
          <Label
            htmlFor="name"
            className="text-gray-700 font-medium flex items-center gap-2"
          >
            <User className="h-4 w-4 text-teal-500" />
            Full Name
          </Label>
          <div
            className={`relative transition-all duration-300 ${
              isFocused.name ? "ring-2 ring-teal-300 rounded-lg" : ""
            }`}
          >
            <Input
              ref={nameRef}
              id="name"
              type="text"
              placeholder="John Doe"
              required
              className="pl-10 focus-visible:ring-0 focus-visible:outline-none"
              onFocus={() => handleFocus("fullName")}
              onBlur={() => handleBlur("name")}
            />
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          </div>
          <div className="h-5">
            {errors.fullName && (
              <p className="text-sm text-red-500">{errors.fullName}</p>
            )}
          </div>
        </motion.div>

        {/* Account Type Selection */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fieldAnimation}
          transition={{ delay: 0.3 }}
          className="grid gap-1"
        >
          <Label className="text-gray-700 font-medium flex items-center gap-2">
            <Key className="h-4 w-4 text-teal-500" />
            Account Type
          </Label>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setAccountType('TENANT')}
              className={`flex flex-col sm:flex-row items-center justify-center gap-2 ${accountTypeSize} rounded-lg border transition-colors ${
                accountType === 'TENANT'
                  ? 'bg-gradient-to-r from-teal-500 to-blue-600 text-white border-transparent'
                  : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
              }`}
            >
              <User size={accountTypeIconSize} />
              <span>Tenant</span>
            </button>
            <button
              type="button"
              onClick={() => setAccountType('LANDLORD')}
              className={`flex flex-col sm:flex-row items-center justify-center gap-2 ${accountTypeSize} rounded-lg border transition-colors ${
                accountType === 'LANDLORD'
                  ? 'bg-gradient-to-r from-teal-500 to-blue-600 text-white border-transparent'
                  : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Home size={accountTypeIconSize} />
              <span>Landlord</span>
            </button>
          </div>
          <div className="h-5">
            {errors.role && (
              <p className="text-sm text-red-500">{errors.role}</p>
            )}
          </div>
        </motion.div>

        {/* Email Field */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fieldAnimation}
          transition={{ delay: 0.4 }}
          className="grid gap-1"
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
          <div className="h-5">
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email}</p>
            )}
          </div>
        </motion.div>

        {/* Password Field */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fieldAnimation}
          transition={{ delay: 0.5 }}
          className="grid gap-1"
        >
          <Label
            htmlFor="password"
            className="text-gray-700 font-medium flex items-center gap-2"
          >
            <Lock className="h-4 w-4 text-teal-500" />
            Password
          </Label>
          <div
            className={`relative transition-all duration-300 ${
              isFocused.password ? "ring-2 ring-teal-300 rounded-lg" : ""
            }`}
          >
            <Input
              ref={passwordRef}
              id="password"
              type={showPassword ? "text" : "password"}
              required
              className="pl-10 pr-10 focus-visible:ring-0 focus-visible:outline-none"
              onFocus={() => handleFocus("password")}
              onBlur={() => handleBlur("password")}
            />
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
          <div className="h-5">
            {errors.password ? (
              <p className="text-sm text-red-500">{errors.password}</p>
            ) : (
              <p className="text-xs text-gray-500">
                At least 8 characters with numbers and symbols
              </p>
            )}
          </div>
        </motion.div>

        {/* Confirm Password Field */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fieldAnimation}
          transition={{ delay: 0.6 }}
          className="grid gap-1"
        >
          <Label
            htmlFor="confirm"
            className="text-gray-700 font-medium flex items-center gap-2"
          >
            <Lock className="h-4 w-4 text-teal-500" />
            Confirm Password
          </Label>
          <div
            className={`relative transition-all duration-300 ${
              isFocused.confirm ? "ring-2 ring-teal-300 rounded-lg" : ""
            }`}
          >
            <Input
              ref={confirmRef}
              id="confirm"
              type="password"
              required
              className="pl-10 focus-visible:ring-0 focus-visible:outline-none"
              onFocus={() => handleFocus("confirmPassword")}
              onBlur={() => handleBlur("confirm")}
            />
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          </div>
          <div className="h-5">
            {errors.confirmPassword && (
              <p className="text-sm text-red-500">{errors.confirmPassword}</p>
            )}
          </div>
        </motion.div>

        {/* Submit Button */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fieldAnimation}
          transition={{ delay: 0.7 }}
        >
          <ButtonLoading
            type="submit"
            isLoading={isLoading}
            className="w-full bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 text-white"
          >
            {!isLoading && "Create Account"}
          </ButtonLoading>
        </motion.div>

        {/* Divider */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fieldAnimation}
          transition={{ delay: 0.8 }}
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

        {/* Google Button */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fieldAnimation}
          transition={{ delay: 0.9 }}
        >
          <ButtonLoading
            isLoading={googleLoading}
            className="w-full bg-gray-50 border border-gray-200 hover:bg-gray-100 text-gray-700 font-medium transition-colors"
            spinnerClassName="text-blue-500"
            onClick={handleGoogleSignIn}
          >
            {!googleLoading && (
              <div className="flex items-center justify-center">
                <div className="bg-white rounded-full p-1 mr-3">
                  <FcGoogle className="h-5 w-5" />
                </div>
                <span>Sign up with Google</span>
              </div>
            )}
          </ButtonLoading>
        </motion.div>

        {/* Login Link */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fieldAnimation}
          transition={{ delay: 1.0 }}
          className="mt-6 text-center text-sm text-gray-600"
        >
          Already have an account?{" "}
          <Link
            to="/auth/login"
            className="font-medium text-teal-600 hover:text-teal-800 underline underline-offset-4 transition-colors"
          >
            Sign in
          </Link>
        </motion.div>
      </form>
    </div>
  );
}