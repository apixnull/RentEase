import { motion } from 'framer-motion'
// Hero Section Component
export const HeroSection = () => (
  <section className="text-center mb-16">
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h1 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-teal-500 bg-clip-text text-transparent">
        About RentEase
      </h1>
      <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
        Transforming rental housing in Cebu City through digital innovation
      </p>
    </motion.div>
  </section>
);