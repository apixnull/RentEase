import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Target } from "lucide-react";

export const ObjectivesSection = () => (
  <section className="mb-16 relative max-w-7xl mx-auto px-4">
    {/* Decorative elements */}
    <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-blue-500/10 rounded-full blur-xl" />
    
    <div className="relative z-10">
      <motion.div 
        className="flex items-center gap-3 mb-10"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-full">
          <Target className="h-7 w-7 text-blue-600 dark:text-blue-400" />
        </div>
        <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-teal-500 bg-clip-text text-transparent">
          Objectives
        </h2>
      </motion.div>
      
      <div className="grid md:grid-cols-2 gap-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, type: "spring" }}
        >
          <Card className="p-6 bg-white dark:bg-gray-800 border-0 shadow-lg rounded-2xl overflow-hidden relative h-full">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-teal-50 dark:from-gray-900 dark:to-gray-800 opacity-80 z-0"></div>
            <div className="relative z-10 h-full flex flex-col">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <h3 className="font-bold text-lg text-blue-600 dark:text-blue-400">General Objective</h3>
              </div>
              <p className="text-gray-700 dark:text-gray-300 flex-grow">
                To design, develop, and evaluate RentEase, an AI-powered rental management system 
                tailored for small- to mid-scale landlords and tenants in Cebu City.
              </p>
              
              <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex justify-center">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-teal-500 rounded-full blur opacity-30"></div>
                    <div className="relative bg-blue-500 text-white px-4 py-2 rounded-full text-sm font-medium">
                      Comprehensive Solution
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, type: "spring" }}
        >
          <Card className="p-6 bg-gradient-to-br from-blue-600 to-teal-500 text-white rounded-2xl shadow-xl overflow-hidden relative h-full">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-700/20 to-teal-600/20 z-0"></div>
            <div className="relative z-10 h-full flex flex-col">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-3 h-3 bg-green-300 rounded-full"></div>
                <h3 className="font-bold text-lg">Specific Objectives</h3>
              </div>
              
              <ul className="space-y-3 flex-grow">
                {[
                  "Identify current rental management pain points",
                  "Implement AI-powered property search",
                  "Develop landlord dashboard for rent tracking",
                  "Create maintenance request system",
                  "Enable digital lease agreement management",
                  "Implement secure payment processing",
                  "Design intuitive tenant portal"
                ].map((item, i) => (
                  <motion.li 
                    key={i} 
                    className="flex items-start"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + (i * 0.1) }}
                  >
                    <div className="flex-shrink-0 mt-1.5">
                      <div className="w-2 h-2 bg-green-300 rounded-full"></div>
                    </div>
                    <span className="ml-3">{item}</span>
                  </motion.li>
                ))}
              </ul>
              
              <div className="mt-6 pt-4 border-t border-blue-400/30 flex justify-center">
                <div className="flex items-center gap-2 bg-blue-700/30 px-4 py-2 rounded-full">
                  <Target className="w-4 h-4" />
                  <span className="text-sm font-medium">7 Key Objectives</span>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  </section>
);