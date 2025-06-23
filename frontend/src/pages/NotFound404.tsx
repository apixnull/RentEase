import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Home, Satellite, Plane, Telescope, Star } from "lucide-react";

const NotFound = () => {
  // Create twinkling stars
  const stars = Array.from({ length: 30 }).map((_, i) => ({
    id: i,
    size: Math.random() * 3 + 1,
    x: Math.random() * 100,
    y: Math.random() * 100,
    duration: Math.random() * 2 + 1,
    delay: Math.random() * 2,
  }));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-br from-[#0c0f2e] via-[#1a1f4d] to-[#2c1b47] p-4 overflow-hidden"
    >
      {/* Twinkling stars */}
      {stars.map((star) => (
        <motion.div
          key={star.id}
          className="absolute rounded-full bg-white"
          style={{
            top: `${star.y}%`,
            left: `${star.x}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
          }}
          animate={{ opacity: [0.2, 1, 0.2] }}
          transition={{
            duration: star.duration,
            repeat: Infinity,
            delay: star.delay,
          }}
        />
      ))}

      {/* Floating planet */}
      <motion.div
        className="absolute top-1/4 left-1/4 opacity-20"
        animate={{
          rotate: [0, 360],
        }}
        transition={{
          duration: 60,
          repeat: Infinity,
          ease: "linear"
        }}
      >
        <Plane className="w-24 h-24 text-blue-300" />
      </motion.div>

      {/* Floating satellite */}
      <motion.div
        className="absolute top-1/3 right-1/4 opacity-30"
        animate={{
          rotate: [0, 360],
          y: [0, -20, 0],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <Satellite className="w-16 h-16 text-purple-300" />
      </motion.div>

      <div className="max-w-3xl w-full text-center relative z-10">
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
            className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full blur-xl opacity-30"
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
            className="text-9xl md:text-[180px] font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400"
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
              className="mx-2"
            >
              0
            </motion.span>
            4
          </motion.h1>
        </motion.div>

        {/* Telescope animation */}
        <motion.div
          className="flex justify-center mb-8"
          animate={{ 
            rotate: [0, 15, -15, 0],
            y: [0, -10, 0]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut"
          }}
        >
          <Telescope className="w-24 h-24 text-purple-400" />
        </motion.div>

        {/* Title */}
        <motion.h2
          className="text-3xl md:text-4xl font-bold text-white mb-4"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          Lost in Space?
        </motion.h2>
        
        {/* Description */}
        <motion.p
          className="text-lg text-blue-100 mb-10 max-w-lg mx-auto"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          The page you're looking for seems to have drifted off into the cosmos. 
          Let's get you back to familiar territory.
        </motion.p>
        
        {/* Home button */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex justify-center w-full" // Added w-full and justify-center
        >
          <Link to="/">
            <motion.button
              className="group relative px-8 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-purple-700 text-white font-bold shadow-lg overflow-hidden flex items-center gap-3"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.span className="absolute inset-0 bg-gradient-to-r from-blue-700 to-purple-800 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              <motion.span
                animate={{ 
                  rotate: [0, 10, -10, 0],
                  transition: {
                    duration: 1.5,
                    repeat: Infinity
                  }
                }}
              >
                <Home className="w-6 h-6" />
              </motion.span>
              
              <span className="relative">
                Return to Home Base
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
                <Star className="w-5 h-5 text-yellow-300" />
              </motion.div>
            </motion.button>
          </Link>
        </motion.div>
      </div>

      {/* Shooting stars */}
      <motion.div
        className="absolute top-20 left-0 w-2 h-2 bg-white rounded-full"
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
        className="absolute top-40 right-0 w-1 h-1 bg-blue-300 rounded-full"
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
    </motion.div>
  );
};

export default NotFound;