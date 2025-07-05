// src/sections/FeaturesSection.jsx
import { motion } from "framer-motion";
import { Search, Heart, Star, MapPin } from "lucide-react";

const FeaturesSection = () => {
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

  const features = [
    { icon: Search, title: "Smart Search", desc: "AI-powered property matching" },
    { icon: Heart, title: "Save Favorites", desc: "Bookmark properties you love" },
    { icon: Star, title: "Verified Listings", desc: "100% authentic properties" },
    { icon: MapPin, title: "Neighborhood Insights", desc: "Know the area before you rent" },
  ];

  return (
    <section className="py-16 relative">
      <div className="absolute inset-0 overflow-hidden">
        <motion.div 
          className="absolute top-1/3 left-1/4 w-[600px] h-[600px] rounded-full bg-gradient-to-r from-blue-100 to-teal-100 blur-3xl opacity-40"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{
            duration: 12,
            repeat: Infinity,
            repeatType: "reverse"
          }}
        />
      </div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.h2 
            className="text-2xl md:text-3xl font-bold mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
          >
            Why Choose <span className="text-teal-500">RentEase</span>
          </motion.h2>
          <motion.p 
            className="text-lg text-gray-600 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ delay: 0.1 }}
          >
            Everything you need to find, tour, and secure your perfect rental
          </motion.p>
        </div>
        
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          variants={container}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {features.map((feature, index) => (
            <motion.div 
              key={index}
              className="bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition-shadow border border-gray-100"
              variants={item}
              whileHover={{ y: -10 }}
            >
              <div className="bg-teal-50 p-3 rounded-lg inline-block mb-4">
                <feature.icon className="w-6 h-6 text-teal-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
              <p className="text-gray-600 text-sm">{feature.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturesSection;