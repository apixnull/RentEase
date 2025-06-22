// src/sections/HowItWorksSection.jsx
import { motion } from "framer-motion";
import { Search, Heart, Smartphone, Key } from "lucide-react";

const HowItWorksSection = () => {
  const steps = [
    { icon: Search, title: "Search", desc: "Find properties that match your needs" },
    { icon: Heart, title: "Save", desc: "Shortlist your favorite options" },
    { icon: Smartphone, title: "Contact", desc: "Message owners directly" },
    { icon: Key, title: "Move In", desc: "Sign digitally and move in" },
  ];

  return (
    <section className="py-16 bg-gray-50 relative">
      <div className="absolute inset-0 overflow-hidden">
        <motion.div 
          className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full bg-gradient-to-r from-teal-100 to-blue-100 blur-3xl opacity-30"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{
            duration: 10,
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
            How <span className="text-teal-500">RentEase</span> Works
          </motion.h2>
          <motion.p 
            className="text-lg text-gray-600 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ delay: 0.1 }}
          >
            Simple steps to find and secure your perfect rental
          </motion.p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, index) => (
            <motion.div 
              key={index}
              className="bg-white p-6 rounded-2xl shadow-md border border-gray-100"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="flex flex-col items-center text-center">
                <div className="bg-teal-500 rounded-full w-12 h-12 flex items-center justify-center text-white mb-4">
                  <span className="font-bold">{index + 1}</span>
                </div>
                <div className="bg-teal-100 p-3 rounded-full mb-4">
                  <step.icon className="w-6 h-6 text-teal-600" />
                </div>
                <h3 className="text-lg font-bold mb-2">{step.title}</h3>
                <p className="text-gray-600 text-sm">{step.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;