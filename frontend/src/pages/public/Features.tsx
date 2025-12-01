import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { 
  Zap, Bot, Eye, MessageCircle, FileText, Wrench, 
  Building, DollarSign, BarChart3, Shield, Users,
  Search, MapPin, ArrowRight, Globe, CheckCircle2
} from "lucide-react";
import { Card } from "@/components/ui/card";

export default function Features() {
  return (
    <div className="bg-gray-50">
      <HeroSection />
      <TenantFeaturesSection />
      <LandlordFeaturesSection />
      <SharedFeaturesSection />
      <CTASection />
    </div>
  );
}

/* ****************** HERO SECTION ****************** */
const HeroSection = () => {
  return (
    <section className="relative min-h-[60vh] flex items-center py-16 overflow-hidden bg-gradient-to-br from-emerald-600 via-emerald-500 to-sky-600">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden z-0">
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              width: `${Math.random() * 60 + 20}px`,
              height: `${Math.random() * 60 + 20}px`,
              backgroundColor: "rgba(255, 255, 255, 0.1)"
            }}
            animate={{
              y: [0, (Math.random() - 0.5) * 80, 0],
              x: [0, (Math.random() - 0.5) * 80, 0],
              rotate: [0, 360],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: Math.random() * 12 + 12,
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
            <Zap className="w-5 h-5 text-white" fill="currentColor" />
            <span className="text-sm font-medium text-white">Comprehensive Features</span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 text-white leading-tight">
            Powerful Features for <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-yellow-400">Everyone</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-emerald-50 max-w-4xl mx-auto mb-8 leading-relaxed">
            Discover all the tools and features designed specifically for landlords and students in Cebu Province. 
            Everything you need for transparent, efficient rental management.
          </p>
          
          <div className="flex flex-wrap justify-center gap-4 text-white/90">
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg">
              <Users className="w-5 h-5" />
              <span className="font-medium">For Students</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg">
              <Building className="w-5 h-5" />
              <span className="font-medium">For Landlords</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg">
              <MapPin className="w-5 h-5" />
              <span className="font-medium">Cebu Province</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

/* ****************** TENANT FEATURES SECTION ****************** */
const TenantFeaturesSection = () => {
  const features = [
    {
      icon: Bot,
      title: "AI Chatbot Search",
      description: "Chat naturally with our AI assistant to find units. No need to type complex searches—just describe what you need and get instant matches in Cebu.",
      color: "sky"
    },
    {
      icon: Search,
      title: "Browse Units Safely",
      description: "Search and browse all available rentals in Cebu Province from anywhere. No more walking around searching for units—find your perfect rental safely online.",
      color: "sky"
    },
    {
      icon: Eye,
      title: "Transparent Payment Tracking",
      description: "See all payment history and track transactions. Both you and your landlord can view the same records, ensuring fairness and avoiding disputes.",
      color: "sky"
    },
    {
      icon: MessageCircle,
      title: "Direct Communication",
      description: "Chat directly with landlords. Ask questions, get instant responses, and communicate transparently about properties and leases.",
      color: "sky"
    },
    {
      icon: FileText,
      title: "Digital Lease Agreements",
      description: "View and sign lease agreements digitally. All terms are visible upfront—no hidden clauses or surprises. Fair and transparent for both parties.",
      color: "sky"
    },
    {
      icon: Wrench,
      title: "Structured Maintenance Reports",
      description: "Report unit issues easily through a structured system. Unlike informal platforms where requests get lost, your maintenance reports stay focused and visible to landlords.",
      color: "sky"
    }
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
            <Users className="w-5 h-5 text-sky-600" />
            <span className="text-sm font-medium text-sky-700">For Students</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Features for <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-600 to-blue-600">Students</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Everything you need to find, secure, and manage your student rental in Cebu Province—all from the comfort of your home
          </p>
        </motion.div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ y: -8 }}
            >
              <Card className="p-6 bg-gradient-to-br from-sky-50 to-white border-2 border-sky-100 rounded-2xl shadow-md hover:shadow-xl transition-all h-full">
                <div className="bg-sky-100 p-3 rounded-lg inline-block mb-4">
                  <feature.icon className="w-6 h-6 text-sky-600" />
                </div>
                <h3 className="text-xl font-bold mb-2 text-gray-900">{feature.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ****************** LANDLORD FEATURES SECTION ****************** */
const LandlordFeaturesSection = () => {
  const features = [
    {
      icon: Building,
      title: "Property & Unit Management",
      description: "Manage your properties and units structuredly. Organize everything in one place—properties, units, and all related information.",
      color: "emerald"
    },
    {
      icon: Zap,
      title: "Unit Advertisements",
      description: "Create and manage advertisements for each unit to find prospective tenants and generate leads. Reach more students looking for rentals.",
      color: "emerald"
    },
    {
      icon: DollarSign,
      title: "Financial Management",
      description: "Record income and expenses. Track all financial transactions and know your current financial status at a glance.",
      color: "emerald"
    },
    {
      icon: BarChart3,
      title: "Rent Payment Dashboard",
      description: "See rent payments to be collected this month. Track all payments in one organized view with clear due dates and status.",
      color: "emerald"
    },
    {
      icon: Shield,
      title: "AI-Powered Tenant Screening",
      description: "Basic automated screening with simple AI helper to find reliable tenants. Review applications and make informed decisions.",
      color: "emerald"
    },
    {
      icon: FileText,
      title: "Digital Lease Management",
      description: "Manage leases digitally for your tenants. All agreements in one secure place with easy access and tracking.",
      color: "emerald"
    },
    {
      icon: MessageCircle,
      title: "Transparent Communication",
      description: "Communicate with tenants transparently. Direct messaging keeps everything clear and documented for both parties.",
      color: "emerald"
    },
    {
      icon: Wrench,
      title: "Maintenance Request Management",
      description: "Handle maintenance requests efficiently. Structured system ensures nothing gets missed and all requests are properly tracked.",
      color: "emerald"
    }
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
            Features for <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600">Landlords</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Comprehensive tools to manage your rental business efficiently and transparently in Cebu Province
          </p>
        </motion.div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ y: -8 }}
            >
              <Card className="p-6 bg-white border-2 border-emerald-100 rounded-2xl shadow-md hover:shadow-xl transition-all h-full">
                <div className="bg-emerald-100 p-3 rounded-lg inline-block mb-4">
                  <feature.icon className="w-6 h-6 text-emerald-600" />
                </div>
                <h3 className="text-lg font-bold mb-2 text-gray-900">{feature.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ****************** SHARED FEATURES SECTION ****************** */
const SharedFeaturesSection = () => {
  const sharedFeatures = [
    {
      icon: Eye,
      title: "Transparent Payment Tracking",
      description: "Both tenants and landlords can see all payment history. No disputes, no confusion—just clear, visible records.",
      benefit: "Avoid losses and ensure fairness"
    },
    {
      icon: MessageCircle,
      title: "Direct Communication",
      description: "Built-in messaging system for direct communication. Ask questions, get responses, and keep everything documented.",
      benefit: "Clear and transparent communication"
    },
    {
      icon: FileText,
      title: "Digital Lease Agreements",
      description: "Digital lease documents visible to both parties. No hidden terms, no surprises—everything is upfront and clear.",
      benefit: "Fair and transparent terms"
    },
    {
      icon: Globe,
      title: "Cebu Province Focus",
      description: "Designed specifically for the Cebu Province rental market. All features tailored for local landlords and students.",
      benefit: "Localized for Cebu community"
    }
  ];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 bg-emerald-50 px-4 py-2 rounded-full mb-6">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span className="text-sm font-medium text-emerald-700">Shared Benefits</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Features That <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-sky-600">Benefit Everyone</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Transparency and fairness built into every feature for both landlords and tenants
          </p>
        </motion.div>
        
        <div className="grid md:grid-cols-2 gap-6">
          {sharedFeatures.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Card className="p-6 bg-gradient-to-br from-emerald-50 to-sky-50 border-2 border-emerald-100 rounded-2xl shadow-md hover:shadow-xl transition-all h-full">
                <div className="flex items-start gap-4">
                  <div className="bg-emerald-600 p-3 rounded-lg flex-shrink-0">
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-2 text-gray-900">{feature.title}</h3>
                    <p className="text-gray-600 mb-3 leading-relaxed">{feature.description}</p>
                    <div className="flex items-center gap-2 text-emerald-700">
                      <CheckCircle2 className="w-4 h-4" />
                      <span className="text-sm font-medium">{feature.benefit}</span>
                    </div>
                  </div>
                </div>
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
        <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Experience These Features?</h2>
        <p className="text-lg text-emerald-50 max-w-2xl mx-auto mb-8">
          Join RentEase today and start using these powerful features to manage or find rentals in Cebu Province.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <motion.button
            onClick={() => navigate("/auth/register")}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-4 bg-white text-emerald-600 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all flex items-center gap-2 justify-center"
          >
            <Users className="w-5 h-5" />
            <span>Get Started as Student</span>
            <ArrowRight className="w-5 h-5" />
          </motion.button>
          <motion.button
            onClick={() => navigate("/auth/register")}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-4 bg-emerald-700/30 backdrop-blur-sm border-2 border-white/30 text-white rounded-xl font-bold hover:bg-emerald-700/40 transition-all flex items-center gap-2 justify-center"
          >
            <Building className="w-5 h-5" />
            <span>Get Started as Landlord</span>
            <ArrowRight className="w-5 h-5" />
          </motion.button>
        </div>
      </div>
    </motion.section>
  );
};
