import { useState } from "react";
import { Link } from "react-router-dom";
import { Zap, ShieldCheck } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import Footer from "@/components/public/Footer";

export default function VerifyOtp() {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (otp.length !== 6) {
      setError("OTP must be 6 digits.");
      return;
    }

    setLoading(true);
    try {
      // Simulate verification
      await new Promise((res) => setTimeout(res, 1200));
      console.log("Verifying OTP:", otp);
      // redirect to dashboard or password reset
    } catch {
      setError("Invalid OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      await new Promise((res) => setTimeout(res, 1000));
      console.log("Resending OTP...");
    } finally {
      setResending(false);
    }
  };

  return (
    <>
      <div className="grid min-h-svh lg:grid-cols-2">
        {/* Left Panel */}
        <div className="flex flex-col gap-4 p-6 md:p-10 bg-gradient-to-br from-white to-gray-50">
          <div className="flex justify-center md:justify-start">
            <Link to={"/"} className="flex items-center gap-2 font-medium">
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
            <form
              onSubmit={handleSubmit}
              className="flex flex-col gap-6 w-full max-w-xs"
            >
              <div className="flex flex-col items-center gap-2 text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-teal-500 to-blue-500 p-2 shadow-lg">
                  <ShieldCheck className="h-6 w-6 text-white" />
                </div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent">
                  Verify Your Email
                </h1>
                <p className="text-muted-foreground text-sm">
                  Enter the 6-digit code we sent to your email.
                </p>
              </div>

              <div className="grid gap-4">
                <div>
                  <Label htmlFor="otp">Verification Code</Label>
                  <Input
                    id="otp"
                    type="text"
                    inputMode="numeric"
                    pattern="\d{6}"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                    required
                  />
                </div>

                {error && <p className="text-sm text-red-600">{error}</p>}

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-teal-600 to-blue-600 text-white shadow-lg"
                >
                  {loading ? (
                    <div className="h-5 w-5 rounded-full border-2 border-white border-t-transparent animate-spin mx-auto" />
                  ) : (
                    "Verify Code"
                  )}
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleResend}
                  disabled={resending}
                  className="text-muted-foreground hover:text-teal-600 text-sm"
                >
                  {resending ? "Sending..." : "Resend Code"}
                </Button>
              </div>
            </form>
          </motion.div>
        </div>

        {/* Right Panel */}
        <div className="bg-muted relative hidden lg:block overflow-hidden">
          <motion.div className="absolute inset-0" animate={{ opacity: 1 }} transition={{ duration: 0.8 }}>
            <motion.div
              className="absolute top-1/3 -left-1/4 w-[150%] h-[70%] bg-gradient-to-br from-teal-400/30 to-blue-600/40 rounded-full"
              animate={{
                borderRadius: [
                  "60% 40% 30% 70%/60% 30% 70% 40%",
                  "50% 50% 70% 30%/40% 60% 40% 60%",
                  "60% 40% 30% 70%/60% 30% 70% 40%",
                ],
                x: ["0%", "10%", "0%"],
                rotate: [0, 5, 0],
              }}
              transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
            />
          </motion.div>

          <img
            src="/bg.jpg"
            alt="Background"
            className="absolute inset-0 h-full w-full object-cover -z-10"
          />

          <motion.div
            className="absolute bottom-10 left-10 right-10 text-white"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7, duration: 0.7 }}
          >
            <h2 className="text-3xl font-bold mb-3">Secure Verification</h2>
            <p className="text-lg max-w-md">
              RentEase protects your account by verifying your identity before continuing.
            </p>
          </motion.div>
        </div>
      </div>
      <Footer />
    </>
  );
}
