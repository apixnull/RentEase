import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Mail, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import Footer from "@/components/public/Footer";

export function ForgetPasswordForm({ className }: { className?: string }) {
  const [emailSent, setEmailSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Fake API delay
    setTimeout(() => {
      setIsLoading(false);
      setEmailSent(true);
    }, 1500);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={cn("flex flex-col gap-6", className)}
    >
      <div className="flex flex-col items-center gap-2 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-teal-500 to-blue-500 p-2 shadow-lg">
          <Mail className="h-6 w-6 text-white" />
        </div>
        <h1 className="text-2xl font-bold bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent">
          Reset your password
        </h1>
        <p className="text-muted-foreground text-sm text-balance">
          Enter your email to receive a reset link
        </p>
      </div>

      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="email">Email Address</Label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              <Mail className="h-4 w-4" />
            </div>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
              className="pl-10"
            />
          </div>
        </div>

        <Button
          type="submit"
          className="w-full bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 text-white shadow-lg transition-all"
          disabled={isLoading || emailSent}
        >
          {isLoading ? (
            <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
          ) : emailSent ? (
            "Link Sent!"
          ) : (
            "Send Reset Link"
          )}
        </Button>
      </div>

      <div className="text-center text-sm">
        Back to{" "}
        <Link to="/auth/login" className="text-teal-600 hover:text-teal-800 font-medium transition-colors">
          login
        </Link>
      </div>
    </form>
  );
}

export const ForgetPassword = () => {
  return (
    <>
      <div className="grid min-h-svh lg:grid-cols-2">
        {/* Left: Form Section */}
        <div className="flex flex-col gap-4 p-6 md:p-10 bg-gradient-to-br from-white to-gray-50">
          {/* Logo */}
          <div className="flex justify-center md:justify-start">
            <Link to="/" className="flex items-center gap-2 font-medium">
              <div className="relative">
                <div className="absolute inset-0 bg-teal-500/20 rounded-full blur-sm" />
                <Zap className="size-6 text-teal-500" fill="currentColor" />
              </div>
              <span className="text-lg font-extrabold bg-gradient-to-r from-teal-600 via-blue-600 to-teal-600 bg-[length:300%_auto] bg-clip-text text-transparent">
                RentEase
              </span>
            </Link>
          </div>

          <motion.div
            className="flex-1 flex items-center justify-center"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ type: "spring", stiffness: 100, damping: 15, delay: 0.1 }}
          >
            <div className="w-full max-w-xs">
              <ForgetPasswordForm />
            </div>
          </motion.div>
        </div>

        {/* Right: Animation Section */}
        <div className="bg-muted relative hidden lg:block overflow-hidden">
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

          <img
            src="/bg.jpg"
            alt="Reset Password Background"
            className="absolute inset-0 h-full w-full object-cover -z-10"
          />

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
              transition={{ duration: 3, repeat: Infinity }}
            >
              Forgot your password?
            </motion.h2>
            <motion.p className="text-lg max-w-md">
              No worries! We’ll send you a secure link to reset and regain access.
            </motion.p>
          </motion.div>
        </div>
      </div>
      <Footer />
    </>
  );
};
