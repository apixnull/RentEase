import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Zap, Mail, Lock, Eye, EyeOff, User, Check, Key, AlertCircle, Home, Building2, MapPin, Loader2 } from "lucide-react";
import { motion, type Variants } from "framer-motion";
import { registerRequest } from "@/api/authApi"; 
import { toast } from "sonner";

const Register = () => {
  // Background animation variants
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        when: "beforeChildren",
      },
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
        className="max-w-5xl w-full bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row items-stretch z-10 min-h-[650px]"
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
            className="relative z-10"
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
              <h2 className="text-2xl md:text-3xl font-bold mb-3">
                Get Started Today!
              </h2>
              <p className="text-emerald-50 text-base leading-relaxed max-w-sm mx-auto">
                Join RentEase and start your journey to find or manage rentals in Cebu Province
              </p>
            </div>

            <div className="space-y-4 max-w-xs mx-auto">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="flex items-center gap-4 p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 hover:bg-white/20 transition-all"
              >
                <div className="p-3 bg-white/20 rounded-lg">
                  <Home className="h-6 w-6 text-yellow-300" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm">For Tenants</p>
                  <p className="text-xs text-emerald-100">Everything is free - browse and find your perfect rental</p>
                </div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="flex items-center gap-4 p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 hover:bg-white/20 transition-all"
              >
                <div className="p-3 bg-white/20 rounded-lg">
                  <Building2 className="h-6 w-6 text-yellow-300" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm">For Landlords</p>
                  <p className="text-xs text-emerald-100">Manage properties and tenants with powerful tools</p>
                </div>
              </motion.div>
            </div>

            <div className="mt-8 text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
                <MapPin className="h-4 w-4 text-yellow-300" />
                <span className="text-xs text-emerald-50">Cebu Province Focus</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right Panel - Form Section */}
        <div className="md:w-[55%] p-6 md:p-8 flex flex-col">
          <div className="flex justify-between items-center mb-6">
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
            className="flex-1 flex flex-col justify-center"
          >
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-100 to-sky-100 rounded-2xl mb-5 shadow-md">
                <div className="bg-gradient-to-br from-emerald-600 to-sky-600 p-3 rounded-xl">
                  <User className="h-6 w-6 text-white" />
                </div>
              </div>
              <h1 className="text-2xl font-bold text-gray-800 mb-1">
                Create Account
              </h1>
              <p className="text-gray-500 text-sm">
                Sign up to get started with RentEase
              </p>
            </div>

            <RegisterForm />
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

const RegisterForm = () => {
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [userRole, setUserRole] = useState<"tenant" | "landlord">("tenant");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!email || !password || !confirmPassword) {
      setError("All fields are required");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const res = await registerRequest({
        email,
        password,
        confirmPassword,
        role: userRole.toUpperCase(),
      });

      // success toast
      toast.success(res.data.message);

      // redirect to verification page, passing the token in url
      navigate(`/auth/verify-email/${res.data.token}`);
      
    } catch (err: any) {
      console.error("Register error:", err);
      const errorMessage = err.response?.data?.message || "Registration failed";
      setError(errorMessage);
      toast.error("Registration Failed, review the form!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto w-full">
      <form className="space-y-4" onSubmit={handleSubmit}>
        {/* Role Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            I am a <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-3">
            <motion.button
              type="button"
              onClick={() => setUserRole("tenant")}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`flex-1 py-2 px-3 rounded-lg border transition-colors flex items-center justify-center gap-2 text-sm ${
                userRole === "tenant"
                  ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                  : "border-gray-300 text-gray-500 hover:border-emerald-300"
              }`}
            >
              <User className="h-4 w-4" />
              Tenant
            </motion.button>
            <motion.button
              type="button"
              onClick={() => setUserRole("landlord")}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`flex-1 py-2 px-3 rounded-lg border transition-colors flex items-center justify-center gap-2 text-sm ${
                userRole === "landlord"
                  ? "border-sky-500 bg-sky-50 text-sky-700"
                  : "border-gray-300 text-gray-500 hover:border-sky-300"
              }`}
            >
              <Key className="h-4 w-4" />
              Landlord
            </motion.button>
          </div>
        </div>

        {/* Email field */}
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Email Address <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="h-4 w-4 text-gray-400" />
            </div>
            <input
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@example.com"
              required
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg 
              focus:outline-none focus:border-emerald-400 focus:ring-0 
              transition-colors text-sm"
            />
          </div>
        </div>

        {/* Password field */}
        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Password <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-4 w-4 text-gray-400" />
            </div>
            <input
              name="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg 
              focus:outline-none focus:border-emerald-400 focus:ring-0 
              transition-colors text-sm"
            />
          </div>
          <div className="mt-1 text-xs text-gray-500">
            Password must include uppercase, lowercase, number, and symbol
          </div>
        </div>

        {/* Confirm Password field */}
        <div>
          <label
            htmlFor="confirmPassword"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Confirm Password <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-4 w-4 text-gray-400" />
            </div>
            <input
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg 
              focus:outline-none focus:border-emerald-400 focus:ring-0 
              transition-colors text-sm"
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? (
                <EyeOff className="h-4 w-4 text-gray-400" />
              ) : (
                <Eye className="h-4 w-4 text-gray-400" />
              )}
            </button>
          </div>
        </div>

        {/* Terms and Conditions */}
        <div className="flex items-start gap-3">
          <motion.button
            type="button"
            onClick={() => setAcceptedTerms(!acceptedTerms)}
            whileTap={{ scale: 0.9 }}
            className={`mt-0.5 flex h-4 w-4 items-center justify-center rounded border transition-colors ${
              acceptedTerms
                ? "bg-emerald-500 border-emerald-500 text-white"
                : "border-gray-300"
            }`}
          >
            {acceptedTerms && <Check className="h-3 w-3" />}
          </motion.button>
          <label htmlFor="terms" className="text-xs text-gray-600">
            I agree to the{" "}
            <Link
              to="/terms-privacy"
              className="text-emerald-600 hover:text-emerald-800 font-medium underline"
            >
              Terms of Service and Privacy Policy
            </Link>{" "}
            <span className="text-red-500">*</span>
          </label>
        </div>

        {/* Error message container with fixed height */}
        <div className="min-h-[60px] max-h-24 overflow-y-auto transition-all duration-300">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-600 break-words">{error}</p>
            </div>
          )}
        </div>

        {/* Submit button */}
        <motion.button
          type="submit"
          disabled={!acceptedTerms || loading}
          whileHover={acceptedTerms && !loading ? { scale: 1.02 } : {}}
          whileTap={acceptedTerms && !loading ? { scale: 0.98 } : {}}
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
                <span>Creating Account...</span>
              </>
            ) : (
              <>
                <User className="h-4 w-4" />
                <span>Create Account</span>
              </>
            )}
          </span>
        </motion.button>

        <div className="text-center text-xs text-gray-500 pt-3">
          Already have an account?{" "}
          <Link
            to="/auth/login"
            className="text-emerald-600 hover:text-emerald-800 font-medium"
          >
            Sign in
          </Link>
        </div>
      </form>
    </div>
  );
};

export default Register;