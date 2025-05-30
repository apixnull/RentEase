// src/pages/public/Landing.tsx
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Home, Wallet, Wrench, FileText, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.6, ease: "easeOut" }
  }
};

const blobVariants = {
  animate: {
    scale: [1, 1.1, 1],
    x: [0, 30, -20, 0],
    y: [0, -50, 20, 0],
    transition: {
      duration: 7,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

export default function Landing() {
  return (
    <div className="bg-gradient-to-b from-white to-gray-50">
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <TestimonialsSection />
      <CTASection />
    </div>
  );
}

function HeroSection() {
  return (
    <section className="min-h-screen relative flex flex-col items-center justify-center text-center px-4 py-20 overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden z-0">
        <motion.div 
          className="absolute -top-20 -left-20 w-96 h-96 bg-teal-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
          variants={blobVariants}
          animate="animate"
        />
        <motion.div 
          className="absolute top-1/4 -right-20 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
          variants={blobVariants}
          animate="animate"
          initial={{ scale: 1, x: 0, y: 0 }}
          transition={{ delay: 2 }}
        />
        <motion.div 
          className="absolute bottom-20 left-1/4 w-72 h-72 bg-teal-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
          variants={blobVariants}
          animate="animate"
          initial={{ scale: 1, x: 0, y: 0 }}
          transition={{ delay: 4 }}
        />
      </div>
      
      <motion.div 
        className="max-w-6xl mx-auto relative z-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div 
          className="inline-block mb-6 px-4 py-1.5 text-sm font-medium bg-teal-100 text-teal-800 rounded-full"
          variants={itemVariants}
        >
          🚀 All-in-One Property Management Solution
        </motion.div>
        
        <motion.h1 
          className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-6 bg-gradient-to-r from-teal-500 to-blue-600 bg-clip-text text-transparent"
          variants={itemVariants}
        >
          Revolutionize Your <span className="block mt-2">Rental Experience</span>
        </motion.h1>
        
        <motion.p 
          className="text-lg md:text-xl text-gray-600 mb-8 max-w-3xl mx-auto"
          variants={itemVariants}
          transition={{ delay: 0.1 }}
        >
          Simplify rental management for landlords and tenants — automate payments, 
          track leases, and manage maintenance all in one place with our intuitive platform.
        </motion.p>
        
        <motion.div 
          className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
          variants={itemVariants}
          transition={{ delay: 0.2 }}
        >
          <Link to="/auth/register">
            <Button size="lg" className="bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 text-white hover:shadow-lg transition-all duration-300 group">
              Get Started - It's Free
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
          <Link to="/features">
            <Button size="lg" variant="outline" className="border-teal-500 text-teal-600 hover:bg-teal-50 transition-colors duration-200 group">
              <span className="bg-gradient-to-r from-teal-500 to-blue-600 bg-clip-text text-transparent">
                Learn More
              </span>
              <ArrowRight className="ml-2 h-4 w-4 text-teal-500 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </motion.div>
        
        {/* Feature Highlights */}
        <motion.div 
          className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto"
          variants={containerVariants}
          transition={{ delay: 0.3 }}
        >
          {[
            { icon: <Home className="h-6 w-6 text-teal-600" />, text: "Property Management" },
            { icon: <Wallet className="h-6 w-6 text-blue-600" />, text: "Automated Payments" },
            { icon: <Wrench className="h-6 w-6 text-teal-600" />, text: "Maintenance Tracking" },
            { icon: <FileText className="h-6 w-6 text-blue-600" />, text: "Digital Leases" }
          ].map((feature, index) => (
            <motion.div 
              key={index}
              className="bg-white/80 backdrop-blur-sm p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
              variants={itemVariants}
              whileHover={{ y: -5 }}
            >
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-teal-100 flex items-center justify-center">
                {feature.icon}
              </div>
              <p className="font-medium text-gray-800">{feature.text}</p>
            </motion.div>
          ))}
        </motion.div>
        
        {/* Dashboard Preview */}
        <motion.div 
          className="mt-16 rounded-2xl overflow-hidden shadow-2xl border border-gray-200 max-w-5xl mx-auto"
          variants={itemVariants}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-teal-400/20 to-blue-500/20"></div>
            <div className="bg-gray-200 border-2 border-dashed rounded-xl w-full h-96 flex items-center justify-center">
              <div className="text-center">
                <div className="mb-4 inline-block bg-gradient-to-r from-teal-500 to-blue-600 text-white px-4 py-2 rounded-lg">
                  RentEase Dashboard Preview
                </div>
                <p className="text-gray-500 max-w-md">
                  Interactive dashboard showing property metrics, recent activity, and financial overview
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}

// Features Section Component
function FeaturesSection() {
  const features = [
    {
      icon: "💰",
      title: "Automated Payments",
      description: "Secure, automated rent collection with multiple payment options"
    },
    {
      icon: "📅",
      title: "Lease Management",
      description: "Digital lease agreements with e-signature capabilities"
    },
    {
      icon: "🛠️",
      title: "Maintenance Tracking",
      description: "Streamlined maintenance requests and resolution tracking"
    },
    {
      icon: "📊",
      title: "Financial Reporting",
      description: "Comprehensive financial reports and tax documentation"
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-teal-500 to-blue-600 bg-clip-text text-transparent">
            Powerful Features
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Everything you need to manage your rental properties efficiently
          </p>
        </motion.div>
        
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {features.map((feature, index) => (
            <motion.div 
              key={index}
              className="bg-gray-50 p-6 rounded-xl hover:shadow-lg transition-all duration-300 border border-gray-100"
              variants={itemVariants}
              whileHover={{ y: -5 }}
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold mb-2 text-gray-800">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// How It Works Section Component
function HowItWorksSection() {
  const steps = [
    {
      number: "1",
      title: "Create Your Account",
      description: "Sign up as a landlord or tenant in minutes"
    },
    {
      number: "2",
      title: "Set Up Your Property",
      description: "Add your property details and invite tenants"
    },
    {
      number: "3",
      title: "Start Managing",
      description: "Use our tools to handle payments, leases, and maintenance"
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-6xl mx-auto px-4">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-teal-500 to-blue-600 bg-clip-text text-transparent">
            How RentEase Works
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Get started in just a few simple steps
          </p>
        </motion.div>
        
        <div className="relative">
          <div className="hidden lg:block absolute top-16 left-1/2 transform -translate-x-1/2 h-1 w-2/3 bg-gradient-to-r from-teal-400 to-blue-500"></div>
          
          <motion.div 
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
          >
            {steps.map((step, index) => (
              <motion.div 
                key={index}
                className="relative z-10"
                variants={itemVariants}
                whileHover={{ y: -5 }}
              >
                <div className="w-16 h-16 mb-6 mx-auto rounded-full bg-gradient-to-r from-teal-500 to-blue-600 flex items-center justify-center text-white text-2xl font-bold">
                  {step.number}
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <h3 className="text-xl font-semibold mb-2 text-gray-800">{step.title}</h3>
                  <p className="text-gray-600">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// Testimonials Section Component
function TestimonialsSection() {
  const testimonials = [
    {
      quote: "RentEase saved me 10+ hours per month on property management. The automated payments are a game-changer!",
      author: "Sarah Johnson",
      role: "Landlord, 5 properties"
    },
    {
      quote: "As a tenant, I love how easy it is to submit maintenance requests and pay rent. No more chasing my landlord!",
      author: "Michael Chen",
      role: "Tenant"
    },
    {
      quote: "The financial reporting features made tax season so much easier. Worth every penny!",
      author: "David Wilson",
      role: "Property Manager"
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-teal-500 to-blue-600 bg-clip-text text-transparent">
            What Our Users Say
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Trusted by landlords and tenants nationwide
          </p>
        </motion.div>
        
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {testimonials.map((testimonial, index) => (
            <motion.div 
              key={index}
              className="bg-gray-50 p-6 rounded-xl border border-gray-200"
              variants={itemVariants}
              whileHover={{ y: -5 }}
            >
              <div className="text-teal-500 text-4xl mb-4">"</div>
              <p className="text-gray-700 italic mb-6">{testimonial.quote}</p>
              <div>
                <p className="font-semibold text-gray-800">{testimonial.author}</p>
                <p className="text-gray-600 text-sm">{testimonial.role}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// CTA Section Component
function CTASection() {
  return (
    <section className="py-20 bg-gradient-to-r from-teal-500 to-blue-600">
      <motion.div 
        className="max-w-4xl mx-auto px-4 text-center"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">
          Ready to Simplify Your Rental Management?
        </h2>
        <p className="text-xl text-teal-100 mb-8">
          Join thousands of satisfied landlords and tenants today
        </p>
        <motion.div 
          className="flex flex-col sm:flex-row gap-4 justify-center"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          <Link to="/auth/register">
            <Button size="lg" className="bg-white text-teal-600 hover:bg-gray-100 font-semibold">
              Get Started Free
            </Button>
          </Link>
          <Link to="/features">
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:bg-opacity-10">
              See All Features
            </Button>
          </Link>
        </motion.div>
      </motion.div>
    </section>
  );
}