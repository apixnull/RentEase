import { Card } from '@/components/ui/card';
import { motion } from 'framer-motion'
import { BookOpen } from 'lucide-react';

// Rationale Section Component
export const RationaleSection = () => (
  <section className="mb-16">
    <div className="flex items-center gap-3 mb-6">
      <BookOpen className="h-8 w-8 text-teal-500" />
      <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-teal-500 bg-clip-text text-transparent">
        Rationale of the Study
      </h2>
    </div>
    
    <div className="grid md:grid-cols-2 gap-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="p-6 bg-white border-0 shadow-sm hover:shadow-md transition-shadow">
          <h3 className="font-semibold mb-3 text-blue-600">The Problem</h3>
          <p className="text-gray-700 dark:text-gray-300">
            The rental housing sector in the Philippines relies heavily on inefficient, informal systems. 
            Manual processes lead to poor documentation, unclear accountability, and inconsistent rent tracking.
          </p>
        </Card>
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="p-6 bg-gradient-to-r from-blue-500 to-teal-500 text-white">
          <h3 className="font-semibold mb-3">Our Solution</h3>
          <p>
            RentEase bridges the gap with a lightweight, user-friendly platform featuring 
            AI-assisted property recommendations, integrated communication, and rent tracking tools.
          </p>
        </Card>
      </motion.div>
    </div>
  </section>
);
