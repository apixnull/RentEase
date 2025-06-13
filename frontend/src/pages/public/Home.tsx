// src/pages/Home.jsx
import { motion } from "framer-motion";
import { 
  Search, Heart, Star, MapPin, 
  Zap, ChevronRight, Key, 
  Smartphone, Check, Plus, 
  Home as HomeIcon, Users, Calendar, ShieldCheck
} from "lucide-react";

const Home = () => {
  // Animation variants
  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
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

  // Features data
  const features = [
    { icon: Search, title: "Smart Search", desc: "AI-powered property matching" },
    { icon: Heart, title: "Save Favorites", desc: "Bookmark properties you love" },
    { icon: Star, title: "Verified Listings", desc: "100% authentic properties" },
    { icon: MapPin, title: "Neighborhood Insights", desc: "Know the area before you rent" },
  ];

  // How it works steps
  const steps = [
    { icon: Search, title: "Search", desc: "Find properties that match your needs" },
    { icon: Heart, title: "Save", desc: "Shortlist your favorite options" },
    { icon: Smartphone, title: "Contact", desc: "Message owners directly" },
    { icon: Key, title: "Move In", desc: "Sign digitally and move in" },
  ];

  // Testimonials
  const testimonials = [
    { name: "Sarah J.", role: "Software Engineer", text: "Found my dream apartment in 3 days! The virtual tours saved me so much time.", rating: 5 },
    { name: "Michael T.", role: "University Student", text: "Perfect room near campus. The roommate matching feature is genius!", rating: 4 },
    { name: "Emma L.", role: "Marketing Director", text: "Relocated for work and RentEase made it stress-free. Highly recommend!", rating: 5 },
  ];

  // FAQ items
  const faqs = [
    { question: "How do I verify my account?", answer: "Upload a government ID and complete our verification process." },
    { question: "Is there a fee to list my property?", answer: "Listing is free. We charge a small commission only after successful rental." },
    { question: "How does the digital signing work?", answer: "We use bank-level encryption for all documents. Sign with just a few clicks." },
    { question: "Can I schedule multiple viewings?", answer: "Yes! Our calendar system lets you book multiple viewings in one go." },
  ];

  return (
    <div className="bg-gray-50 overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center py-16">
        {/* Blob backgrounds */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div 
            className="absolute -top-40 -left-40 w-[800px] h-[800px] rounded-full bg-gradient-to-r from-teal-200 to-blue-300 blur-3xl opacity-30"
            animate={{
              scale: [1, 1.2, 1],
              x: [-50, -100, -50],
              y: [-50, -100, -50],
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              repeatType: "reverse"
            }}
          />
          <motion.div 
            className="absolute -bottom-60 -right-60 w-[700px] h-[700px] rounded-full bg-gradient-to-r from-blue-200 to-teal-300 blur-3xl opacity-30"
            animate={{
              scale: [1, 1.3, 1],
              x: [50, 100, 50],
              y: [50, 100, 50],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              repeatType: "reverse"
            }}
          />
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <motion.div 
            className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
            variants={container}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={item} className="text-center lg:text-left">
              <motion.div 
                className="flex justify-center lg:justify-start items-center mb-6"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <motion.div
                  animate={{ 
                    rotate: [0, 5, -5, 3, 0],
                    scale: [1, 1.1, 1.05, 1.08, 1],
                    transition: { 
                      duration: 1.5,
                      repeat: Infinity,
                      repeatType: "reverse"
                    }
                  }}
                  className="mr-3"
                >
                  <Zap className="w-8 h-8 text-teal-400" fill="currentColor" />
                </motion.div>
                <motion.span 
                  className="text-2xl font-bold bg-gradient-to-r from-teal-400 to-blue-400 bg-clip-text text-transparent"
                  animate={{
                    backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                  }}
                  transition={{
                    backgroundPosition: {
                      duration: 4,
                      repeat: Infinity,
                      ease: "linear"
                    }
                  }}
                >
                  RentEase
                </motion.span>
              </motion.div>
              
              <motion.h1 
                className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight mb-6"
                variants={item}
              >
                Find Your Perfect <span className="text-teal-500">Rental</span> Hassle-Free
              </motion.h1>
              
              <motion.p 
                className="text-lg sm:text-xl text-gray-600 mb-10 max-w-xl mx-auto lg:mx-0"
                variants={item}
              >
                Discover thousands of verified properties and move in with confidence. 
                The smart way to find your next home.
              </motion.p>
              
              <motion.div 
                className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
                variants={item}
              >
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 py-3 sm:px-8 sm:py-4 bg-gradient-to-r from-teal-500 to-blue-500 rounded-xl font-bold text-lg shadow-lg hover:shadow-teal-500/20 transition-all"
                >
                  Get Started
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 py-3 sm:px-8 sm:py-4 bg-white border border-gray-200 rounded-xl font-bold text-lg hover:bg-gray-50 transition-all"
                >
                  <span className="flex items-center justify-center">
                    How It Works <ChevronRight className="ml-2" size={20} />
                  </span>
                </motion.button>
              </motion.div>
              
              <motion.div 
                className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-xl mx-auto lg:mx-0"
                variants={container}
              >
                {[
                  { icon: HomeIcon, value: "50K+", label: "Properties" },
                  { icon: Users, value: "120+", label: "Cities" },
                  { icon: Calendar, value: "98%", label: "Satisfaction" },
                  { icon: ShieldCheck, value: "24/7", label: "Support" }
                ].map((stat, index) => (
                  <motion.div 
                    key={index}
                    className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm"
                    variants={item}
                    whileHover={{ y: -5 }}
                  >
                    <stat.icon className="w-8 h-8 text-teal-500 mx-auto mb-2" />
                    <p className="text-xl font-bold text-gray-800">{stat.value}</p>
                    <p className="text-sm text-gray-600">{stat.label}</p>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
            
            <motion.div 
              className="relative"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className="bg-white rounded-3xl shadow-xl overflow-hidden max-w-lg mx-auto">
                <div className="p-6">
                  <div className="bg-gray-100 rounded-xl p-4 mb-4">
                    <div className="flex justify-between mb-3">
                      <div className="bg-gray-300 rounded-full h-3 w-24"></div>
                      <div className="bg-gray-300 rounded-full h-3 w-8"></div>
                    </div>
                    <div className="bg-gradient-to-r from-teal-500 to-blue-500 rounded-xl h-64 flex items-center justify-center">
                      <Zap className="w-16 h-16 text-white" />
                    </div>
                    <div className="mt-4">
                      <div className="bg-gray-300 rounded-full h-4 w-3/4 mx-auto mb-2"></div>
                      <div className="bg-gray-300 rounded-full h-3 w-1/2 mx-auto"></div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    {[1, 2].map((item) => (
                      <div key={item} className="bg-gray-100 rounded-xl p-3">
                        <div className="bg-gray-300 rounded-xl h-32 mb-2 flex items-center justify-center">
                          <Zap className="w-8 h-8 text-gray-500" />
                        </div>
                        <div className="bg-gray-300 rounded-full h-3 w-3/4 mx-auto"></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <motion.div 
                className="absolute -bottom-4 -right-4 bg-white p-3 rounded-xl shadow-lg border border-gray-100"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
              >
                <div className="flex items-center">
                  <div className="bg-teal-100 p-2 rounded-lg mr-2">
                    <Check className="text-teal-600" size={20} />
                  </div>
                  <div>
                    <p className="font-bold text-sm text-gray-800">Property Verified</p>
                    <p className="text-xs text-gray-600">24 hours ago</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 relative">
        <div className="absolute inset-0 overflow-hidden">
          <motion.div 
            className="absolute top-1/3 left-1/4 w-[600px] h-[600px] rounded-full bg-gradient-to-r from-blue-100 to-teal-100 blur-3xl opacity-40"
            animate={{
              scale: [1, 1.2, 1],
            }}
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

      {/* How It Works */}
      <section className="py-16 bg-gray-50 relative">
        <div className="absolute inset-0 overflow-hidden">
          <motion.div 
            className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full bg-gradient-to-r from-teal-100 to-blue-100 blur-3xl opacity-30"
            animate={{
              scale: [1, 1.1, 1],
            }}
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

      {/* Testimonials */}
      <section className="py-16 relative">
        <div className="absolute inset-0 overflow-hidden">
          <motion.div 
            className="absolute top-1/3 right-1/4 w-[500px] h-[500px] rounded-full bg-gradient-to-r from-blue-100 to-teal-100 blur-3xl opacity-30"
            animate={{
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 15,
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
              What Our <span className="text-teal-500">Customers</span> Say
            </motion.h2>
            <motion.p 
              className="text-lg text-gray-600 max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ delay: 0.1 }}
            >
              Join thousands of happy renters who found their perfect home
            </motion.p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <motion.div 
                key={index}
                className="bg-white p-6 rounded-2xl shadow-md border border-gray-100"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`w-4 h-4 ${i < testimonial.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                    />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 text-sm">"{testimonial.text}"</p>
                <div className="flex items-center">
                  <div className="bg-gray-200 border-2 border-dashed rounded-xl w-12 h-12" />
                  <div className="ml-4">
                    <h4 className="font-bold">{testimonial.name}</h4>
                    <p className="text-gray-600 text-sm">{testimonial.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-teal-500 to-blue-500 text-white relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <motion.div 
            className="absolute top-1/3 left-1/4 w-[600px] h-[600px] rounded-full bg-gradient-to-r from-teal-400/20 to-blue-400/20 blur-3xl"
            animate={{
              scale: [1, 1.3, 1],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              repeatType: "reverse"
            }}
          />
        </div>
        
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h2 
            className="text-2xl md:text-3xl font-bold mb-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
          >
            Ready to Find Your Dream Rental?
          </motion.h2>
          <motion.p 
            className="text-lg mb-10 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ delay: 0.1 }}
          >
            Join thousands of satisfied renters and start your journey today
          </motion.p>
          
          <motion.div 
            className="flex flex-col sm:flex-row justify-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ delay: 0.2 }}
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3 bg-white text-teal-600 rounded-xl font-bold shadow-md hover:shadow-lg transition-all"
            >
              Get Started Now
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3 bg-transparent border-2 border-white rounded-xl font-bold hover:bg-white/10 transition-all"
            >
              <span className="flex items-center justify-center">
                Schedule a Demo <ChevronRight className="ml-2" size={20} />
              </span>
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-gray-50 relative">
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.h2 
              className="text-2xl md:text-3xl font-bold mb-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
            >
              Frequently Asked <span className="text-teal-500">Questions</span>
            </motion.h2>
            <motion.p 
              className="text-lg text-gray-600 max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ delay: 0.1 }}
            >
              Everything you need to know about RentEase
            </motion.p>
          </div>
          
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <motion.div 
                key={index}
                className="bg-white p-5 rounded-xl shadow-sm border border-gray-100"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="flex justify-between items-center cursor-pointer">
                  <h3 className="text-lg font-bold text-gray-800">{faq.question}</h3>
                  <Plus className="text-teal-500" size={20} />
                </div>
                <p className="mt-4 text-gray-600 text-sm">{faq.answer}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;