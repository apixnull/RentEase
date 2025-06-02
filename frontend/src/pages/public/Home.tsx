// src/pages/Home.jsx
import { motion } from "framer-motion";
import { 
  Search, Heart, Star, MapPin, 
  Zap, ChevronRight, Key, 
  Smartphone, Check, Plus, 
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
    <div className="bg-gray-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-gray-900 to-gray-800 text-white overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-gray-900/90 to-gray-800/90 z-10"></div>
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80')] bg-cover bg-center opacity-30"></div>
          <div className="absolute top-20 -right-20 w-96 h-96 rounded-full bg-teal-500/20 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-gray-900 to-transparent z-10"></div>
        </div>
        
        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-28 md:py-36">
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center"
            variants={container}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={item}>
              <motion.div 
                className="flex items-center mb-6"
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
                className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6"
                variants={item}
              >
                Find Your Perfect <span className="text-teal-400">Rental</span> Hassle-Free
              </motion.h1>
              
              <motion.p 
                className="text-xl text-gray-300 mb-10 max-w-lg"
                variants={item}
              >
                Discover thousands of verified properties and move in with confidence. 
                The smart way to find your next home.
              </motion.p>
              
              <motion.div 
                className="flex flex-col sm:flex-row gap-4"
                variants={item}
              >
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 bg-gradient-to-r from-teal-500 to-blue-500 rounded-xl font-bold text-lg shadow-lg hover:shadow-teal-500/20 transition-all"
                >
                  Get Started
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 bg-gray-800 rounded-xl font-bold text-lg border border-gray-700 hover:bg-gray-700 transition-all"
                >
                  <span className="flex items-center">
                    How It Works <ChevronRight className="ml-2" size={20} />
                  </span>
                </motion.button>
              </motion.div>
            </motion.div>
            
            <motion.div 
              className="relative"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <div className="bg-gray-800 p-6">
                  <div className="bg-gray-700/50 rounded-lg p-4 mb-4">
                    <div className="flex justify-between mb-3">
                      <div className="bg-gray-600 rounded-full h-3 w-24"></div>
                      <div className="bg-gray-600 rounded-full h-3 w-8"></div>
                    </div>
                    <div className="bg-gradient-to-r from-teal-500 to-blue-500 rounded-lg h-64"></div>
                    <div className="mt-4">
                      <div className="bg-gray-600 rounded-full h-4 w-3/4 mb-2"></div>
                      <div className="bg-gray-600 rounded-full h-3 w-1/2"></div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-700/50 rounded-lg p-3">
                      <div className="bg-gray-600 rounded-lg h-32 mb-2"></div>
                      <div className="bg-gray-600 rounded-full h-3 w-3/4"></div>
                    </div>
                    <div className="bg-gray-700/50 rounded-lg p-3">
                      <div className="bg-gray-600 rounded-lg h-32 mb-2"></div>
                      <div className="bg-gray-600 rounded-full h-3 w-3/4"></div>
                    </div>
                  </div>
                </div>
              </div>
              
              <motion.div 
                className="absolute -bottom-6 -right-6 bg-white p-4 rounded-xl shadow-xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
              >
                <div className="flex items-center">
                  <div className="bg-teal-100 p-2 rounded-lg mr-3">
                    <Check className="text-teal-600" size={24} />
                  </div>
                  <div>
                    <p className="font-bold text-gray-800">Property Verified</p>
                    <p className="text-sm text-gray-600">24 hours ago</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <motion.div 
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-teal-500 to-blue-500 bg-clip-text text-transparent mb-2">50K+</div>
              <p className="text-gray-600">Properties Listed</p>
            </motion.div>
            
            <motion.div 
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-teal-500 to-blue-500 bg-clip-text text-transparent mb-2">120+</div>
              <p className="text-gray-600">Cities Covered</p>
            </motion.div>
            
            <motion.div 
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            >
              <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-teal-500 to-blue-500 bg-clip-text text-transparent mb-2">98%</div>
              <p className="text-gray-600">Customer Satisfaction</p>
            </motion.div>
            
            <motion.div 
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
            >
              <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-teal-500 to-blue-500 bg-clip-text text-transparent mb-2">24/7</div>
              <p className="text-gray-600">Support Available</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.h2 
              className="text-3xl md:text-4xl font-bold mb-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              Why Choose <span className="text-teal-500">RentEase</span>
            </motion.h2>
            <motion.p 
              className="text-xl text-gray-600 max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              Everything you need to find, tour, and secure your perfect rental
            </motion.p>
          </div>
          
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
            variants={container}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {features.map((feature, index) => (
              <motion.div 
                key={index}
                className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow"
                variants={item}
                whileHover={{ y: -10 }}
              >
                <div className="bg-teal-100 p-4 rounded-xl inline-block mb-6">
                  <feature.icon className="w-8 h-8 text-teal-600" />
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gradient-to-br from-gray-900 to-gray-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.h2 
              className="text-3xl md:text-4xl font-bold mb-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              How <span className="text-teal-400">RentEase</span> Works
            </motion.h2>
            <motion.p 
              className="text-xl text-gray-300 max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              Simple steps to find and secure your perfect rental
            </motion.p>
          </div>
          
          <div className="relative">
            <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-700 transform -translate-y-1/2 hidden md:block"></div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
              {steps.map((step, index) => (
                <motion.div 
                  key={index}
                  className="bg-gray-800/50 p-8 rounded-2xl border border-gray-700 backdrop-blur-sm"
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.2 }}
                >
                  <div className="flex flex-col items-center text-center">
                    <div className="bg-teal-900/20 p-4 rounded-full mb-6 relative">
                      <div className="bg-teal-500 rounded-full w-16 h-16 flex items-center justify-center">
                        <step.icon className="w-8 h-8 text-white" />
                      </div>
                      <div className="absolute top-0 right-0 bg-teal-500 text-white rounded-full w-8 h-8 flex items-center justify-center">
                        {index + 1}
                      </div>
                    </div>
                    <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                    <p className="text-gray-300">{step.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.h2 
              className="text-3xl md:text-4xl font-bold mb-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              What Our <span className="text-teal-500">Customers</span> Say
            </motion.h2>
            <motion.p 
              className="text-xl text-gray-600 max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              Join thousands of happy renters who found their perfect home
            </motion.p>
          </div>
          
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
            variants={container}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {testimonials.map((testimonial, index) => (
              <motion.div 
                key={index}
                className="bg-gray-50 p-8 rounded-2xl border border-gray-100"
                variants={item}
                whileHover={{ y: -10 }}
              >
                <div className="flex mb-6">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`w-5 h-5 ${i < testimonial.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                    />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 italic">"{testimonial.text}"</p>
                <div className="flex items-center">
                  <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16" />
                  <div className="ml-4">
                    <h4 className="font-bold">{testimonial.name}</h4>
                    <p className="text-gray-600">{testimonial.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-teal-500 to-blue-500 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <motion.h2 
              className="text-3xl md:text-4xl font-bold mb-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              Ready to Find Your Dream Rental?
            </motion.h2>
            <motion.p 
              className="text-xl mb-10 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              Join thousands of satisfied renters and start your journey today
            </motion.p>
            
            <motion.div 
              className="flex flex-col sm:flex-row justify-center gap-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-white text-teal-600 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all"
              >
                Get Started Now
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-transparent border-2 border-white rounded-xl font-bold text-lg hover:bg-white/10 transition-all"
              >
                <span className="flex items-center justify-center">
                  Schedule a Demo <ChevronRight className="ml-2" size={20} />
                </span>
              </motion.button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <motion.h2 
                className="text-3xl md:text-4xl font-bold mb-4"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                Frequently Asked <span className="text-teal-500">Questions</span>
              </motion.h2>
              <motion.p 
                className="text-xl text-gray-600 max-w-3xl mx-auto"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
              >
                Everything you need to know about RentEase
              </motion.p>
            </div>
            
            <motion.div 
              className="space-y-4"
              variants={container}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {faqs.map((faq, index) => (
                <motion.div 
                  key={index}
                  className="bg-white rounded-xl shadow-md overflow-hidden"
                  variants={item}
                >
                  <div className="p-6 cursor-pointer">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-bold text-gray-800">{faq.question}</h3>
                      <Plus className="text-teal-500" size={24} />
                    </div>
                    <p className="mt-4 text-gray-600">{faq.answer}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;