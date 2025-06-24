import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Lock, ShieldAlert, AlertTriangle, LogIn } from "lucide-react";

const Unauthorized = () => {
  // Create pulsing red stars
  const stars = Array.from({ length: 20 }).map((_, i) => ({
    id: i,
    size: Math.random() * 3 + 1,
    x: Math.random() * 100,
    y: Math.random() * 100,
    duration: Math.random() * 1.5 + 0.5,
    delay: Math.random() * 2,
  }));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-br from-[#1a0a0a] via-[#2a0f0f] to-[#3a0a0a] p-4 overflow-hidden relative"
    >
      {/* Pulsing red stars */}
      {stars.map((star) => (
        <motion.div
          key={star.id}
          className="absolute rounded-full bg-red-500"
          style={{
            top: `${star.y}%`,
            left: `${star.x}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            boxShadow: `0 0 ${star.size * 2}px ${star.size / 2}px rgba(239, 68, 68, 0.3)`
          }}
          animate={{ 
            opacity: [0.3, 1, 0.3],
            scale: [1, 1.3, 1]
          }}
          transition={{
            duration: star.duration,
            repeat: Infinity,
            delay: star.delay,
          }}
        />
      ))}

      {/* Floating warning icon */}
      <motion.div
        className="absolute top-1/4 left-1/4 opacity-20"
        animate={{
          rotate: [0, 360],
        }}
        transition={{
          duration: 40,
          repeat: Infinity,
          ease: "linear"
        }}
      >
        <ShieldAlert className="w-24 h-24 text-red-400" />
      </motion.div>

      {/* Floating lock icon */}
      <motion.div
        className="absolute top-1/3 right-1/4 opacity-30"
        animate={{
          rotate: [0, 15, -15, 0],
          y: [0, -20, 0],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <Lock className="w-16 h-16 text-red-300" />
      </motion.div>

      <div className="max-w-3xl w-full text-center relative z-10">
        {/* Animated 403 text with neon glow */}
        <motion.div
          className="relative mb-8"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ 
            type: "spring", 
            stiffness: 300,
            damping: 15,
            delay: 0.2
          }}
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-red-500 to-pink-600 rounded-full blur-xl opacity-20"
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              repeatType: "reverse",
            }}
          />
          
          <motion.h1 
            className="text-9xl md:text-[180px] font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-pink-400 to-red-400"
            animate={{
              backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
              textShadow: [
                "0 0 8px rgba(239, 68, 68, 0.3)",
                "0 0 15px rgba(239, 68, 68, 0.7)",
                "0 0 8px rgba(239, 68, 68, 0.3)"
              ]
            }}
            transition={{
              backgroundPosition: {
                duration: 6,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "linear"
              },
              textShadow: {
                duration: 2,
                repeat: Infinity,
                repeatType: "reverse"
              }
            }}
          >
            4
            <motion.span
              animate={{ 
                scale: [1, 1.4, 1],
                y: [0, -25, 0],
                rotate: [0, 15, -15, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut"
              }}
              className="mx-2"
            >
              0
            </motion.span>
            3
          </motion.h1>
        </motion.div>

        {/* Warning triangle animation */}
        <motion.div
          className="flex justify-center mb-8"
          animate={{ 
            scale: [1, 1.1, 1],
            rotate: [0, 5, -5, 0],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut"
          }}
        >
          <AlertTriangle className="w-24 h-24 text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.6)]" />
        </motion.div>

        {/* Title with neon text effect */}
        <motion.h2
          className="text-3xl md:text-4xl font-bold text-red-400 mb-4 drop-shadow-[0_0_5px_rgba(239,68,68,0.7)]"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          Access Denied!
        </motion.h2>
        
        {/* Description */}
        <motion.p
          className="text-lg text-red-200 mb-10 max-w-lg mx-auto"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          You don't have permission to access this sector. 
          Please authenticate with proper credentials.
        </motion.p>
        
        {/* Login button with red neon glow */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex justify-center w-full"
        >
          <Link to="/auth/login">
            <motion.button
              className="group relative px-8 py-4 rounded-xl bg-gradient-to-r from-red-700 to-pink-800 text-white font-bold shadow-lg overflow-hidden flex items-center gap-3 border border-red-400"
              whileHover={{ 
                scale: 1.05,
                boxShadow: "0 0 15px rgba(239, 68, 68, 0.7)"
              }}
              whileTap={{ scale: 0.95 }}
              animate={{
                boxShadow: [
                  "0 0 5px rgba(239, 68, 68, 0.3)",
                  "0 0 15px rgba(239, 68, 68, 0.7)",
                  "0 0 5px rgba(239, 68, 68, 0.3)"
                ]
              }}
              transition={{
                boxShadow: {
                  duration: 2,
                  repeat: Infinity,
                  repeatType: "reverse"
                }
              }}
            >
              <motion.span className="absolute inset-0 bg-gradient-to-r from-red-800 to-pink-900 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              <motion.span
                animate={{ 
                  rotate: [0, 10, -10, 0],
                  transition: {
                    duration: 1.5,
                    repeat: Infinity
                  }
                }}
              >
                <LogIn className="w-6 h-6 text-red-200" />
              </motion.span>
              
              <span className="relative text-red-100">
                Go to Login
              </span>
              
              <motion.div
                animate={{ 
                  x: [0, 5, 0],
                  transition: {
                    duration: 1,
                    repeat: Infinity
                  }
                }}
              >
                <Lock className="w-5 h-5 text-red-300" />
              </motion.div>
            </motion.button>
          </Link>
        </motion.div>
      </div>

      {/* Red laser shooting stars */}
      <motion.div
        className="absolute top-20 left-0 w-1 h-1 bg-red-500 rounded-full"
        animate={{
          x: [0, window.innerWidth],
          y: [0, window.innerHeight/2],
          opacity: [1, 0]
        }}
        transition={{
          duration: 1.2,
          repeat: Infinity,
          repeatDelay: 4,
          ease: "easeOut"
        }}
        style={{
          boxShadow: "0 0 10px 2px rgba(239, 68, 68, 0.8)"
        }}
      />
      
      <motion.div
        className="absolute top-40 right-0 w-1 h-1 bg-pink-500 rounded-full"
        animate={{
          x: [0, -window.innerWidth],
          y: [0, window.innerHeight/3],
          opacity: [1, 0]
        }}
        transition={{
          duration: 1,
          repeat: Infinity,
          repeatDelay: 6,
          ease: "easeOut"
        }}
        style={{
          boxShadow: "0 0 10px 2px rgba(236, 72, 153, 0.8)"
        }}
      />

      {/* Pulsing red border warning */}
      <motion.div
        className="absolute inset-4 border-2 border-red-500 rounded-lg pointer-events-none"
        animate={{
          opacity: [0.1, 0.3, 0.1],
          scale: [1, 1.005, 1]
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          repeatType: "reverse"
        }}
        style={{
          boxShadow: "0 0 20px rgba(239, 68, 68, 0.3)"
        }}
      />
    </motion.div>
  );
};

export default Unauthorized;