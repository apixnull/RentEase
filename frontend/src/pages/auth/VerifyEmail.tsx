// File: src/pages/auth/verify-email/VerifyEmail.tsx
import { useEffect, useState } from "react";
import { Key, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { toast } from "sonner";


export default function VerifyEmail() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || "your.email@example.com";

  const [code, setCode] = useState("");
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [verifying, setVerifying] = useState(false);

  // Cooldown timer for resend button
  useEffect(() => {
    if (cooldown === 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

const handleResend = async () => {
  if (cooldown > 0) return;
  setResending(true);

  try {
    const res = await fetch(`http://localhost:4000/api/auth/resend-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
      credentials: "include",
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.message || "Failed to resend code");
    }

    toast.success("Verification code resent successfully!");
    setCooldown(40);
  } catch (err: any) {
    toast.error(err.message || "Failed to resend code. Please try again.");
  } finally {
    setResending(false);
  }
};

  const handleVerify = async () => {
  if (code.length !== 6) {
    toast.error("Please enter a 6-digit code");
    return;
  }

  setVerifying(true);
  try {
    const res = await fetch(`http://localhost:4000/api/auth/verify-email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp: code }),
      credentials: "include",
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.message || "Verification failed");
    }

    toast.success("Email verified successfully!");
    setTimeout(() => navigate("/dashboard"), 1500);
  } catch (err: any) {
    toast.error(err.message || "Invalid verification code");
  } finally {
    setVerifying(false);
  }
};

  // Animation variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

 

  return (
    <div className="min-h-svh flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      {/* Floating Blob Background */}
      <motion.div 
        className="absolute -z-10 opacity-20"
        animate={{
          scale: [1, 1.3, 1],
          rotate: [0, 360],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <div className="bg-gradient-to-r from-teal-300 to-blue-400 rounded-full h-[300px] w-[500px] blur-[100px]"></div>
      </motion.div>

      {/* Verification Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="w-full p-6 md:p-8 shadow-xl rounded-2xl border-0 bg-white/90 backdrop-blur-sm">
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="space-y-6"
          >
            <motion.div variants={item} className="text-center space-y-4">
              <div className="relative mx-auto w-fit">
                <motion.div
                  className="absolute -inset-4 bg-teal-400/20 rounded-full blur-xl"
                  animate={{
                    scale: [1, 1.2, 1],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    repeatType: "reverse"
                  }}
                />
                <div className="relative mx-auto bg-gradient-to-r from-teal-500 to-blue-600 p-3 rounded-full w-16 h-16 flex items-center justify-center">
                  <Key className="h-8 w-8 text-white" />
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-teal-600 to-blue-700 bg-clip-text text-transparent">
                  Verify Your Email
                </h2>
                <p className="text-gray-600 mt-2 text-sm">
                  We've sent a 6-digit code to
                </p>
                <p className="font-medium text-gray-900 mt-1 truncate">{email}</p>
              </div>
            </motion.div>

            <motion.div variants={item}>
              <div className="relative">
                <input
                  type="text"
                  maxLength={6}
                  value={code}
                  onChange={(e) => {
                    if (/^\d*$/.test(e.target.value)) setCode(e.target.value);
                  }}
                  placeholder="Enter 6-digit code"
                  className="w-full text-center text-xl font-medium border border-gray-200 rounded-xl p-4 transition-all duration-300 focus:ring-2 focus:ring-teal-300 focus:outline-none"
                />
                <div className="absolute top-4 right-4 text-gray-400">
                  {code.length}/6
                </div>
              </div>
            </motion.div>

            {/* Verify Button with Loading Animation */}
            <motion.div variants={item}>
              <Button 
                onClick={handleVerify} 
                disabled={verifying || code.length !== 6}
                className={cn(
                  "w-full py-6 text-base font-semibold transition-all duration-300 relative overflow-hidden",
                  "bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 text-white"
                )}
              >
                {verifying ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center justify-center"
                  >
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    Verifying...
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    Verify Code
                  </motion.div>
                )}
              </Button>
            </motion.div>

            <motion.div variants={item} className="text-center pt-2">
              <Button 
                onClick={handleResend} 
                disabled={resending || cooldown > 0}
                variant="outline"
                className="w-full py-5 border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                {resending ? (
                  <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                ) : cooldown > 0 ? (
                  `Resend available in ${cooldown}s`
                ) : (
                  "Resend Confirmation"
                )}
              </Button>
            </motion.div>

          </motion.div>
        </Card>
      </motion.div>
    </div>
  );
}