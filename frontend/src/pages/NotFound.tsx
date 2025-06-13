import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Zap, Home } from "lucide-react";

const NotFound = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-br from-[#f5f7fa] to-[#c3cfe2] p-4"
    >
      <div className="max-w-3xl w-full text-center">
        {/* Animated 404 text */}
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
            className="absolute inset-0 bg-gradient-to-r from-teal-400 to-blue-500 rounded-full blur-xl opacity-30"
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
            className="text-9xl md:text-[180px] font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-teal-600 via-blue-600 to-teal-600"
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
                ease: "easeInOut"
              }}
              className=" mx-2"
            >
              0
            </motion.span>
            4
          </motion.h1>
        </motion.div>

        {/* Title */}
        <motion.h2
          className="text-3xl md:text-4xl font-bold text-gray-800 mb-4"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          Page Not Found
        </motion.h2>
        
        {/* Description */}
        <motion.p
          className="text-lg text-gray-600 mb-10 max-w-lg mx-auto"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          The page you're looking for doesn't exist or has been moved. Let's get you back home.
        </motion.p>
        
        {/* Home button */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <Link to="/">
            <motion.button
              className="group relative px-8 py-3 rounded-full bg-gradient-to-r from-teal-500 to-blue-600 text-white font-semibold shadow-lg overflow-hidden"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.span className="absolute inset-0 bg-gradient-to-r from-teal-600 to-blue-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <span className="relative flex items-center gap-2">
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
                Return Home
              </span>
            </motion.button>
          </Link>
        </motion.div>
        
        {/* Floating elements */}
        <motion.div
          className="absolute bottom-10 left-10 opacity-20"
          animate={{
            y: [0, -20, 0],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            repeatType: "reverse",
          }}
        >
          <Zap className="w-16 h-16 text-teal-500" />
        </motion.div>
        
        <motion.div
          className="absolute top-1/3 right-10 opacity-20"
          animate={{
            rotate: [0, 360],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
        >
          <Zap className="w-24 h-24 text-blue-500" />
        </motion.div>
      </div>
    </motion.div>
  );
};

export default NotFound;