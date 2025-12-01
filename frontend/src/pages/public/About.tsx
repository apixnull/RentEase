import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { 
  Target, MapPin, TrendingUp, Users, Building, Globe, 
  Zap, Eye, MessageCircle, FileText, Bot, 
  DollarSign, BarChart3, Shield, ArrowRight, Heart,
  AlertCircle, CheckCircle2, Code, ClipboardList, TestTube, UserCheck
} from "lucide-react";

/* ****************** ABOUT ****************** */
const About = () => {
  return (
    <div className="bg-gray-50">
      <HeroSection />
      <MissionSection />
      <PainPointsSection />
      <DigitalInclusionSection />
      <HowWeHelpSection />
      <ObjectivesSection />
      <ScopeSection />
      <SignificanceSection />
      <TeamSection />
      <CallToAction />
    </div>
  );
};

/* ****************** HERO SECTION ****************** */
const HeroSection = () => {
  return (
    <section className="relative min-h-[70vh] flex items-center py-16 overflow-hidden bg-gradient-to-br from-emerald-600 via-emerald-500 to-sky-600">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden z-0">
        {/* Floating particles */}
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-white/10"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              width: `${Math.random() * 80 + 20}px`,
              height: `${Math.random() * 80 + 20}px`,
              backgroundColor: "rgba(255, 255, 255, 0.1)",
            }}
            animate={{
              y: [0, (Math.random() - 0.5) * 100, 0],
              x: [0, (Math.random() - 0.5) * 100, 0],
              rotate: [0, 360],
              scale: [1, 1.3, 1],
            }}
            transition={{
              duration: Math.random() * 15 + 15,
              repeat: Infinity,
              delay: Math.random() * 3,
            }}
          />
        ))}
        
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[5%]">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 0 0 60" fill="none" stroke="currentColor" strokeWidth="1" />
            </pattern>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>
      </div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
            <Globe className="w-5 h-5 text-white" />
            <span className="text-sm font-medium text-white">Digital Rental Platform for Cebu Province</span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 text-white leading-tight">
            About <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-yellow-400">RentEase</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-emerald-50 max-w-4xl mx-auto mb-8 leading-relaxed">
            Empowering landlords and students in Cebu Province through transparent, 
            digital-first rental management. Building a connected community, one lease at a time.
          </p>
          
          <div className="flex flex-wrap justify-center gap-4 text-white/90">
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg">
              <Users className="w-5 h-5" />
              <span className="font-medium">For Landlords & Tenants</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg">
              <MapPin className="w-5 h-5" />
              <span className="font-medium">Cebu Province Focus</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg">
              <Zap className="w-5 h-5" />
              <span className="font-medium">AI-Powered Solutions</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

/* ****************** MISSION SECTION ****************** */
const MissionSection = () => {
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
          <div className="inline-flex items-center gap-2 bg-emerald-50 px-4 py-2 rounded-full mb-6">
            <Target className="w-5 h-5 text-emerald-600" />
            <span className="text-sm font-medium text-emerald-700">Our Mission</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Transforming Rental Management in <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-sky-600">Cebu Province</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            RentEase is an AI-powered rental management system designed to bridge the gap between 
            traditional rental processes and modern digital solutions. We're making rental management 
            transparent, efficient, and accessible for both landlords and students in Cebu Province.
          </p>
        </motion.div>
        
        <div className="grid md:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="p-8 bg-gradient-to-br from-emerald-50 to-white border-2 border-emerald-100 rounded-2xl h-full">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-emerald-600 p-3 rounded-lg">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Our Vision</h3>
              </div>
              <p className="text-gray-700 leading-relaxed">
                To become the leading digital platform for rental management in Cebu Province, 
                fostering a transparent and efficient rental ecosystem that benefits both landlords 
                and tenants through innovative technology and community-focused solutions.
              </p>
            </Card>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Card className="p-8 bg-gradient-to-br from-sky-50 to-white border-2 border-sky-100 rounded-2xl h-full">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-sky-600 p-3 rounded-lg">
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Our Values</h3>
              </div>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-sky-600 rounded-full mt-2 flex-shrink-0"></div>
                  <span><strong>Transparency:</strong> Clear communication and visible processes for all parties</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-sky-600 rounded-full mt-2 flex-shrink-0"></div>
                  <span><strong>Accessibility:</strong> Making rental management easy and accessible for everyone</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-sky-600 rounded-full mt-2 flex-shrink-0"></div>
                  <span><strong>Innovation:</strong> Leveraging AI and modern technology to solve real problems</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-sky-600 rounded-full mt-2 flex-shrink-0"></div>
                  <span><strong>Community:</strong> Building a connected rental community in Cebu</span>
                </li>
              </ul>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

/* ****************** PAIN POINTS SECTION ****************** */
const PainPointsSection = () => {
  const tenantPainPoints = [
    {
      problem: "Physical Search Risks",
      desc: "Students have to walk around Cebu searching for units, exposing them to health risks, weather hazards, and wasted time.",
      solution: "Browse all available units safely from anywhere online"
    },
    {
      problem: "Lack of Payment Transparency",
      desc: "No clear visibility of payment history. Disputes arise from unclear records and lost receipts.",
      solution: "Visible payment tracking - both parties see all transaction history"
    },
    {
      problem: "Poor Communication",
      desc: "Difficult to reach landlords, ask questions, or get quick responses about properties.",
      solution: "Direct messaging system for instant communication with landlords"
    },
    {
      problem: "Hidden Lease Terms",
      desc: "Lease agreements are not always clear or accessible, leading to misunderstandings.",
      solution: "Digital lease agreements visible to both parties - no hidden terms"
    }
  ];
  
  const landlordPainPoints = [
    {
      problem: "Manual Record Keeping",
      desc: "Using spreadsheets, notebooks, and handwritten receipts leads to errors and lost records.",
      solution: "Structured digital system for all property and financial records"
    },
    {
      problem: "Payment Tracking Issues",
      desc: "Difficulty tracking rent payments, expenses, and financial status. No clear view of what's due.",
      solution: "Comprehensive payment dashboard showing all transactions and due dates"
    },
    {
      problem: "Lost Maintenance Requests",
      desc: "Maintenance requests get lost in informal channels like Messenger, leading to unresolved issues.",
      solution: "Structured maintenance request system that ensures nothing gets missed"
    },
    {
      problem: "Limited Tenant Reach",
      desc: "Hard to advertise units effectively and find reliable tenants without proper tools.",
      solution: "Unit advertisement system with AI-powered tenant screening"
    }
  ];
  
  return (
    <section className="py-16 bg-white relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <motion.div 
          className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-gradient-to-r from-red-100 to-orange-100 blur-3xl opacity-30"
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
          <div className="inline-flex items-center gap-2 bg-red-50 px-4 py-2 rounded-full mb-6">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <span className="text-sm font-medium text-red-700">The Problems We Solve</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Addressing Real <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-orange-600">Pain Points</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            RentEase was built to solve real problems faced by landlords and students in Cebu Province. 
            Here's how we're making rental management better for everyone.
          </p>
        </motion.div>
        
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Tenant Pain Points */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Card className="p-6 bg-gradient-to-br from-red-50 to-white border-2 border-red-100 rounded-2xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-red-600 p-3 rounded-lg">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Student Pain Points</h3>
              </div>
              <div className="space-y-4">
                {tenantPainPoints.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="p-4 bg-white rounded-lg border border-red-100"
                  >
                    <div className="flex items-start gap-3 mb-2">
                      <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 mb-1">{item.problem}</h4>
                        <p className="text-sm text-gray-600 mb-3">{item.desc}</p>
                        <div className="flex items-start gap-2 p-2 bg-emerald-50 rounded border border-emerald-200">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                          <p className="text-sm text-emerald-800 font-medium">{item.solution}</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </Card>
          </motion.div>
          
          {/* Landlord Pain Points */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Card className="p-6 bg-gradient-to-br from-orange-50 to-white border-2 border-orange-100 rounded-2xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-orange-600 p-3 rounded-lg">
                  <Building className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Landlord Pain Points</h3>
              </div>
              <div className="space-y-4">
                {landlordPainPoints.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="p-4 bg-white rounded-lg border border-orange-100"
                  >
                    <div className="flex items-start gap-3 mb-2">
                      <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 mb-1">{item.problem}</h4>
                        <p className="text-sm text-gray-600 mb-3">{item.desc}</p>
                        <div className="flex items-start gap-2 p-2 bg-emerald-50 rounded border border-emerald-200">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                          <p className="text-sm text-emerald-800 font-medium">{item.solution}</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

/* ****************** DIGITAL INCLUSION SECTION ****************** */
const DigitalInclusionSection = () => {
  return (
    <section className="py-16 bg-gradient-to-br from-emerald-50 via-sky-50 to-emerald-50 relative overflow-hidden">
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
          <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
            <Globe className="w-5 h-5 text-emerald-600" />
            <span className="text-sm font-medium text-emerald-700">Digital Community Inclusion</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Building Digital <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-sky-600">Community Inclusion</span>
          </h2>
          <p className="text-lg text-gray-700 max-w-3xl mx-auto leading-relaxed">
            RentEase is more than a platform—we're helping the Cebu community embrace digital transformation. 
            By moving rental processes online, we're making housing more accessible, transparent, and safe for everyone.
          </p>
        </motion.div>
        
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              icon: Building,
              title: "For Landlords",
              desc: "Transition from manual processes to digital management. Reduce paperwork, improve organization, and reach more tenants through online listings.",
              color: "emerald"
            },
            {
              icon: Users,
              title: "For Students",
              desc: "Find your perfect rental safely from anywhere. No more walking around Cebu searching for units. Browse, chat, and lease—all online.",
              color: "sky"
            },
            {
              icon: Globe,
              title: "For Cebu Community",
              desc: "Supporting digital transformation in Cebu Province. Building a more connected, transparent, and efficient rental ecosystem.",
              color: "emerald"
            }
          ].map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Card className="p-6 bg-white border-2 border-gray-100 rounded-2xl shadow-md hover:shadow-xl transition-all h-full">
                <div className={`bg-${item.color}-100 p-4 rounded-xl inline-block mb-4`}>
                  <item.icon className={`w-8 h-8 text-${item.color}-600`} />
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-900">{item.title}</h3>
                <p className="text-gray-600 leading-relaxed">{item.desc}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ****************** HOW WE HELP SECTION ****************** */
const HowWeHelpSection = () => {
  const landlordFeatures = [
    { icon: Building, title: "Property Management", desc: "Organize properties and units in one structured platform" },
    { icon: DollarSign, title: "Financial Tracking", desc: "Record income, expenses, and track rent payments" },
    { icon: BarChart3, title: "Payment Dashboard", desc: "See rent payments to be collected this month at a glance" },
    { icon: Shield, title: "Tenant Screening", desc: "AI-powered screening to find reliable tenants" },
  ];
  
  const tenantFeatures = [
    { icon: Bot, title: "AI Property Search", desc: "Chat naturally with AI to find your perfect unit" },
    { icon: Eye, title: "Transparent Payments", desc: "See all payment history and track transactions" },
    { icon: MessageCircle, title: "Direct Communication", desc: "Chat directly with landlords, ask questions easily" },
    { icon: FileText, title: "Digital Leases", desc: "View and sign lease agreements digitally" },
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
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            How RentEase <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-sky-600">Helps You</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Comprehensive tools designed specifically for landlords and students in Cebu Province
          </p>
        </motion.div>
        
        <div className="grid lg:grid-cols-2 gap-12">
          {/* For Landlords */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Card className="p-8 bg-gradient-to-br from-emerald-50 to-white border-2 border-emerald-100 rounded-2xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-emerald-600 p-3 rounded-lg">
                  <Building className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">For Landlords</h3>
              </div>
              <p className="text-gray-600 mb-6">
                Streamline your rental business with powerful management tools designed for efficiency and transparency.
              </p>
              <div className="grid grid-cols-1 gap-4">
                {landlordFeatures.map((feature, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-white rounded-lg">
                    <div className="bg-emerald-100 p-2 rounded-lg flex-shrink-0">
                      <feature.icon className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">{feature.title}</h4>
                      <p className="text-sm text-gray-600">{feature.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
          
          {/* For Tenants */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Card className="p-8 bg-gradient-to-br from-sky-50 to-white border-2 border-sky-100 rounded-2xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-sky-600 p-3 rounded-lg">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">For Students</h3>
              </div>
              <p className="text-gray-600 mb-6">
                Find your perfect rental safely and easily. All the tools you need to search, communicate, and lease—all in one place.
              </p>
              <div className="grid grid-cols-1 gap-4">
                {tenantFeatures.map((feature, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-white rounded-lg">
                    <div className="bg-sky-100 p-2 rounded-lg flex-shrink-0">
                      <feature.icon className="w-5 h-5 text-sky-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">{feature.title}</h4>
                      <p className="text-sm text-gray-600">{feature.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

/* ****************** OBJECTIVES SECTION ****************** */
const ObjectivesSection = () => {
  return (
    <section className="py-16 bg-gray-50 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="flex items-center gap-3 mb-10"
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="p-2 bg-emerald-100 rounded-full">
            <Target className="h-7 w-7 text-emerald-600" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-emerald-600 to-sky-600 bg-clip-text text-transparent">
            Project Objectives
          </h2>
        </motion.div>
        
        <div className="grid md:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="p-6 bg-white border-0 shadow-lg rounded-2xl h-full">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                <h3 className="font-bold text-lg text-emerald-600">General Objective</h3>
              </div>
              <p className="text-gray-700 leading-relaxed">
                To design, develop, and evaluate RentEase, an AI-powered rental management system 
                tailored for small- to mid-scale landlords and tenants in Cebu Province, focusing on 
                long-term student rentals and transparent rental processes.
              </p>
            </Card>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Card className="p-6 bg-gradient-to-br from-emerald-600 to-sky-600 text-white rounded-2xl shadow-xl h-full">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-3 h-3 bg-yellow-300 rounded-full"></div>
                <h3 className="font-bold text-lg">Specific Objectives</h3>
              </div>
              
              <ul className="space-y-3">
                {[
                  "Implement AI-powered property search and chatbot",
                  "Develop comprehensive landlord dashboard for property and financial management",
                  "Create transparent payment tracking system for both parties",
                  "Enable digital lease agreement management",
                  "Build structured maintenance request system",
                  "Design intuitive tenant portal for property browsing",
                  "Facilitate direct communication between landlords and tenants"
                ].map((item, i) => (
                  <motion.li 
                    key={i} 
                    className="flex items-start"
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.4 + (i * 0.1) }}
                  >
                    <div className="flex-shrink-0 mt-1.5">
                      <div className="w-2 h-2 bg-yellow-300 rounded-full"></div>
                    </div>
                    <span className="ml-3">{item}</span>
                  </motion.li>
                ))}
              </ul>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

/* ****************** SCOPE SECTION ****************** */
const ScopeSection = () => (
  <section className="py-16 bg-white">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <motion.div
        className="flex items-center gap-3 mb-6"
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <MapPin className="h-8 w-8 text-emerald-600" />
        <h2 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-sky-600 bg-clip-text text-transparent">
          Project Scope
        </h2>
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <Card className="p-8 bg-gradient-to-br from-gray-50 to-white border-2 border-gray-100 rounded-2xl">
          <ul className="space-y-4 text-gray-700">
            {[
              "Web-based platform focused on Cebu Province rental market",
              "User registration and authentication for landlords and tenants",
              "Property and unit listing management for landlords",
              "AI-powered chatbot for property search assistance",
              "Transparent payment tracking (not payment processing)",
              "Digital lease agreement creation and management",
              "Structured maintenance request and reporting system",
              "Direct messaging between landlords and tenants",
              "Financial management dashboard for landlords",
              "Tenant screening and lead management tools"
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-1">
                  <div className="w-2 h-2 bg-emerald-600 rounded-full"></div>
                </div>
                <span className="leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        </Card>
      </motion.div>
    </div>
  </section>
);

/* ****************** SIGNIFICANCE SECTION ****************** */
interface SignificanceItem {
  title: string;
  icon: React.ReactNode;
  desc: string;
}

const SignificanceSection = () => {
  const significanceItems: SignificanceItem[] = [
    {
      title: "For Landlords",
      icon: <Building className="w-6 h-6 text-emerald-600" />,
      desc: "Reduces administrative burdens, improves property oversight, and provides structured tools for managing rentals efficiently. Transition from manual processes to digital management."
    },
    {
      title: "For Students",
      icon: <Users className="w-6 h-6 text-sky-600" />,
      desc: "Provides safe, transparent property search without physical risks. Access to all rental information upfront, direct communication with landlords, and digital lease management."
    },
    {
      title: "For Cebu Province",
      icon: <MapPin className="w-6 h-6 text-emerald-600" />,
      desc: "Supports digital transformation and community inclusion. Creates a more transparent, efficient, and accessible rental ecosystem that benefits the entire community."
    }
  ];

  return (
    <section className="py-16 bg-gradient-to-br from-emerald-50 to-sky-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="flex items-center gap-3 mb-6"
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <TrendingUp className="h-8 w-8 text-emerald-600" />
          <h2 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-sky-600 bg-clip-text text-transparent">
            Significance
          </h2>
        </motion.div>
        
        <div className="grid md:grid-cols-3 gap-6">
          {significanceItems.map((item, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Card className="p-6 bg-white border-2 border-gray-100 shadow-md hover:shadow-xl transition-shadow h-full rounded-2xl">
                <div className="flex items-center mb-4">
                  <div className="p-3 bg-emerald-50 rounded-lg mr-3">
                    {item.icon}
                  </div>
                  <h3 className="font-bold text-lg text-gray-900">{item.title}</h3>
                </div>
                <p className="text-gray-700 leading-relaxed">{item.desc}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ****************** CALL TO ACTION ****************** */
const CallToAction = () => {
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
        <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Transform Your Rental Experience?</h2>
        <p className="text-lg text-emerald-50 max-w-2xl mx-auto mb-8">
          Join RentEase today and discover a better way to manage or find rental properties in Cebu Province.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <motion.button
            onClick={() => navigate("/auth/register")}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-4 bg-white text-emerald-600 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all flex items-center gap-2 justify-center"
          >
            <Users className="w-5 h-5" />
            <span>Get Started as Landlord</span>
            <ArrowRight className="w-5 h-5" />
          </motion.button>
          <motion.button
            onClick={() => navigate("/auth/register")}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-4 bg-emerald-700/30 backdrop-blur-sm border-2 border-white/30 text-white rounded-xl font-bold hover:bg-emerald-700/40 transition-all flex items-center gap-2 justify-center"
          >
            <Users className="w-5 h-5" />
            <span>Find Your Rental</span>
            <ArrowRight className="w-5 h-5" />
          </motion.button>
        </div>
      </div>
    </motion.section>
  );
};

/* ****************** TEAM SECTION ****************** */
interface TeamMember {
  name: string;
  role: string;
  desc: string;
  icon: React.ReactNode;
  bg: string;
}

const TeamSection = () => {
  const teamMembers: TeamMember[] = [
    {
      name: "Developer",
      role: "Full-Stack Developer",
      desc: "Develops and maintains the platform's core functionality, API integration, and system architecture",
      icon: <Code className="w-6 h-6" />,
      bg: "from-emerald-500 to-emerald-600"
    },
    {
      name: "Project Manager",
      role: "Project Manager",
      desc: "Oversees project timeline, coordinates team efforts, and ensures project goals are met",
      icon: <UserCheck className="w-6 h-6" />,
      bg: "from-sky-500 to-sky-600"
    },
    {
      name: "Documentation Expert",
      role: "Documentation & Paperwork Specialist",
      desc: "Manages project documentation, technical writing, and ensures proper documentation standards",
      icon: <ClipboardList className="w-6 h-6" />,
      bg: "from-purple-500 to-purple-600"
    },
    {
      name: "Tester",
      role: "QA Tester",
      desc: "Conducts system testing, identifies bugs, and ensures quality assurance throughout development",
      icon: <TestTube className="w-6 h-6" />,
      bg: "from-orange-500 to-orange-600"
    },
    {
      name: "UI/UX Designer",
      role: "Designer",
      desc: "Creates user-friendly interfaces, designs user experience flows, and ensures visual consistency",
      icon: <Zap className="w-6 h-6" />,
      bg: "from-pink-500 to-pink-600"
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
            <Users className="w-5 h-5 text-emerald-600" />
            <span className="text-sm font-medium text-emerald-700">Development Team</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Meet the <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-sky-600">RentEase Team</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            A dedicated team of professionals working together to build the future of rental management in Cebu Province
          </p>
        </motion.div>
        
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {teamMembers.map((member, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ y: -8 }}
            >
              <Card className="p-6 text-center h-full border-2 border-gray-100 rounded-2xl overflow-hidden relative group hover:shadow-xl transition-all">
                <div className={`absolute inset-0 bg-gradient-to-r ${member.bg} opacity-0 group-hover:opacity-5 transition-opacity`} />
                <div className={`w-20 h-20 mx-auto rounded-full bg-gradient-to-r ${member.bg} mb-4 relative overflow-hidden flex items-center justify-center text-white shadow-lg`}>
                  {member.icon}
                </div>
                <h3 className="font-bold text-lg text-gray-900 mb-1">{member.name}</h3>
                <p className="text-sm text-emerald-600 font-medium mb-3">{member.role}</p>
                <p className="text-sm text-gray-600 leading-relaxed">{member.desc}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default About;
