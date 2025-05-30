import { supabase } from "@/lib/supabaseClient";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { Mail, Lock, ArrowRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

export default function Login({ className }: { className?: string }) {
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const [isFocused, setIsFocused] = useState({
    email: false,
    password: false
  });

  useEffect(() => {
    emailRef.current?.focus();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const email = emailRef.current?.value || "";
    const password = passwordRef.current?.value || "";

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Logged in successfully");
    }
  };

  const handleFocus = (field: string) => {
    setIsFocused(prev => ({ ...prev, [field]: true }));
  };

  const handleBlur = (field: string) => {
    setIsFocused(prev => ({ ...prev, [field]: false }));
  };

  // Animation settings
  const fieldAnimation = {
    hidden: { opacity: 0, x: 50 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { duration: 0.4, ease: "easeOut" }
    }
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
          <Label htmlFor="email" className="text-gray-700 font-medium flex items-center gap-2">
            <Mail className="h-4 w-4 text-teal-500" />
            Email
          </Label>
          <div className={`relative transition-all duration-300 ${isFocused.email ? 'ring-2 ring-teal-300 rounded-lg' : ''}`}>
            <Input
              ref={emailRef}
              id="email"
              type="email"
              placeholder="name@example.com"
              required
              className="pl-10 focus-visible:ring-0 focus-visible:outline-none"
              onFocus={() => handleFocus('email')}
              onBlur={() => handleBlur('email')}
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
            <Label htmlFor="password" className="text-gray-700 font-medium flex items-center gap-2">
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
          <div className={`relative transition-all duration-300 ${isFocused.password ? 'ring-2 ring-teal-300 rounded-lg' : ''}`}>
            <Input
              ref={passwordRef}
              id="password"
              type="password"
              required
              className="pl-10 focus-visible:ring-0 focus-visible:outline-none"
              onFocus={() => handleFocus('password')}
              onBlur={() => handleBlur('password')}
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
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Button 
            type="submit" 
            className="w-full bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 text-white group"
          >
            Login
            <motion.span
              animate={{ x: [0, 5, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="inline-block"
            >
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </motion.span>
          </Button>
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
        
        {/* Google Button */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fieldAnimation}
          transition={{ delay: 0.6 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Button
            variant="outline"
            className="w-full border-gray-300 text-gray-700 hover:bg-gray-50 group"
            onClick={() => {  
              toast.loading("Redirecting to Google...");
              supabase.auth.signInWithOAuth({ provider: "google" });
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-5 w-5 mr-2">
              <path
                d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                fill="currentColor"
              />
            </svg>
            Google
            <motion.span
              animate={{ x: [0, 5, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="inline-block"
            >
              <ArrowRight className="ml-2 h-4 w-4 text-gray-500 group-hover:translate-x-1 transition-transform" />
            </motion.span>
          </Button>
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