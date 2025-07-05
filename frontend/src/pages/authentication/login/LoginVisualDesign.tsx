import { motion } from "framer-motion";
import { Zap, Check } from "lucide-react";

const LoginVisualDesign = () => {
  return (
    <>
    {/* Updated Right Panel - Modern Visual Design */}
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 relative hidden lg:block overflow-hidden">
          {/* Floating Shapes */}
          <motion.div
            className="absolute top-1/4 left-1/4 w-40 h-40 rounded-full bg-blue-400/20 backdrop-blur-md"
            animate={{
              y: [0, -30, 0],
              scale: [1, 1.05, 1]
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          
          <motion.div
            className="absolute top-1/3 right-1/3 w-24 h-24 rotate-45 bg-white/15 backdrop-blur-sm border border-white/20"
            animate={{
              rotate: [45, 90, 45],
              x: [0, 20, 0]
            }}
            transition={{
              duration: 12,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          
          <motion.div
            className="absolute bottom-1/4 left-1/3 w-36 h-36 rounded-lg bg-indigo-400/20 backdrop-blur-md"
            animate={{
              y: [0, 40, 0],
              borderRadius: ["20%", "30%", "20%"]
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          
          <motion.div
            className="absolute bottom-1/3 right-1/4 w-20 h-20 rounded-full bg-blue-300/20 backdrop-blur-sm"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3]
            }}
            transition={{
              duration: 7,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />

          {/* Center Content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-10 z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="max-w-md"
            >
              <div className="mb-6 inline-flex items-center justify-center rounded-full bg-white/10 p-4 backdrop-blur-sm">
                <Zap className="h-12 w-12 text-white" fill="currentColor" />
              </div>
              
              <motion.h2 
                className="text-4xl font-bold text-white mb-4"
                animate={{
                  textShadow: [
                    "0 0 0px rgba(255,255,255,0.3)",
                    "0 0 12px rgba(255,255,255,0.5)",
                    "0 0 0px rgba(255,255,255,0.3)"
                  ]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity
                }}
              >
                Welcome Back to RentEase
              </motion.h2>
              
              <motion.p
                className="text-xl text-white/90 mb-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                Continue your rental journey with seamless access
              </motion.p>
              
              <motion.div
                className="flex flex-col gap-3 text-white/80 text-left max-w-xs mx-auto"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
              >
                <div className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-blue-300" />
                  <span>Manage your properties</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-blue-300" />
                  <span>Track your applications</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-blue-300" />
                  <span>Connect with verified users</span>
                </div>
              </motion.div>
            </motion.div>
          </div>

          {/* Animated Grid Pattern */}
          <div className="absolute inset-0 opacity-20">
            <svg
              className="absolute inset-0 h-full w-full"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <pattern
                  id="grid-pattern"
                  width="40"
                  height="40"
                  patternUnits="userSpaceOnUse"
                >
                  <path
                    d="M 40 0 L 0 0 0 40"
                    fill="none"
                    stroke="white"
                    strokeWidth="0.5"
                  />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid-pattern)" />
            </svg>
          </div>

          {/* Subtle Particles */}
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full bg-white/30"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                width: `${Math.random() * 10 + 2}px`,
                height: `${Math.random() * 10 + 2}px`,
              }}
              animate={{
                y: [0, (Math.random() - 0.5) * 60, 0],
                x: [0, (Math.random() - 0.5) * 60, 0],
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{
                duration: Math.random() * 5 + 5,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div></>
  )
}

export default LoginVisualDesign