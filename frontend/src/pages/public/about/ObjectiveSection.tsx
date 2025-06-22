import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Target } from "lucide-react";
// Objectives Section Component
export const ObjectivesSection = () => (
  <section className="mb-16">
    <div className="flex items-center gap-3 mb-6">
      <Target className="h-8 w-8 text-teal-500" />
      <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-teal-500 bg-clip-text text-transparent">
        Objectives
      </h2>
    </div>
    
    <div className="grid md:grid-cols-2 gap-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="p-6 bg-white border-0 shadow-sm">
          <h3 className="font-semibold mb-3 text-blue-600">General Objective</h3>
          <p className="text-gray-700 dark:text-gray-300">
            To design, develop, and evaluate RentEase, an AI-powered rental management system 
            tailored for small- to mid-scale landlords and tenants in Cebu City.
          </p>
        </Card>
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="p-6 bg-gradient-to-r from-blue-500 to-teal-500 text-white">
          <h3 className="font-semibold mb-3">Specific Objectives</h3>
          <ul className="list-disc pl-5 space-y-2">
            <li>Identify current rental management pain points</li>
            <li>Implement AI-powered property search</li>
            <li>Develop landlord dashboard for rent tracking</li>
            <li>Create maintenance request system</li>
            <li>Enable digital lease agreement management</li>
          </ul>
        </Card>
      </motion.div>
    </div>
  </section>
);
