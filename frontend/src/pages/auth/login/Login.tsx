import { Home } from "lucide-react";
import LoginForm from "@/pages/auth/login/LoginForm";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function Login() {
  const navigate = useNavigate();

  return (
    <div className="min-h-svh grid lg:grid-cols-2 bg-gradient-to-br from-gray-50 to-gray-100 overflow-x-hidden">
      {/* Right Column - Login Form with Left-to-Right Animation */}
      <motion.div 
        className="flex flex-col gap-6 p-6 md:p-12"
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ 
          duration: 0.8, 
          ease: "easeOut",
          delay: 0.2
        }}
      >
        {/* Enhanced RentEase Logo */}
        <motion.div 
          className="flex justify-start"
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <div 
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => navigate("/")}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-teal-500 to-blue-600 text-white">
              <Home size={24} />
            </div>
            <span className="text-2xl font-extrabold bg-gradient-to-r from-teal-600 to-blue-700 bg-clip-text text-transparent">
              RentEase
            </span>
          </div>
        </motion.div>
        
        {/* Form Container with Staggered Animation */}
        <div className="flex flex-1 items-center justify-center">
          <motion.div 
            className="w-full max-w-md"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ 
              delay: 0.4,
              duration: 0.7,
              ease: "easeOut" 
            }}
          >
            <LoginForm />
          </motion.div>
        </div>
      </motion.div>

      {/* Left Column - Enhanced Background (Desktop) */}
      <div className="relative hidden bg-muted lg:block overflow-hidden">
        {/* Gradient Overlay */}
        <motion.div 
          className="absolute inset-0 bg-gradient-to-r from-teal-500/20 to-blue-600/20 z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        />
        
        {/* Background Image with Smooth Fade */}
        <motion.img
          src="/assets/bg.jpg"
          alt="Modern apartment building"
          className="absolute inset-0 h-full w-full object-cover"
          initial={{ opacity: 0 }}
          animate={{ 
            opacity: 1,
            transition: { 
              duration: 1.2, 
              ease: "easeOut",
              delay: 0.1
            }
          }}
        />
        
        {/* Text Overlay with Left Entrance */}
        <div className="absolute bottom-10 left-10 right-10 z-20">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ 
              opacity: 1, 
              x: 0,
              transition: { 
                delay: 0.8, 
                duration: 0.8,
                ease: "easeOut"
              }
            }}
          >
            <h2 className="text-3xl font-bold mb-2 text-white drop-shadow-lg">
              Welcome Back to RentEase
            </h2>
            <p className="text-lg text-gray-100 opacity-95">
              Continue your journey with seamless property management
            </p>
          </motion.div>
        </div>
      </div>

      {/* Mobile Background with Left Entrance */}
      <motion.div 
        className="lg:hidden relative h-64 w-full overflow-hidden"
        initial={{ opacity: 0, x: -50 }}
        animate={{ 
          opacity: 1, 
          x: 0,
          transition: { 
            duration: 0.9,
            ease: "easeOut"
          }
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-teal-500/30 to-blue-600/30 z-10" />
        <motion.img
          src="/assets/bg.jpg"
          alt="Modern apartment building"
          className="absolute inset-0 h-full w-full object-cover object-center"
          initial={{ opacity: 0 }}
          animate={{ 
            opacity: 1,
            transition: { duration: 1.2, ease: "easeOut" } 
          }}
        />
        <motion.div
          className="absolute bottom-4 left-4 right-4 z-20 text-center"
          initial={{ opacity: 0, x: -30 }}
          animate={{ 
            opacity: 1, 
            x: 0,
            transition: { 
              delay: 0.5, 
              duration: 0.7,
              ease: "easeOut"
            } 
          }}
        >
          <h2 className="text-xl font-bold text-white drop-shadow-md">
            Welcome to RentEase
          </h2>
          <p className="text-sm text-gray-100 opacity-95">
            Seamless property management
          </p>
        </motion.div>
      </motion.div>
    </div>
  )
}