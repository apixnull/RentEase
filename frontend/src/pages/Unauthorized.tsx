import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Zap, ShieldAlert } from "lucide-react";

const Unauthorized = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-br from-[#ffe5e5] to-[#ffcccc] p-4"
    >
      <div className="max-w-3xl w-full text-center">
        {/* Animated 401 text */}
        <motion.div
          className="relative mb-8"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 15,
            delay: 0.2,
          }}
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-red-500 to-pink-600 rounded-full blur-xl opacity-30"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              repeatType: "reverse",
            }}
          />

          <motion.h1
            className="text-9xl md:text-[160px] font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-pink-600 to-red-600"
            animate={{
              backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
            }}
            transition={{
              backgroundPosition: {
                duration: 6,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "linear",
              },
            }}
          >
            4
            <motion.span
              animate={{
                scale: [1, 1.3, 1],
                y: [0, -25, 0],
                rotate: [0, 10, -10, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut",
              }}
              className="mx-2"
            >
              0
            </motion.span>
            1
          </motion.h1>
        </motion.div>

        {/* Title */}
        <motion.h2
          className="text-3xl md:text-4xl font-bold text-red-800 mb-4"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          Unauthorized Access
        </motion.h2>

        {/* Description */}
        <motion.p
          className="text-lg text-red-700 mb-10 max-w-lg mx-auto"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          You don't have permission to view this page. Please login with proper credentials or contact support.
        </motion.p>

        {/* Back to login/home */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <Link to="/login">
            <motion.button
              className="group relative px-8 py-3 rounded-full bg-gradient-to-r from-red-500 to-pink-600 text-white font-semibold shadow-lg overflow-hidden"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.span className="absolute inset-0 bg-gradient-to-r from-red-600 to-pink-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <span className="relative flex items-center gap-2">
                <ShieldAlert className="w-5 h-5" />
                Go to Login
              </span>
            </motion.button>
          </Link>
        </motion.div>

        {/* Floating icons */}
        <motion.div
          className="absolute bottom-10 left-10 opacity-20"
          animate={{ y: [0, -20, 0] }}
          transition={{ duration: 4, repeat: Infinity, repeatType: "reverse" }}
        >
          <Zap className="w-16 h-16 text-red-500" />
        </motion.div>

        <motion.div
          className="absolute top-1/3 right-10 opacity-20"
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        >
          <Zap className="w-24 h-24 text-pink-500" />
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Unauthorized;
