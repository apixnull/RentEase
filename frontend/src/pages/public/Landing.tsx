import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Search, Star, MapPin, Zap, Building, Key, MessageCircle, Users, FileText, Eye, Globe, Bot, Wrench, DollarSign, BarChart3, Shield } from "lucide-react";

/* ****************** LANDING ****************** */
const Landing = () => {
  return (
    <div className="bg-gray-50">
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <ForLandlordsSection />
      <CTASection />
    </div>
  );
}

/* ****************** CTA SECTION ****************** */
const CTASection = () => {
  const navigate = useNavigate();
  
  return (
    <section className="py-16 bg-gradient-to-r from-emerald-600 to-sky-600 text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-2xl md:text-3xl font-bold mb-6">
          Ready to Find Your Student Rental in Cebu?
        </h2>
        <p className="text-lg mb-10 max-w-2xl mx-auto">
          Join students and landlords across Cebu Province. Start your rental journey today.
        </p>
        
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <motion.button 
            onClick={() => navigate("/auth/register")}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-6 py-3 bg-white text-emerald-600 rounded-xl font-bold shadow-md hover:shadow-lg transition-all"
          >
            Get Started Now
          </motion.button>
        </div>
      </div>
    </section>
  );
};


/* ****************** FEATURES SECTION ****************** */
const FeaturesSection = () => {
  const features = [
    { icon: Bot, title: "AI Chatbot Search", desc: "Instead of typing searches, chat naturally with our AI assistant. Describe what you need and get instant property matches in Cebu." },
    { icon: Eye, title: "Transparent Payments", desc: "Both tenants and landlords can see all payment history. Avoid losses and ensure fairness." },
    { icon: MessageCircle, title: "Direct Communication", desc: "Chat directly with landlords. Ask questions and get responses quickly." },
    { icon: Wrench, title: "Structured Maintenance Reports", desc: "Report unit issues easily. Unlike other informal platforms where requests get lost, your maintenance reports stay focused and visible to landlords." },
  ];

  return (
    <section className="py-16 relative">
      <div className="absolute inset-0 overflow-hidden">
        <motion.div 
          className="absolute top-1/3 left-1/4 w-[600px] h-[600px] rounded-full bg-gradient-to-r from-emerald-100 to-sky-100 blur-3xl opacity-40"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{
            duration: 12,
            repeat: Infinity,
            repeatType: "reverse"
          }}
        />
      </div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Why Choose <span className="text-emerald-600">RentEase</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Complete transparency for both tenants and landlords. Fair, safe, and digital-first rental experience.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div 
              key={index}
              className="bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition-shadow border border-gray-100"
              whileHover={{ y: -10 }}
            >
              <div className="bg-emerald-50 p-3 rounded-lg inline-block mb-4">
                <feature.icon className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
              <p className="text-gray-600 text-sm">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
        
        {/* Community Inclusion Section */}
        <div className="mt-16 bg-gradient-to-r from-emerald-50 to-sky-50 rounded-2xl p-8 border border-emerald-100">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="bg-emerald-100 p-4 rounded-full">
              <Globe className="w-8 h-8 text-emerald-600" />
            </div>
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Building Digital Community Inclusion
              </h3>
              <p className="text-gray-700">
                RentEase is more than a platform—we're helping the Cebu community embrace digital transformation. 
                By moving rental processes online, we're making housing more accessible, transparent, and safe for everyone. 
                Join us in building a better, more connected rental community in Cebu Province.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

/* ****************** HERO SECTION ****************** */
const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-screen flex items-center py-16 overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden z-0">
        {/* Floating particles */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-gradient-to-r from-emerald-300/20 to-sky-300/20"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              width: `${Math.random() * 60 + 10}px`,
              height: `${Math.random() * 60 + 10}px`,
            }}
            animate={{
              y: [0, (Math.random() - 0.5) * 80, 0],
              x: [0, (Math.random() - 0.5) * 80, 0],
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
        
        {/* Animated grid */}
        <div className="absolute inset-0 opacity-[3%]">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <pattern id="grid" width="80" height="80" patternUnits="userSpaceOnUse">
              <path d="M 80 0 L 0 0 0 80" fill="none" stroke="currentColor" strokeWidth="1" />
            </pattern>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>
      </div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-3 bg-emerald-50 px-4 py-2 rounded-full mb-6">
              <motion.span
                animate={{ 
                  rotate: [0, 10, -10, 5, 0],
                  scale: [1, 1.1, 1.05, 1.08, 1],
                  transition: { 
                    duration: 1.5,
                    repeat: Infinity,
                    repeatType: "reverse" as const
                  }
                }}
              >
                <Zap className="w-6 h-6 text-emerald-600" fill="currentColor" />
              </motion.span>
              <span className="text-sm font-medium text-gray-700">
                The smart way to find rentals in Cebu
              </span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight mb-6">
              Your Perfect <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-sky-600">Student Rental</span> in Cebu, Right Here
            </h1>
            
            <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto lg:mx-0">
              Browse all available rentals in Cebu Province from anywhere. See everything upfront—transparent payments, direct landlord chat, and digital lease agreements. 
              <span className="font-semibold text-gray-900"> Everything you need, all in one place.</span>
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <motion.button
                onClick={() => navigate("/auth/login")}
                whileHover={{ 
                  scale: 1.05,
                  boxShadow: "0 10px 25px -5px rgba(16, 185, 129, 0.3)"
                }}
                whileTap={{ scale: 0.95 }}
                className="px-7 py-4 bg-gradient-to-r from-emerald-600 to-sky-600 rounded-xl font-bold text-lg text-white shadow-lg flex items-center gap-2"
              >
                <Search className="w-5 h-5" />
                <span>Find Units</span>
              </motion.button>
              <motion.button
                onClick={() => {
                  const element = document.getElementById('for-landlords');
                  element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
                whileHover={{ 
                  scale: 1.05,
                  backgroundColor: "#f9fafb"
                }}
                whileTap={{ scale: 0.95 }}
                className="px-7 py-4 bg-white border border-gray-200 rounded-xl font-bold text-lg flex items-center gap-2"
              >
                <Users className="w-5 h-5" />
                <span>List Your Property</span>
              </motion.button>
            </div>
            
            {/* Key Features - Transparency Focus */}
            <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl">
              <div className="flex items-center gap-3 bg-white/80 backdrop-blur-sm px-4 py-3 rounded-lg border border-gray-200">
                <div className="bg-emerald-100 p-2 rounded-lg">
                  <Eye className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">Visible Payment Tracking</p>
                  <p className="text-xs text-gray-600">Both parties see all transactions</p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-white/80 backdrop-blur-sm px-4 py-3 rounded-lg border border-gray-200">
                <div className="bg-emerald-100 p-2 rounded-lg">
                  <MessageCircle className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">Direct Communication</p>
                  <p className="text-xs text-gray-600">Chat with landlords easily</p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-white/80 backdrop-blur-sm px-4 py-3 rounded-lg border border-gray-200">
                <div className="bg-emerald-100 p-2 rounded-lg">
                  <FileText className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">Visible Lease Agreement</p>
                  <p className="text-xs text-gray-600">Fair & transparent terms</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Right Content - Unit Cards (Layered) */}
          <div className="relative flex justify-center lg:justify-end" style={{ minHeight: '500px' }}>
            {/* Background Card 1 */}
            <motion.div 
              className="absolute bg-white rounded-2xl shadow-lg overflow-hidden max-w-sm w-full border border-gray-100"
              style={{ 
                zIndex: 1,
                left: '-40px',
                top: '40px',
                opacity: 0.9,
                transform: 'rotate(-3deg)',
              }}
              animate={{
                y: [0, -10, 0],
              }}
              transition={{
                duration: 4.5,
                repeat: Infinity,
                repeatType: "reverse" as const,
                ease: "easeInOut",
                delay: 0.5
              }}
            >
              <div className="relative aspect-[4/3] bg-gray-50 overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                  alt="Student apartment"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-1">Cozy Boarding House</h3>
                <p className="text-xs text-gray-600 mb-1.5">
                  <Building className="w-3 h-3 inline mr-1" />
                  Boarding House • Unit 2B
                </p>
                <div className="flex items-center text-gray-500 text-xs mb-3">
                  <MapPin className="w-3 h-3 mr-1" />
                  <span className="line-clamp-1">Mandaue City, Cebu</span>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <div className="flex items-baseline gap-1">
                    <span className="font-bold text-gray-900 text-lg">₱6,500</span>
                    <span className="text-xs text-gray-500">/mo</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Background Card 2 */}
            <motion.div 
              className="absolute bg-white rounded-2xl shadow-lg overflow-hidden max-w-sm w-full border border-gray-100"
              style={{ 
                zIndex: 2,
                right: '-120px',
                top: '40px',
                opacity: 0.9,
                transform: 'rotate(4deg)',
              }}
              animate={{
                y: [0, -12, 0],
              }}
              transition={{
                duration: 4.2,
                repeat: Infinity,
                repeatType: "reverse" as const,
                ease: "easeInOut",
                delay: 0.3
              }}
            >
              <div className="relative aspect-[4/3] bg-gray-50 overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                  alt="Student apartment"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-1">Modern Condo Unit</h3>
                <p className="text-xs text-gray-600 mb-1.5">
                  <Building className="w-3 h-3 inline mr-1" />
                  Condominium • Unit 5C
                </p>
                <div className="flex items-center text-gray-500 text-xs mb-3">
                  <MapPin className="w-3 h-3 mr-1" />
                  <span className="line-clamp-1">Lapu-Lapu City, Cebu</span>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <div className="flex items-baseline gap-1">
                    <span className="font-bold text-gray-900 text-lg">₱12,000</span>
                    <span className="text-xs text-gray-500">/mo</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Main Card (Front) */}
            <motion.div 
              className="relative bg-white rounded-2xl shadow-xl overflow-hidden max-w-sm w-full border border-gray-100"
              style={{ zIndex: 3 }}
              animate={{
                y: [0, -15, 0],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                repeatType: "reverse" as const,
                ease: "easeInOut"
              }}
            >
              {/* Unit Image */}
              <div className="relative aspect-[4/3] bg-gray-50 overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                  alt="Student apartment in Cebu"
                  className="h-full w-full object-cover"
                />
              </div>
              
              {/* Unit Details */}
              <div className="p-4">
                <div className="mb-2">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-1">Student-Friendly Apartment</h3>
                  <p className="text-xs text-gray-600 mb-1.5">
                    <Building className="w-3 h-3 inline mr-1" />
                    Apartment • Unit 3A
                  </p>
                  <div className="flex items-center text-gray-500 text-xs">
                    <MapPin className="w-3 h-3 mr-1" />
                    <span className="line-clamp-1">Cebu City, Cebu Province</span>
                  </div>
                </div>
                
                {/* Rating Section */}
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-md border border-amber-200">
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star 
                          key={star} 
                          className={`w-3 h-3 ${star <= 4 ? 'fill-amber-400 text-amber-400' : 'fill-gray-200 text-gray-200'}`} 
                        />
                      ))}
                    </div>
                    <span className="text-xs font-bold text-amber-700 ml-1">4.5</span>
                  </div>
                  <span className="text-xs text-gray-500">(5)</span>
                </div>
                
                {/* Viewers Section */}
                <div className="flex items-center gap-2 mb-3 pb-3 border-b border-gray-100">
                  <div className="flex -space-x-1.5">
                    {[1, 2, 3, 4].map((index) => (
                      <img
                        key={index}
                        src={`https://i.pravatar.cc/150?img=${index + 10}`}
                        alt={`Viewer ${index}`}
                        className="w-6 h-6 rounded-full border-2 border-white object-cover"
                      />
                    ))}
                  </div>
                  <div className="text-xs text-gray-600">
                    <span className="font-medium">24</span> viewed
                  </div>
                </div>
                
                {/* Price Section */}
                <div className="flex items-center justify-between">
                  <div className="flex items-baseline gap-1">
                    <span className="font-bold text-gray-900 text-lg">₱8,500</span>
                    <span className="text-xs text-gray-500">/mo</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

/* ****************** HOW IT WORKS SECTION ****************** */
const HowItWorksSection = () => {
  const steps = [
    { icon: Bot, title: "AI-Powered Search", desc: "Chat with our AI assistant to find units. No need to type complex searches—just talk naturally." },
    { icon: MessageCircle, title: "Chat Directly", desc: "Message landlords with questions. Get instant responses." },
    { icon: Key, title: "Lease Transparently", desc: "View and sign digital lease agreements. Track payments together." },
    { icon: Wrench, title: "Easy Maintenance", desc: "Report unit issues easily. Structured requests ensure landlords see them immediately." },
  ];

  return (
    <section className="py-16 bg-gray-50 relative">
      <div className="absolute inset-0 overflow-hidden">
        <motion.div 
          className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full bg-gradient-to-r from-emerald-100 to-sky-100 blur-3xl opacity-30"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{
            duration: 10,
            repeat: Infinity,
            repeatType: "reverse"
          }}
        />
      </div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            How <span className="text-emerald-600">RentEase</span> Works
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            A simple, safe, and transparent way to find and secure your rental in Cebu—all from the comfort of your home
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, index) => (
            <motion.div 
              key={index}
              className="bg-white p-6 rounded-2xl shadow-md border border-gray-100"
              whileHover={{ y: -5 }}
            >
              <div className="flex flex-col items-center text-center">
                <div className="bg-emerald-500 rounded-full w-12 h-12 flex items-center justify-center text-white mb-4">
                  <span className="font-bold">{index + 1}</span>
                </div>
                <div className="bg-emerald-100 p-3 rounded-full mb-4">
                  <step.icon className="w-6 h-6 text-emerald-600" />
                </div>
                <h3 className="text-lg font-bold mb-2">{step.title}</h3>
                <p className="text-gray-600 text-sm">{step.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ****************** FOR LANDLORDS SECTION ****************** */
const ForLandlordsSection = () => {
  const navigate = useNavigate();
  
  const features = [
    { 
      icon: Building, 
      title: "Property & Unit Management", 
      desc: "Manage your properties and units structuredly. Organize everything in one place." 
    },
    { 
      icon: Zap, 
      title: "Unit Advertisements", 
      desc: "Create and manage advertisements for each unit to find prospective tenants and generate leads." 
    },
    { 
      icon: DollarSign, 
      title: "Financial Management", 
      desc: "Record income and expenses. Know your current financial status at a glance." 
    },
    { 
      icon: BarChart3, 
      title: "Rent Payment Dashboard", 
      desc: "See rent payments to be collected this month. Track all payments in one organized view." 
    },
    { 
      icon: Shield, 
      title: "AI-Powered Tenant Screening", 
      desc: "Basic automated screening with simple AI helper to find reliable tenants." 
    },
    { 
      icon: FileText, 
      title: "Digital Lease Management", 
      desc: "Manage leases digitally for your tenants. All agreements in one secure place." 
    },
    { 
      icon: MessageCircle, 
      title: "Transparent Communication", 
      desc: "Communicate with tenants transparently. Direct messaging keeps everything clear." 
    },
    { 
      icon: Wrench, 
      title: "Maintenance Request Management", 
      desc: "Handle maintenance requests efficiently. Structured system ensures nothing gets missed." 
    },
  ];

  return (
    <section id="for-landlords" className="py-16 bg-white relative">
      <div className="absolute inset-0 overflow-hidden">
        <motion.div 
          className="absolute top-1/4 right-1/4 w-[600px] h-[600px] rounded-full bg-gradient-to-r from-emerald-100 to-sky-100 blur-3xl opacity-30"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{
            duration: 12,
            repeat: Infinity,
            repeatType: "reverse"
          }}
        />
      </div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-emerald-50 px-4 py-2 rounded-full mb-6">
            <Users className="w-5 h-5 text-emerald-600" />
            <span className="text-sm font-medium text-gray-700">For Landlords</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Everything You Need to <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-sky-600">Manage Your Rentals</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Streamline your rental business with powerful tools designed for landlords in Cebu Province
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {features.map((feature, index) => (
            <motion.div 
              key={index}
              className="bg-gradient-to-br from-white to-gray-50 p-6 rounded-2xl shadow-md hover:shadow-xl transition-all border border-gray-100"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -8, borderColor: "rgba(16, 185, 129, 0.3)" }}
            >
              <div className="bg-emerald-50 p-3 rounded-lg inline-block mb-4">
                <feature.icon className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="text-lg font-bold mb-2 text-gray-900">{feature.title}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
        
        {/* CTA for Landlords */}
        <div className="text-center">
          <motion.button
            onClick={() => navigate("/auth/register")}
            whileHover={{ 
              scale: 1.05,
              boxShadow: "0 10px 25px -5px rgba(16, 185, 129, 0.3)"
            }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-4 bg-gradient-to-r from-emerald-600 to-sky-600 rounded-xl font-bold text-lg text-white shadow-lg flex items-center gap-2 mx-auto"
          >
            <Users className="w-5 h-5" />
            <span>Start Managing Your Properties</span>
          </motion.button>
        </div>
      </div>
    </section>
  );
};


export default Landing