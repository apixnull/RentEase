import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Zap } from "lucide-react";
import Footer from "@/components/public/Footer";
import LoginForm from "./LoginForm";

export default function Login() {
  return (
    <>
      <div className="grid min-h-svh lg:grid-cols-2">
        {/* Left Panel - Form Section */}
        <div className="flex flex-col gap-4 p-6 md:p-10 bg-gradient-to-br from-white to-gray-50">
          {/* Logo */}
          <div className="flex justify-center md:justify-start">
            <Link to="/" className="flex items-center gap-2 font-medium">
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
              <LoginForm />
            </div>
          </motion.div>
        </div>

        {/* Right Panel - Visual Section */}
        <div className="bg-muted relative hidden lg:block overflow-hidden">
          {/* Animated Blob Background */}
          <motion.div
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              className="absolute top-1/3 -left-1/4 w-[150%] h-[70%] bg-gradient-to-br from-teal-400/30 to-blue-600/40 rounded-full"
              animate={{
                borderRadius: [
                  "60% 40% 30% 70%/60% 30% 70% 40%",
                  "50% 50% 70% 30%/40% 60% 40% 60%",
                  "60% 40% 30% 70%/60% 30% 70% 40%",
                ],
                x: ["0%", "10%", "0%"],
                rotate: [0, 5, 0],
              }}
              transition={{
                duration: 15,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />

            <motion.div
              className="absolute top-1/4 right-1/4 w-[80%] h-[80%] bg-gradient-to-tr from-teal-500/20 to-blue-500/30 rounded-full blur-xl"
              animate={{
                borderRadius: [
                  "30% 70% 70% 30%/30% 30% 70% 70%",
                  "50% 50% 60% 40%/40% 70% 30% 60%",
                  "30% 70% 70% 30%/30% 30% 70% 70%",
                ],
                x: ["0%", "-10%", "0%"],
                rotate: [0, -8, 0],
              }}
              transition={{
                duration: 18,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </motion.div>

          {/* Background Image */}
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900/80 to-gray-800/90 -z-10" />
          <div className="absolute inset-0 bg-[url('/bg.jpg')] bg-cover bg-center -z-20" />

          {/* Text Overlay */}
          <motion.div
            className="absolute bottom-10 left-10 right-10 text-white"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7, duration: 0.7 }}
          >
            <h2 className="text-3xl font-bold mb-3">Welcome to RentEase</h2>
            <motion.p
              className="text-lg max-w-md"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
            >
              Your trusted platform for seamless property rentals. Find your
              perfect space with ease.
            </motion.p>
          </motion.div>
        </div>
      </div>
      <Footer />
    </>
  );
}