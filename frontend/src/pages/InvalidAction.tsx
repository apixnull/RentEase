import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Home, RefreshCw, AlertTriangle, Lock } from 'lucide-react';

const InvalidAction = () => {
  // Create twinkling stars
  const stars = Array.from({ length: 100 }).map((_, i) => ({
    id: i,
    size: Math.random() * 3 + 1,
    x: Math.random() * 100,
    y: Math.random() * 100,
    duration: Math.random() * 2 + 1,
    delay: Math.random() * 2,
  }));

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-br from-[#0c0f2e] via-[#1a1f4d] to-[#2c1b47] p-4 overflow-hidden relative font-sans">
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
      
      {/* Nebula background elements */}
      <motion.div 
        className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-gradient-to-r from-purple-700/20 to-pink-600/20 blur-[80px]"
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.4, 0.6, 0.4],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          repeatType: "reverse",
        }}
      />
      
      <motion.div 
        className="absolute bottom-1/4 right-1/4 w-48 h-48 rounded-full bg-gradient-to-r from-blue-600/20 to-teal-500/20 blur-[70px]"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 7,
          repeat: Infinity,
          repeatType: "reverse",
        }}
      />
      
      {/* Floating warning elements */}
      <motion.div
        className="absolute top-1/3 left-1/5 opacity-20"
        animate={{
          rotate: [0, 360],
          y: [0, -30, 0],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <AlertTriangle className="w-20 h-20 text-yellow-300" />
      </motion.div>
      
      <motion.div
        className="absolute bottom-1/3 right-1/4 opacity-20"
        animate={{
          rotate: [0, -360],
          y: [0, 20, 0],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <Lock className="w-16 h-16 text-orange-300" />
      </motion.div>
      
      {/* Main content container */}
      <div className="max-w-4xl w-full relative z-10 px-4">
        <motion.div 
          className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-lg rounded-3xl overflow-hidden border border-purple-500/30 shadow-2xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Header section */}
          <div className="bg-gradient-to-r from-yellow-600/20 to-orange-600/20 p-6 border-b border-yellow-500/30">
            <motion.div
              className="flex flex-col items-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <motion.div
                className="relative"
                animate={{
                  rotate: [0, 5, -5, 0],
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatType: "mirror",
                }}
              >
                <AlertTriangle className="w-16 h-16 text-yellow-400 mx-auto" />
              </motion.div>
              
              <motion.h1
                className="text-3xl md:text-4xl font-bold text-white mt-4 text-center"
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                Invalid Action Attempted
              </motion.h1>
              
              <motion.p
                className="text-lg text-yellow-200 mt-2 text-center max-w-2xl"
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                Direct URL manipulation detected
              </motion.p>
            </motion.div>
          </div>
          
          {/* Content section */}
          <div className="p-6 md:p-8">
            {/* Explanation box */}
            <motion.div 
              className="mt-8 p-4 bg-yellow-900/30 rounded-xl border border-yellow-500/30 max-w-2xl mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              <p className="text-yellow-300 flex flex-col items-center text-center gap-2">
                <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                <span>This happens when you try to access a page by manually entering URL parameters. Please use the application's navigation controls instead.</span>
              </p>
            </motion.div>
            
            {/* Action buttons */}
            <motion.div
              className="flex flex-col md:flex-row justify-center gap-4 mt-10"
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1.0 }}
            >
              <Link to="/" className="flex-1 max-w-sm mx-auto">
                <motion.button
                  className="group relative px-6 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-purple-700 text-white font-bold shadow-lg overflow-hidden flex items-center justify-center gap-3 w-full"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <motion.span className="absolute inset-0 bg-gradient-to-r from-blue-700 to-purple-800 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <Home className="w-5 h-5" />
                  <span className="relative">Go to Homepage</span>
                </motion.button>
              </Link>
              
              <Link to="/" className="flex-1 max-w-sm mx-auto">
                <motion.button
                  className="group relative px-6 py-4 rounded-xl bg-gradient-to-r from-yellow-600 to-orange-600 text-white font-bold shadow-lg overflow-hidden flex items-center justify-center gap-3 w-full mt-4 md:mt-0"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <motion.span className="absolute inset-0 bg-gradient-to-r from-yellow-700 to-orange-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <RefreshCw className="w-5 h-5" />
                  <span className="relative">Restart Process</span>
                </motion.button>
              </Link>
            </motion.div>
          </div>
        </motion.div>
        
        {/* Additional info */}
        <motion.div
          className="mt-8 text-center text-gray-400 text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.3 }}
        >
          <p>Use the application's navigation controls to access pages</p>
        </motion.div>
      </div>
      
      {/* Shooting stars */}
      <motion.div
        className="absolute top-20 left-0 w-2 h-2 bg-yellow-400 rounded-full shadow-lg shadow-yellow-500"
        animate={{
          x: [0, window.innerWidth],
          y: [0, window.innerHeight/2],
          opacity: [1, 0.8, 0]
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          repeatDelay: 8,
          ease: "easeOut"
        }}
      />
      
      <motion.div
        className="absolute top-40 right-0 w-1.5 h-1.5 bg-orange-400 rounded-full shadow-lg shadow-orange-500"
        animate={{
          x: [0, -window.innerWidth],
          y: [0, window.innerHeight/3],
          opacity: [1, 0.8, 0]
        }}
        transition={{
          duration: 1.2,
          repeat: Infinity,
          repeatDelay: 12,
          ease: "easeOut"
        }}
      />
      
      {/* Floating warning text */}
      <motion.div
        className="absolute bottom-6 left-0 right-0 text-center"
        animate={{ opacity: [0.6, 0.8, 0.6] }}
        transition={{ duration: 3, repeat: Infinity }}
      >
        <p className="text-yellow-400/70 font-mono text-sm tracking-wider">
          NAVIGATION ERROR: INVALID URL ACCESS
        </p>
      </motion.div>
    </div>
  );
};

export default InvalidAction;