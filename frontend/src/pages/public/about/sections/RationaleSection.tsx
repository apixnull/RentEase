import { Card } from '@/components/ui/card';
import { motion } from 'framer-motion'
import { BookOpen } from 'lucide-react';

export const RationaleSection = () => (
  <section className="mb-16 relative max-w-7xl mx-auto px-4">
    {/* Decorative elements */}
    <div className="absolute -top-10 -right-10 w-32 h-32 bg-teal-400/10 rounded-full blur-xl" />
    
    <div className="relative z-10">
      <motion.div 
        className="flex items-center gap-3 mb-10"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-full">
          <BookOpen className="h-7 w-7 text-blue-600 dark:text-blue-400" />
        </div>
        <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-teal-500 bg-clip-text text-transparent">
          Rationale of the Study
        </h2>
      </motion.div>
      
      <div className="grid md:grid-cols-2 gap-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, type: "spring" }}
        >
          <Card className="p-6 bg-white dark:bg-gray-800 border-0 shadow-lg rounded-2xl overflow-hidden relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-teal-50 dark:from-gray-900 dark:to-gray-800 opacity-80 z-0"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <h3 className="font-bold text-lg text-blue-600 dark:text-blue-400">The Problem</h3>
              </div>
              <p className="text-gray-700 dark:text-gray-300">
                The rental housing sector in the Philippines relies heavily on inefficient, informal systems. 
                Manual processes lead to poor documentation, unclear accountability, and inconsistent rent tracking.
              </p>
              
              <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                <ul className="space-y-2">
                  {[
                    "Handwritten receipts and ledgers",
                    "Inconsistent payment tracking",
                    "Poor communication channels",
                    "Limited property visibility"
                  ].map((item, i) => (
                    <li key={i} className="flex items-start">
                      <div className="flex-shrink-0 mt-1">
                        <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                      </div>
                      <span className="ml-3 text-gray-600 dark:text-gray-400">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Card>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, type: "spring" }}
        >
          <Card className="p-6 bg-gradient-to-br from-blue-600 to-teal-500 text-white rounded-2xl shadow-xl overflow-hidden relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-700/20 to-teal-600/20 z-0"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-3 h-3 bg-green-300 rounded-full"></div>
                <h3 className="font-bold text-lg">Our Solution</h3>
              </div>
              <p className="text-blue-100">
                RentEase bridges the gap with a lightweight, user-friendly platform featuring 
                AI-assisted property recommendations, integrated communication, and rent tracking tools.
              </p>
              
              <div className="mt-6 pt-4 border-t border-blue-400/30">
                <ul className="space-y-3">
                  {[
                    "AI-powered property matching",
                    "Digital lease agreements",
                    "Automated rent tracking",
                    "Maintenance request system",
                    "Integrated communication hub"
                  ].map((item, i) => (
                    <motion.li 
                      key={i} 
                      className="flex items-center"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + (i * 0.1) }}
                    >
                      <div className="flex-shrink-0">
                        <div className="w-2 h-2 bg-green-300 rounded-full"></div>
                      </div>
                      <span className="ml-3 font-medium">{item}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  </section>
);