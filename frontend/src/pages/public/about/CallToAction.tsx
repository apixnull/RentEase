
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
// Call to Action Component
export const CallToAction = () => (
  <motion.section 
    className="text-center py-12 rounded-xl bg-gradient-to-r from-blue-500 to-teal-500 text-white"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.3 }}
  >
    <h2 className="text-2xl font-bold mb-4">Ready to transform your rental experience?</h2>
    <p className="text-blue-100 max-w-2xl mx-auto mb-6">
      Join RentEase today and discover a better way to manage or find rental properties in Cebu City.
    </p>
    <div className="flex gap-4 justify-center">
      <Button
        className="bg-white text-blue-600 hover:bg-blue-50 hover:text-blue-700"
        size="lg"
      >
        For Landlords
      </Button>
      <Button 
        variant="outline" 
        className="text-black border-white hover:bg-white/10"
        size="lg"
      >
        For Tenants
      </Button>
    </div>
  </motion.section>
);