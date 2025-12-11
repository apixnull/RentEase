import { ArrowLeft, BookOpen, Home, Users, MessageSquare, CreditCard, Shield, FileText, ClipboardList, Lightbulb, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";

const guidelineSections = [
  { 
    id: "property-management", 
    title: "Property Management", 
    description: "Learn how properties and units work together in RentEase",
    icon: Home, 
    color: "blue",
    path: "/guidelines/property-management"
  },
  { 
    id: "listing-best-practices", 
    title: "Listing Best Practices", 
    description: "Tips for creating effective listings that attract quality tenants",
    icon: Lightbulb, 
    color: "amber",
    path: "/guidelines/listing-best-practices"
  },
  { 
    id: "tenant-screening", 
    title: "Tenant Screening", 
    description: "How to screen and select reliable tenants",
    icon: Users, 
    color: "purple",
    path: "/guidelines/tenant-screening"
  },
  { 
    id: "communication", 
    title: "Communication", 
    description: "Best practices for landlord-tenant communication",
    icon: MessageSquare, 
    color: "sky",
    path: "/guidelines/communication"
  },
  { 
    id: "lease-management", 
    title: "Lease Management", 
    description: "Creating and managing rental agreements",
    icon: FileText, 
    color: "indigo",
    path: "/guidelines/lease-management"
  },
  { 
    id: "financial-tracking", 
    title: "Financial Tracking", 
    description: "Recording and monitoring your rental income",
    icon: CreditCard, 
    color: "green",
    path: "/guidelines/financial-tracking"
  },
  { 
    id: "maintenance", 
    title: "Maintenance Requests", 
    description: "Handling and prioritizing maintenance issues",
    icon: ClipboardList, 
    color: "orange",
    path: "/guidelines/maintenance"
  },
  { 
    id: "safety-tips", 
    title: "Safety Tips", 
    description: "Protecting yourself and your property",
    icon: Shield, 
    color: "red",
    path: "/guidelines/safety-tips"
  },
];

const colorClasses: Record<string, { bg: string; bgLight: string; border: string; text: string; hover: string }> = {
  blue: { bg: "bg-blue-600", bgLight: "bg-blue-50", border: "border-blue-200", text: "text-blue-700", hover: "hover:border-blue-400" },
  amber: { bg: "bg-amber-600", bgLight: "bg-amber-50", border: "border-amber-200", text: "text-amber-700", hover: "hover:border-amber-400" },
  purple: { bg: "bg-purple-600", bgLight: "bg-purple-50", border: "border-purple-200", text: "text-purple-700", hover: "hover:border-purple-400" },
  sky: { bg: "bg-sky-600", bgLight: "bg-sky-50", border: "border-sky-200", text: "text-sky-700", hover: "hover:border-sky-400" },
  indigo: { bg: "bg-indigo-600", bgLight: "bg-indigo-50", border: "border-indigo-200", text: "text-indigo-700", hover: "hover:border-indigo-400" },
  green: { bg: "bg-green-600", bgLight: "bg-green-50", border: "border-green-200", text: "text-green-700", hover: "hover:border-green-400" },
  orange: { bg: "bg-orange-600", bgLight: "bg-orange-50", border: "border-orange-200", text: "text-orange-700", hover: "hover:border-orange-400" },
  red: { bg: "bg-red-600", bgLight: "bg-red-50", border: "border-red-200", text: "text-red-700", hover: "hover:border-red-400" },
};

const Guidelines = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100">
      {/* Header with Back Button */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <motion.button
            onClick={() => navigate(-1)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 text-gray-600 hover:text-emerald-600 transition-colors font-medium"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back</span>
          </motion.button>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative py-16 overflow-hidden bg-gradient-to-br from-cyan-600 via-sky-500 to-emerald-600">
        <div className="absolute inset-0 overflow-hidden z-0">
          {[...Array(10)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full bg-white/10"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                width: `${Math.random() * 60 + 20}px`,
                height: `${Math.random() * 60 + 20}px`,
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
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
              <BookOpen className="w-5 h-5 text-white" />
              <span className="text-sm font-medium text-white">Platform Guidelines</span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 text-white leading-tight">
              Platform Usage Guidelines
            </h1>

            <p className="text-xl md:text-2xl text-cyan-50 max-w-3xl mx-auto leading-relaxed">
              Learn how to effectively use RentEase to manage your properties and connect with quality tenants
            </p>
          </motion.div>
        </div>
      </section>

      {/* Guidelines Sections Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {guidelineSections.map((section, index) => {
            const Icon = section.icon;
            const colors = colorClasses[section.color] || colorClasses.blue;
            
            return (
              <motion.div
                key={section.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <Card 
                  className={`group cursor-pointer h-full p-6 bg-white border-2 ${colors.border} ${colors.hover} rounded-2xl shadow-md hover:shadow-xl transition-all duration-300`}
                  onClick={() => navigate(section.path)}
                >
                  <div className="flex flex-col h-full">
                    <div className={`${colors.bg} w-14 h-14 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    
                    <h3 className={`text-xl font-bold ${colors.text} mb-2 flex items-center gap-2`}>
                      {section.title}
                      <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </h3>
                    
                    <p className="text-gray-600 text-sm flex-1">
                      {section.description}
                    </p>
                    
                    <div className={`mt-4 pt-4 border-t ${colors.border}`}>
                      <span className={`text-sm font-medium ${colors.text} group-hover:underline`}>
                        Read more →
                      </span>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Footer Help */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-center mt-12"
        >
          <Card className="p-8 bg-gradient-to-br from-cyan-50 to-emerald-50 border-2 border-cyan-200 rounded-2xl">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Need More Help?
            </h3>
            <p className="text-gray-700 mb-4">
              If you have questions or need assistance, our support team is here to help.
            </p>
            <p className="text-sm text-gray-600">
              <strong>Email:</strong> support@rentease.com
            </p>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Guidelines;
