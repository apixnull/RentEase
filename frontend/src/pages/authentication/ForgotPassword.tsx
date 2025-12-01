import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, Zap, CheckCircle, Loader2, Lock } from "lucide-react";
import { motion, type Variants } from "framer-motion";
import { forgotPasswordRequest } from "@/api/authApi";
import { toast } from "sonner";

const ForgotPassword = () => {
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
                Reset Your Password
              </h2>
              <p className="text-emerald-50 text-base leading-relaxed max-w-sm mx-auto">
                Don't worry! We'll send you a secure link to reset your password and get you back into your account.
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
            <ForgotPasswordForm />
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

const ForgotPasswordForm = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    try {
      const res = await forgotPasswordRequest({ email });
      toast.success(res.data.message || "Check your email for the reset link");
      setSubmitted(true);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Something went wrong");
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
          Check your email
        </h2>
        <p className="text-gray-600 mb-6">
          We've sent a password reset link to <strong>{email}</strong>
        </p>
        <p className="text-sm text-gray-500 mb-6">
          If you don't see the email, check your spam folder.
        </p>
        <div className="text-center text-sm text-gray-500">
          Remember your password?{" "}
          <Link
            to="/auth/login"
            className="text-emerald-600 hover:text-emerald-800 font-medium"
          >
            Sign in
          </Link>
        </div>
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
          Forgot Password?
        </h1>
        <p className="text-gray-500 text-sm">
          Enter your email and we'll send you a reset link
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-5">
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Email Address
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@example.com"
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all text-sm shadow-sm"
            />
          </div>
        </div>

        <motion.button
          type="submit"
          disabled={loading}
          whileHover={loading ? {} : { scale: 1.02 }}
          whileTap={loading ? {} : { scale: 0.98 }}
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
                <span>Sending...</span>
              </>
            ) : (
              <>
                <Mail className="h-4 w-4" />
                <span>Send Reset Link</span>
              </>
            )}
          </span>
        </motion.button>

        <div className="text-center text-xs text-gray-500 pt-2">
          Remember your password?{" "}
          <Link
            to="/auth/login"
            className="text-emerald-600 hover:text-emerald-800 font-medium"
          >
            Sign in
          </Link>
        </div>
      </form>
    </>
  );
};

export default ForgotPassword;