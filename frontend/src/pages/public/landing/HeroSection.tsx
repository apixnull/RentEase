// src/sections/HeroSection.jsx
import { motion } from "framer-motion";
import { Zap, ChevronRight, Home as HomeIcon, Users, Calendar, ShieldCheck, Check } from "lucide-react";

const HeroSection = () => {
  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  const stats = [
    { icon: HomeIcon, value: "50K+", label: "Properties" },
    { icon: Users, value: "120+", label: "Cities" },
    { icon: Calendar, value: "98%", label: "Satisfaction" },
    { icon: ShieldCheck, value: "24/7", label: "Support" }
  ];

  return (
    <section className="relative min-h-screen flex items-center py-16">
      {/* Background blobs */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div 
          className="absolute -top-40 -left-40 w-[800px] h-[800px] rounded-full bg-gradient-to-r from-teal-200 to-blue-300 blur-3xl opacity-30"
          animate={{
            scale: [1, 1.2, 1],
            x: [-50, -100, -50],
            y: [-50, -100, -50],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            repeatType: "reverse"
          }}
        />
        <motion.div 
          className="absolute -bottom-60 -right-60 w-[700px] h-[700px] rounded-full bg-gradient-to-r from-blue-200 to-teal-300 blur-3xl opacity-30"
          animate={{
            scale: [1, 1.3, 1],
            x: [50, 100, 50],
            y: [50, 100, 50],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            repeatType: "reverse"
          }}
        />
      </div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <motion.div 
          className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
          variants={container}
          initial="hidden"
          animate="visible"
        >
          {/* Left Content */}
          <motion.div variants={item} className="text-center lg:text-left">
            <motion.div 
              className="flex justify-center lg:justify-start items-center mb-6"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <motion.div
                animate={{ 
                  rotate: [0, 5, -5, 3, 0],
                  scale: [1, 1.1, 1.05, 1.08, 1],
                  transition: { 
                    duration: 1.5,
                    repeat: Infinity,
                    repeatType: "reverse"
                  }
                }}
                className="mr-3"
              >
                <Zap className="w-8 h-8 text-teal-400" fill="currentColor" />
              </motion.div>
              <motion.span 
                className="text-2xl font-bold bg-gradient-to-r from-teal-400 to-blue-400 bg-clip-text text-transparent"
                animate={{
                  backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                }}
                transition={{
                  backgroundPosition: {
                    duration: 4,
                    repeat: Infinity,
                    ease: "linear"
                  }
                }}
              >
                RentEase
              </motion.span>
            </motion.div>
            
            <motion.h1 
              className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight mb-6"
              variants={item}
            >
              Find Your Perfect <span className="text-teal-500">Rental</span> Hassle-Free
            </motion.h1>
            
            <motion.p 
              className="text-lg sm:text-xl text-gray-600 mb-10 max-w-xl mx-auto lg:mx-0"
              variants={item}
            >
              Discover thousands of verified properties and move in with confidence. 
              The smart way to find your next home.
            </motion.p>
            
            <motion.div 
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
              variants={item}
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3 sm:px-8 sm:py-4 bg-gradient-to-r from-teal-500 to-blue-500 rounded-xl font-bold text-lg shadow-lg hover:shadow-teal-500/20 transition-all"
              >
                Get Started
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3 sm:px-8 sm:py-4 bg-white border border-gray-200 rounded-xl font-bold text-lg hover:bg-gray-50 transition-all"
              >
                <span className="flex items-center justify-center">
                  How It Works <ChevronRight className="ml-2" size={20} />
                </span>
              </motion.button>
            </motion.div>
            
            <motion.div 
              className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-xl mx-auto lg:mx-0"
              variants={container}
            >
              {stats.map((stat, index) => (
                <motion.div 
                  key={index}
                  className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm"
                  variants={item}
                  whileHover={{ y: -5 }}
                >
                  <stat.icon className="w-8 h-8 text-teal-500 mx-auto mb-2" />
                  <p className="text-xl font-bold text-gray-800">{stat.value}</p>
                  <p className="text-sm text-gray-600">{stat.label}</p>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
          
          {/* Right Content */}
          <motion.div 
            className="relative"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden max-w-lg mx-auto">
              <div className="p-6">
                <div className="bg-gray-100 rounded-xl p-4 mb-4">
                  <div className="flex justify-between mb-3">
                    <div className="bg-gray-300 rounded-full h-3 w-24"></div>
                    <div className="bg-gray-300 rounded-full h-3 w-8"></div>
                  </div>
                  <div className="bg-gradient-to-r from-teal-500 to-blue-500 rounded-xl h-64 flex items-center justify-center">
                    <Zap className="w-16 h-16 text-white" />
                  </div>
                  <div className="mt-4">
                    <div className="bg-gray-300 rounded-full h-4 w-3/4 mx-auto mb-2"></div>
                    <div className="bg-gray-300 rounded-full h-3 w-1/2 mx-auto"></div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  {[1, 2].map((item) => (
                    <div key={item} className="bg-gray-100 rounded-xl p-3">
                      <div className="bg-gray-300 rounded-xl h-32 mb-2 flex items-center justify-center">
                        <Zap className="w-8 h-8 text-gray-500" />
                      </div>
                      <div className="bg-gray-300 rounded-full h-3 w-3/4 mx-auto"></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <motion.div 
              className="absolute -bottom-4 -right-4 bg-white p-3 rounded-xl shadow-lg border border-gray-100"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <div className="flex items-center">
                <div className="bg-teal-100 p-2 rounded-lg mr-2">
                  <Check className="text-teal-600" size={20} />
                </div>
                <div>
                  <p className="font-bold text-sm text-gray-800">Property Verified</p>
                  <p className="text-xs text-gray-600">24 hours ago</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;