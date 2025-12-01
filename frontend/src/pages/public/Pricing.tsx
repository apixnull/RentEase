import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { 
  Check, Users, Building, Zap, ArrowRight,
  Gift, Crown, Eye
} from "lucide-react";
import { Card } from "@/components/ui/card";

const Pricing = () => {
  return (
    <div className="bg-gray-50">
      <HeroSection />
      <TenantPricingSection />
      <LandlordPricingSection />
      <FAQSection />
      <CTASection />
    </div>
  );
};

/* ****************** HERO SECTION ****************** */
const HeroSection = () => {
  return (
    <section className="relative min-h-[50vh] flex items-center py-16 overflow-hidden bg-gradient-to-br from-emerald-600 via-emerald-500 to-sky-600">
      <div className="absolute inset-0 overflow-hidden z-0">
        {[...Array(10)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              width: `${Math.random() * 50 + 15}px`,
              height: `${Math.random() * 50 + 15}px`,
              backgroundColor: "rgba(255, 255, 255, 0.1)"
            }}
            animate={{
              y: [0, (Math.random() - 0.5) * 60, 0],
              x: [0, (Math.random() - 0.5) * 60, 0],
              rotate: [0, 360],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
            <Gift className="w-5 h-5 text-white" />
            <span className="text-sm font-medium text-white">Simple & Transparent Pricing</span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 text-white leading-tight">
            Pricing That <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-yellow-400">Works for Everyone</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-emerald-50 max-w-4xl mx-auto mb-8 leading-relaxed">
            Students get everything free. Landlords only pay for listing their units. 
            No hidden fees, no surprises—just transparent pricing.
          </p>
        </motion.div>
      </div>
    </section>
  );
};

/* ****************** TENANT PRICING SECTION ****************** */
const TenantPricingSection = () => {
  const features = [
    "Browse all available units in Cebu Province",
    "AI-powered property search chatbot",
    "Direct communication with landlords",
    "Transparent payment tracking",
    "Digital lease agreements",
    "Maintenance request system",
    "View property details and photos",
    "No credit card required",
    "No subscription fees",
    "No hidden charges"
  ];

  return (
    <section className="py-16 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 bg-sky-50 px-4 py-2 rounded-full mb-6">
            <Crown className="w-5 h-5 text-sky-600" />
            <span className="text-sm font-medium text-sky-700">VIP Customers</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            For Students: <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-600 to-blue-600">100% Free</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Students are our main focus. Everything you need to find and manage your rental is completely free—forever.
          </p>
        </motion.div>
        
        <div className="max-w-4xl mx-auto">
          <Card className="p-8 bg-gradient-to-br from-sky-50 to-white border-2 border-sky-200 rounded-2xl shadow-xl relative overflow-hidden">
            <div className="absolute top-4 right-4 bg-sky-600 text-white text-xs font-bold px-3 py-1 rounded-full">
              VIP
            </div>
            
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-sky-600 rounded-full mb-4">
                <Users className="w-10 h-10 text-white" />
              </div>
              <div className="text-5xl font-bold text-sky-600 mb-2">₱0</div>
              <p className="text-xl text-gray-600">Forever Free</p>
              <p className="text-sm text-gray-500 mt-2">No credit card required</p>
            </div>
            
            <div className="space-y-3 mb-8">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-start gap-3"
                >
                  <Check className="w-5 h-5 text-sky-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">{feature}</span>
                </motion.div>
              ))}
            </div>
            
            <div className="bg-sky-100 p-4 rounded-lg border border-sky-200">
              <p className="text-sm text-sky-800 text-center">
                <strong>Why free for students?</strong> You're our main customers. The more students we help, 
                the more landlords join our platform. It's a win-win for everyone!
              </p>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
};

/* ****************** LANDLORD PRICING SECTION ****************** */
const LandlordPricingSection = () => {
  const freeFeatures = [
    "Property and unit management",
    "Financial tracking and dashboard",
    "Rent payment management",
    "Tenant screening tools",
    "Digital lease management",
    "Direct messaging with tenants",
    "Maintenance request handling",
    "Reports and analytics"
  ];

  return (
    <section className="py-16 bg-gradient-to-br from-emerald-50 to-sky-50 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <motion.div 
          className="absolute top-1/4 right-1/4 w-[500px] h-[500px] rounded-full bg-gradient-to-r from-emerald-200 to-sky-200 blur-3xl opacity-40"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{
            duration: 12,
            repeat: Infinity,
            repeatType: "reverse"
          }}
        />
      </div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 bg-emerald-50 px-4 py-2 rounded-full mb-6">
            <Building className="w-5 h-5 text-emerald-600" />
            <span className="text-sm font-medium text-emerald-700">For Landlords</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            For Landlords: <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600">Free + Optional Listings</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            All management tools are free. Only pay when you want to advertise your units publicly to reach more tenants.
          </p>
        </motion.div>
        
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Standard Listing */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Card className="p-8 bg-white border-2 border-gray-200 rounded-2xl shadow-lg h-full">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-full mb-4">
                  <Eye className="w-8 h-8 text-emerald-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Standard Listing</h3>
                <div className="text-4xl font-bold text-emerald-600 mb-1">₱100</div>
                <p className="text-gray-600">per unit</p>
                <p className="text-sm text-gray-500 mt-2">90 days visibility</p>
              </div>
              
              <ul className="space-y-3 mb-6">
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Unit visible to all tenants</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Appears in search results</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">90 days of visibility</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">All standard features included</span>
                </li>
              </ul>
            </Card>
          </motion.div>
          
          {/* Featured Listing */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <Card className="p-8 bg-gradient-to-br from-emerald-600 to-teal-600 text-white border-2 border-emerald-500 rounded-2xl shadow-xl h-full relative overflow-hidden">
              <div className="absolute top-4 right-4 bg-yellow-400 text-emerald-900 text-xs font-bold px-3 py-1 rounded-full">
                POPULAR
              </div>
              
              <div className="relative z-10">
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full mb-4">
                    <Zap className="w-8 h-8 text-yellow-300" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">Featured Listing</h3>
                  <div className="text-4xl font-bold mb-1">₱150</div>
                  <p className="text-emerald-100">per unit</p>
                  <p className="text-sm text-emerald-200 mt-2">90 days visibility + Priority</p>
                </div>
                
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-yellow-300 flex-shrink-0 mt-0.5" />
                    <span>Everything in Standard Listing</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-yellow-300 flex-shrink-0 mt-0.5" />
                    <span><strong>Priority display</strong> in search results</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-yellow-300 flex-shrink-0 mt-0.5" />
                    <span><strong>Boosted visibility</strong> - appears first</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-yellow-300 flex-shrink-0 mt-0.5" />
                    <span>90 days of premium visibility</span>
                  </li>
                </ul>
              </div>
            </Card>
          </motion.div>
        </div>
        
        {/* Free Features for Landlords */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <Card className="p-8 bg-white border-2 border-emerald-100 rounded-2xl shadow-md">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-full mb-4">
                <Gift className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">All Management Tools: Free</h3>
              <p className="text-gray-600">Everything you need to manage your rentals is completely free</p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              {freeFeatures.map((feature, index) => (
                <div key={index} className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">{feature}</span>
                </div>
              ))}
            </div>
            
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200">
                <p className="text-sm text-emerald-800 text-center">
                  <strong>No hidden fees!</strong> The only payment required is for listing/advertising your units. 
                  All other features are completely free.
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </section>
  );
};

/* ****************** FAQ SECTION ****************** */
const FAQSection = () => {
  const faqs = [
    {
      question: "Do students really get everything for free?",
      answer: "Yes! Students are our main customers. All features including AI search, communication, payment tracking, and lease management are completely free—forever. No credit card required."
    },
    {
      question: "What's the difference between Standard and Featured listing?",
      answer: "Standard listing (₱100) makes your unit visible to all tenants for 90 days. Featured listing (₱150) includes everything in Standard plus priority display—your unit appears first in search results, giving you better visibility and more leads."
    },
    {
      question: "How long does a listing last?",
      answer: "Both Standard and Featured listings last for 90 days. After that, you can renew if you want to continue advertising the unit."
    },
    {
      question: "Are there any other fees for landlords?",
      answer: "No! The only payment required is for listing/advertising your units. All management tools, financial tracking, tenant screening, messaging, and other features are completely free."
    },
    {
      question: "Can I list multiple units?",
      answer: "Yes! You can list as many units as you want. Each unit listing is priced separately (₱100 for Standard or ₱150 for Featured per unit)."
    },
    {
      question: "What happens if I don't want to list my units?",
      answer: "You can still use all the free management tools! Listing is optional—only pay when you want to advertise your units publicly to reach more tenants."
    }
  ];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Frequently Asked <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-sky-600">Questions</span>
          </h2>
          <p className="text-lg text-gray-600">
            Everything you need to know about our pricing
          </p>
        </motion.div>
        
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Card className="p-6 bg-gray-50 border border-gray-200 rounded-xl">
                <h3 className="font-bold text-lg text-gray-900 mb-2">{faq.question}</h3>
                <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ****************** CTA SECTION ****************** */
const CTASection = () => {
  const navigate = useNavigate();
  
  return (
    <motion.section 
      className="py-16 bg-gradient-to-r from-emerald-600 to-sky-600 text-white relative overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
    >
      <div className="absolute inset-0 overflow-hidden">
        <motion.div 
          className="absolute top-1/2 left-1/2 w-[600px] h-[600px] rounded-full bg-white/10 blur-3xl"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{
            duration: 10,
            repeat: Infinity,
            repeatType: "reverse"
          }}
        />
      </div>
      
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Get Started?</h2>
        <p className="text-lg text-emerald-50 max-w-2xl mx-auto mb-8">
          Join RentEase today. Students get everything free, and landlords only pay for listings.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <motion.button
            onClick={() => navigate("/auth/register")}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-4 bg-white text-emerald-600 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all flex items-center gap-2 justify-center"
          >
            <Users className="w-5 h-5" />
            <span>Start Free as Student</span>
            <ArrowRight className="w-5 h-5" />
          </motion.button>
          <motion.button
            onClick={() => navigate("/auth/register")}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-4 bg-emerald-700/30 backdrop-blur-sm border-2 border-white/30 text-white rounded-xl font-bold hover:bg-emerald-700/40 transition-all flex items-center gap-2 justify-center"
          >
            <Building className="w-5 h-5" />
            <span>Start as Landlord</span>
            <ArrowRight className="w-5 h-5" />
          </motion.button>
        </div>
      </div>
    </motion.section>
  );
};

export default Pricing;
