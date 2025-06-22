import {Check } from "lucide-react";
import { Link } from "react-router-dom";
import { Zap } from "lucide-react";
import Footer from "@/components/public/Footer";
import { motion } from "framer-motion";
import { RegisterForm } from "./RegisterForm";



export const Register = () => {
  return (
    <>
      <div className="grid min-h-svh lg:grid-cols-2">
        {/* Left Panel - Form Section */}
        <div className="flex flex-col gap-4 p-6 md:p-10 bg-gradient-to-br from-white to-gray-50">
          {/* Logo */}
          <div className="flex justify-center md:justify-start">
            <Link to={"/"} className="flex items-center gap-2 font-medium">
              <div className="relative">
                <div className="absolute inset-0 bg-teal-500/20 rounded-full blur-sm" />
                <Zap className="size-6 text-teal-500" fill="currentColor" />
              </div>
              <span
                className="text-lg font-extrabold bg-gradient-to-r from-teal-600 via-blue-600 to-teal-600 
                bg-[length:300%_auto] bg-clip-text text-transparent"
              >
                RentEase
              </span>
            </Link>
          </div>

          {/* Form Container */}
          <motion.div
            className="flex-1 flex items-center justify-center"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{
              type: "spring",
              stiffness: 100,
              damping: 15,
              delay: 0.1,
            }}
          >
            <div className="w-full max-w-xs">
              <RegisterForm />
            </div>
          </motion.div>
        </div>

        {/* Updated Right Panel - Modern Geometric Visual */}
        <div className="bg-gradient-to-br from-teal-600 to-blue-700 relative hidden lg:block overflow-hidden">
          {/* Floating Shapes */}
          <motion.div
            className="absolute top-1/4 left-1/4 w-48 h-48 rounded-full bg-teal-400/20 backdrop-blur-md"
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
            className="absolute top-1/3 right-1/3 w-32 h-32 rotate-45 bg-white/10 backdrop-blur-sm border border-white/20"
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
            className="absolute bottom-1/4 left-1/3 w-40 h-40 rounded-lg bg-blue-400/15 backdrop-blur-md"
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
            className="absolute bottom-1/3 right-1/4 w-24 h-24 rounded-full bg-teal-300/20 backdrop-blur-sm"
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
                Join RentEase Community
              </motion.h2>
              
              <motion.p
                className="text-xl text-white/90 mb-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                Discover the perfect rental experience with our powerful platform
              </motion.p>
              
              <motion.div
                className="flex flex-col gap-3 text-white/80 text-left max-w-xs mx-auto"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
              >
                <div className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-teal-300" />
                  <span>Instant property listings</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-teal-300" />
                  <span>Secure payment system</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-teal-300" />
                  <span>Verified users & properties</span>
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
        </div>
      </div>
      <Footer />
    </>
  );
};