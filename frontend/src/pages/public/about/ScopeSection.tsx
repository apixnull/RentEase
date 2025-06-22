import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { MapPin } from "lucide-react";
// Scope Section Component
export const ScopeSection = () => (
  <section className="mb-16">
    <div className="flex items-center gap-3 mb-6">
      <MapPin className="h-8 w-8 text-teal-500" />
      <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-teal-500 bg-clip-text text-transparent">
        Scope
      </h2>
    </div>
    
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <Card className="p-6 bg-white border-0 shadow-sm">
        <ul className="list-disc pl-5 space-y-2 text-gray-700 dark:text-gray-300">
          <li>Web-based platform focused on Cebu City</li>
          <li>User registration and property listing</li>
          <li>Manual rent tracking and lease monitoring</li>
          <li>AI chatbot for property search</li>
          <li>Maintenance request system</li>
        </ul>
      </Card>
    </motion.div>
  </section>
);