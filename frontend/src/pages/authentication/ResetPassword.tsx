import { useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { Lock, Eye, EyeOff, Check, Zap, CheckCircle, Loader2 } from "lucide-react";
import { motion, type Variants } from "framer-motion";
import { resetPasswordRequest } from "@/api/authApi";
import { toast } from "sonner";

const ResetPassword = () => {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.12, when: "beforeChildren" },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-sky-100/40 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Static Background Blobs */}
      <div className="absolute inset-0 overflow-hidden z-0">
        {/* Static blobs - more visible, less blurred */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-sky-300/70 rounded-full blur-2xl"></div>
        <div className="absolute top-40 right-20 w-96 h-96 bg-emerald-300/70 rounded-full blur-2xl"></div>
        <div className="absolute bottom-20 left-1/4 w-80 h-80 bg-sky-400/65 rounded-full blur-2xl"></div>
        <div className="absolute bottom-40 right-1/3 w-64 h-64 bg-emerald-400/65 rounded-full blur-2xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-sky-200/55 rounded-full blur-2xl"></div>
      </div>

      <motion.div
        className="max-w-5xl w-full bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row items-stretch z-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Left Panel - Visual Design */}
        <div className="hidden md:flex md:w-[45%] bg-gradient-to-br from-emerald-600 via-sky-500 to-emerald-600 p-8 text-white flex-col justify-center relative overflow-hidden">
          {/* Static background elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
            <div className="absolute bottom-1/3 right-1/4 w-48 h-48 bg-white/5 rounded-full blur-3xl"></div>
          </div>

          {/* Decorative geometric shapes */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-3xl"></div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="relative z-10 text-center"
          >
            <div className="flex items-center justify-center gap-2 mb-8">
              <motion.div
                animate={{
                  rotate: [0, 10, -10, 5, 0],
                  scale: [1, 1.1, 1.05, 1.08, 1],
                  transition: {
                    duration: 1.5,
                    repeat: Infinity,
                    repeatType: "reverse" as const,
                  },
                }}
              >
                <Zap
                  className="h-12 w-12 text-emerald-200"
                  fill="currentColor"
                />
              </motion.div>
              <span className="text-3xl font-extrabold text-white drop-shadow-lg">
                RentEase
              </span>
            </div>

            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl mb-5">
                <Lock className="h-8 w-8 text-yellow-300" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold mb-3">
                Set New Password
              </h2>
              <p className="text-emerald-50 text-base leading-relaxed max-w-sm mx-auto">
                Create a strong, secure password to protect your account. Make sure it's unique and memorable.
              </p>
            </div>
          </motion.div>
        </div>

        {/* Right Panel - Form Section */}
        <div className="md:w-[55%] p-6 md:p-8 flex flex-col justify-between">
          <div className="flex justify-between items-center mb-8">
            <Link
              to="/"
              className="flex items-center gap-2 text-sm text-gray-500 hover:text-emerald-600 transition-colors"
            >
              <motion.div
                whileHover={{
                  rotate: [0, -10, 10, 0],
                  transition: { duration: 0.4 },
                }}
              >
                <Zap className="h-5 w-5 text-emerald-500" fill="currentColor" />
              </motion.div>
              Back to home
            </Link>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-md mx-auto w-full"
          >
            <ResetPasswordForm />
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

const ResetPasswordForm = () => {
  const { token } = useParams<{ token?: string }>();
  
  const [newPassword, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const passwordPolicy = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
  const passwordOk = passwordPolicy.test(newPassword);
  const match = newPassword.length > 0 && newPassword === confirmPassword;

  // 🔒 Redirect if token is missing or empty
  if (!token || token.trim() === "") {
    return <Navigate to="*" replace />;
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordOk || !match || !token) return;

    setLoading(true);
    try {
      await resetPasswordRequest({ token, newPassword, confirmPassword });
      toast.success("Password reset successfully!");
      setSubmitted(true);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-8"
      >
        <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-50 rounded-full mb-6">
          <CheckCircle className="h-8 w-8 text-emerald-600" />
        </div>
        <h2 className="text-xl font-semibold text-gray-800 mb-2">
          Password Reset Successfully
        </h2>
        <p className="text-gray-600 mb-6">
          Your password has been updated. You can now sign in with your new password.
        </p>
        <Link
          to="/auth/login"
          className="inline-flex items-center justify-center w-full bg-gradient-to-r from-emerald-600 to-sky-600 text-white py-3.5 px-4 rounded-xl font-semibold transition-all shadow-md hover:shadow-lg"
        >
          Sign In Now
        </Link>
      </motion.div>
    );
  }

  return (
    <>
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-100 to-sky-100 rounded-2xl mb-5 shadow-md">
          <div className="bg-gradient-to-br from-emerald-600 to-sky-600 p-3 rounded-xl">
            <Lock className="h-6 w-6 text-white" />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mb-1">
          Set New Password
        </h1>
        <p className="text-gray-500 text-sm">
          Enter and confirm your new password below
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-5">
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
            New Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="password"
              name="password"
              type="password"
              required
              value={newPassword}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all text-sm shadow-sm"
            />
          </div>
          <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
            <Check className={`h-3.5 w-3.5 ${passwordOk ? "text-green-600" : "text-gray-300"}`} />
            At least 8 characters with uppercase, lowercase, digit and special character
          </div>
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
            Confirm New Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all text-sm shadow-sm"
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
          {confirmPassword.length > 0 && (
            <div className={`mt-2 text-xs ${match ? "text-green-600" : "text-red-600"}`}>
              {match ? "Passwords match" : "Passwords do not match"}
            </div>
          )}
        </div>

        <motion.button
          type="submit"
          disabled={!passwordOk || !match || loading}
          whileHover={!passwordOk || !match || loading ? {} : { scale: 1.02 }}
          whileTap={!passwordOk || !match || loading ? {} : { scale: 0.98 }}
          className="w-full bg-gradient-to-r from-emerald-600 to-sky-600 text-white py-3.5 px-4 rounded-xl font-semibold transition-all shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:shadow-md flex items-center justify-center gap-2 relative overflow-hidden"
        >
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 bg-gradient-to-r from-emerald-700 to-sky-700"
            />
          )}
          <span className="relative z-10 flex items-center gap-2">
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Updating...</span>
              </>
            ) : (
              <>
                <Lock className="h-4 w-4" />
                <span>Set New Password</span>
              </>
            )}
          </span>
        </motion.button>

        <div className="text-center text-xs text-gray-500 pt-2">
          Return to{" "}
          <Link to="/auth/login" className="text-emerald-600 hover:text-emerald-800 font-medium">
            Sign in
          </Link>
        </div>
      </form>
    </>
  );
};

export default ResetPassword;