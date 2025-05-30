import { supabase } from "@/lib/supabaseClient";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Link, useNavigate } from "react-router-dom";
import { User, Mail, Lock, ArrowRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

export default function Register({ className }: { className?: string }) {
  const navigate = useNavigate();
  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const confirmPasswordRef = useRef<HTMLInputElement>(null);
  
  const [isFocused, setIsFocused] = useState({
    name: false,
    email: false,
    password: false,
    confirmPassword: false
  });
  
  const [passwordsMatch, setPasswordsMatch] = useState(true);

  useEffect(() => {
    nameRef.current?.focus();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const name = nameRef.current?.value || "";
    const email = emailRef.current?.value || "";
    const password = passwordRef.current?.value || "";
    const confirmPassword = confirmPasswordRef.current?.value || "";
    
    if (password !== confirmPassword) {
      toast.error("Passwords don't match");
      setPasswordsMatch(false);
      return;
    }
    
    setPasswordsMatch(true);
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
        }
      }
    });

    if (error) {
      toast.error(error.message);
    } else if (data.user) {
      toast.success("Account created successfully! Check your email for confirmation.");
      setTimeout(() => navigate("/auth/login"), 2000);
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
    hidden: { opacity: 0, x: -50 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { duration: 0.4, ease: "easeOut" }
    }
  };

  return (
    <div className={cn("w-full max-w-md space-y-6", className)}>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name Field */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fieldAnimation}
          transition={{ delay: 0.1 }}
          className="grid gap-3"
        >
          <Label htmlFor="name" className="text-gray-700 font-medium flex items-center gap-2">
            <User className="h-4 w-4 text-teal-500" />
            Full Name
          </Label>
          <div className={`relative transition-all duration-300 ${isFocused.name ? 'ring-2 ring-teal-300 rounded-lg' : ''}`}>
            <Input
              ref={nameRef}
              id="name"
              type="text"
              placeholder="John Doe"
              required
              className="pl-10 focus-visible:ring-0 focus-visible:outline-none"
              onFocus={() => handleFocus('name')}
              onBlur={() => handleBlur('name')}
            />
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          </div>
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
          <Label htmlFor="password" className="text-gray-700 font-medium flex items-center gap-2">
            <Lock className="h-4 w-4 text-teal-500" />
            Password
          </Label>
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
        
        {/* Confirm Password Field */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fieldAnimation}
          transition={{ delay: 0.4 }}
          className="grid gap-3"
        >
          <Label htmlFor="confirmPassword" className="text-gray-700 font-medium flex items-center gap-2">
            <Lock className="h-4 w-4 text-teal-500" />
            Confirm Password
          </Label>
          <div className={`relative transition-all duration-300 ${isFocused.confirmPassword ? 'ring-2 ring-teal-300 rounded-lg' : ''} ${!passwordsMatch ? 'ring-2 ring-red-300' : ''}`}>
            <Input
              ref={confirmPasswordRef}
              id="confirmPassword"
              type="password"
              required
              className="pl-10 focus-visible:ring-0 focus-visible:outline-none"
              onFocus={() => handleFocus('confirmPassword')}
              onBlur={() => handleBlur('confirmPassword')}
            />
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          </div>
          {!passwordsMatch && (
            <p className="text-red-500 text-sm mt-1">Passwords don't match</p>
          )}
        </motion.div>
        
        {/* Submit Button */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fieldAnimation}
          transition={{ delay: 0.5 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Button 
            type="submit" 
            className="w-full bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 text-white group"
          >
            Create Account
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
          transition={{ delay: 0.6 }}
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
          transition={{ delay: 0.7 }}
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
        
        {/* Sign In Link */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fieldAnimation}
          transition={{ delay: 0.8 }}
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