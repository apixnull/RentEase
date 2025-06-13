import { useState } from "react"
import { useSearchParams, Link } from "react-router-dom";
import { Eye, EyeOff, Lock, Zap } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import Footer from "@/components/public/Footer";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      // Simulate backend call
      await new Promise((res) => setTimeout(res, 1500));
      console.log("Token:", token);
      console.log("New password:", password);
      // Redirect to login or show success message
    } catch (e) {
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
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
              onSubmit={handleReset}
              className="flex flex-col gap-6 w-full max-w-xs"
            >
              <div className="flex flex-col items-center gap-2 text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-teal-500 to-blue-500 p-2 shadow-lg">
                  <Lock className="h-6 w-6 text-white" />
                </div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent">
                  Reset Your Password
                </h1>
                <p className="text-muted-foreground text-sm">
                  Choose a new password to secure your account.
                </p>
              </div>

              <div className="grid gap-4">
                <div>
                  <Label htmlFor="password">New Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="pl-10 pr-10"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      <Lock className="h-4 w-4" />
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="confirm-password">Confirm Password</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="pl-10"
                  />
                </div>

                {error && <p className="text-sm text-red-600">{error}</p>}

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-teal-600 to-blue-600 text-white shadow-lg hover:shadow-teal-500/20"
                  disabled={loading}
                >
                  {loading ? (
                    <div className="h-5 w-5 rounded-full border-2 border-white border-t-transparent animate-spin mx-auto" />
                  ) : (
                    "Reset Password"
                  )}
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
            <h2 className="text-3xl font-bold mb-3">
              Protect Your Account
            </h2>
            <p className="text-lg max-w-md">
              Set a strong password to help keep your RentEase experience secure and worry-free.
            </p>
          </motion.div>
        </div>
      </div>
      <Footer />
    </>
  );
}
