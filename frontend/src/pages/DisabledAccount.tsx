import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Lock, ShieldBan, AlertTriangle, Mail, Home } from "lucide-react";

const DisabledAccount = () => {
  // Create twinkling stars with reddish hue
  const stars = Array.from({ length: 30 }).map((_, i) => ({
    id: i,
    size: Math.random() * 3 + 1,
    x: Math.random() * 100,
    y: Math.random() * 100,
    duration: Math.random() * 2 + 1,
    delay: Math.random() * 2,
    color: `rgba(${Math.floor(180 + Math.random() * 75)}, ${Math.floor(
      Math.random() * 50
    )}, ${Math.floor(Math.random() * 50)}, 1)`,
  }));

  // Create warning icons floating around
  const warningIcons = Array.from({ length: 8 }).map((_, i) => ({
    id: i,
    size: Math.random() * 40 + 20,
    x: Math.random() * 80 + 10,
    y: Math.random() * 80 + 10,
    rotation: Math.random() * 360,
    duration: Math.random() * 15 + 10,
  }));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-br from-[#1c0a0a] via-[#1a0f1f] to-[#2c0e1e] p-4 overflow-hidden relative"
    >
      {/* Twinkling stars with reddish hue */}
      {stars.map((star) => (
        <motion.div
          key={star.id}
          className="absolute rounded-full"
          style={{
            top: `${star.y}%`,
            left: `${star.x}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            backgroundColor: star.color,
          }}
          animate={{ opacity: [0.2, 1, 0.2], scale: [1, 1.2, 1] }}
          transition={{
            duration: star.duration,
            repeat: Infinity,
            delay: star.delay,
          }}
        />
      ))}

      {/* Floating warning icons */}
      {warningIcons.map((icon) => (
        <motion.div
          key={icon.id}
          className="absolute text-red-500/20"
          style={{
            top: `${icon.y}%`,
            left: `${icon.x}%`,
          }}
          animate={{
            rotate: [icon.rotation, icon.rotation + 360],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: icon.duration,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          <AlertTriangle className="w-10 h-10" />
        </motion.div>
      ))}

      {/* Central lock icon */}
      <motion.div
        className="absolute top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-10"
        animate={{
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <Lock className="w-64 h-64 text-red-500" />
      </motion.div>

      <div className="max-w-3xl w-full text-center relative z-10">
        {/* Animated banned text */}
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
            className="absolute inset-0 bg-gradient-to-r from-red-500 to-orange-600 rounded-full blur-xl opacity-30"
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
            className="text-6xl md:text-8xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-orange-400 to-red-400 mb-4"
            animate={{
              backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
            }}
            transition={{
              backgroundPosition: {
                duration: 6,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "linear"
              }
            }}
          >
            ACCOUNT DISABLED
          </motion.h1>
        </motion.div>

        {/* Shield icon animation */}
        <motion.div
          className="flex justify-center mb-8"
          animate={{ 
            rotate: [0, 5, -5, 0],
            y: [0, -10, 0]
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut"
          }}
        >
          <ShieldBan className="w-24 h-24 text-red-500" />
        </motion.div>

        {/* Title */}
        <motion.h2
          className="text-3xl md:text-4xl font-bold text-white mb-6"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          Violation of Terms Detected
        </motion.h2>
        
        {/* Description */}
        <motion.div
          className="text-lg text-orange-100 mb-10 max-w-2xl mx-auto bg-red-900/30 backdrop-blur-sm p-6 rounded-xl border border-red-800/50"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <p className="mb-4">
            Our system has detected severe violations of our Terms of Service and Community Guidelines from your account.
          </p>
          
          <div className="text-left max-w-md mx-auto">
            <p className="flex items-start gap-3 mb-3">
              <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-1" />
              <span>Malicious activity or attempts to compromise system security</span>
            </p>
            <p className="flex items-start gap-3 mb-3">
              <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-1" />
              <span>Repeated harassment or abusive behavior towards other users</span>
            </p>
            <p className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-1" />
              <span>Distribution of prohibited content or illegal activities</span>
            </p>
          </div>
          
          <p className="mt-6">
            This decision is final and your account will remain permanently disabled.
          </p>
        </motion.div>
        
        {/* Contact button */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex flex-col sm:flex-row justify-center gap-4 w-full"
        >
          <Link to="/contact">
            <motion.button
              className="group relative px-6 py-3 rounded-xl bg-gradient-to-r from-orange-600 to-red-700 text-white font-medium shadow-lg overflow-hidden flex items-center gap-3"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.span className="absolute inset-0 bg-gradient-to-r from-orange-700 to-red-800 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              <motion.span
                animate={{ 
                  rotate: [0, 10, -10, 0],
                  transition: {
                    duration: 1.5,
                    repeat: Infinity
                  }
                }}
              >
                <Mail className="w-5 h-5" />
              </motion.span>
              
              <span className="relative">
                Contact Support
              </span>
            </motion.button>
          </Link>
          
          <Link to="/">
            <motion.button
              className="group relative px-6 py-3 rounded-xl bg-gray-800/50 text-gray-200 font-medium shadow-lg overflow-hidden flex items-center gap-3 border border-gray-700"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.span className="absolute inset-0 bg-gray-700/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              <motion.span
                animate={{ 
                  rotate: [0, 10, -10, 0],
                  transition: {
                    duration: 1.5,
                    repeat: Infinity
                  }
                }}
              >
                <Home className="w-5 h-5" />
              </motion.span>
              
              <span className="relative">
                Return to Homepage
              </span>
            </motion.button>
          </Link>
        </motion.div>
      </div>

      {/* Shooting stars */}
      <motion.div
        className="absolute top-20 left-0 w-2 h-2 bg-red-400 rounded-full"
        animate={{
          x: [0, window.innerWidth],
          y: [0, window.innerHeight/2],
          opacity: [1, 0]
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          repeatDelay: 5,
          ease: "easeOut"
        }}
      />
      
      <motion.div
        className="absolute top-40 right-0 w-1 h-1 bg-orange-300 rounded-full"
        animate={{
          x: [0, -window.innerWidth],
          y: [0, window.innerHeight/3],
          opacity: [1, 0]
        }}
        transition={{
          duration: 1.2,
          repeat: Infinity,
          repeatDelay: 7,
          ease: "easeOut"
        }}
      />
      
      {/* Policy reminder at bottom */}
      <motion.div
        className="absolute bottom-6 left-0 right-0 text-center text-red-300/50 text-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        All user activities are monitored to ensure compliance with our Terms of Service
      </motion.div>
    </motion.div>
  );
};

export default DisabledAccount;