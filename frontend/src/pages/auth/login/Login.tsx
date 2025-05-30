import { Home } from "lucide-react";
import LoginForm from "@/pages/auth/login/LoginForm";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function Login() {
  const navigate = useNavigate();

  return (
    <div className="min-h-svh grid lg:grid-cols-2 bg-gradient-to-br from-gray-50 to-gray-100">
      
      
      {/* Right Column - Login Form */}
      <div className="flex flex-col gap-6 p-6 md:p-12">
        {/* Enhanced RentEase Logo */}
        <motion.div 
          className="flex justify-start"
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
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
        
        {/* Form Container */}
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-md">
            <LoginForm />
          </div>
        </div>
      </div>
      {/* Left Column - Background Image */}
      <div className="relative hidden bg-muted lg:block">
        <div className="absolute inset-0 bg-gradient-to-r from-teal-500/20 to-blue-600/20 z-10"></div>
        <img
          src="/assets/bg.jpg"
          alt="Modern apartment building"
          className="absolute inset-0 h-full w-full object-cover"
        />
        {/* Text Overlay */}
        <div className="absolute bottom-10 left-10 right-10 z-20 text-white">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.5 }}
          >
            <h2 className="text-3xl font-bold mb-2">Welcome Back to RentEase</h2>
            <p className="text-lg opacity-90">
              Continue your journey with seamless property management
            </p>
          </motion.div>
        </div>
      </div>
    </div>
    
  )
}