import { Building, Target, Users, TrendingUp, BookOpen, MapPin } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface TeamMember {
  name: string;
  role: string;
  desc: string;
  bg: string;
}

interface SignificanceItem {
  title: string;
  icon: React.ReactNode;
  desc: string;
}

const AboutPage = () => {
  const teamMembers: TeamMember[] = [
    {
      name: "Juan Dela Cruz",
      role: "Project Lead",
      desc: "Oversees system architecture and development roadmap",
      bg: "from-blue-500 to-teal-400"
    },
    {
      name: "Maria Santos",
      role: "AI Developer",
      desc: "Implements chatbot and recommendation algorithms",
      bg: "from-blue-600 to-teal-500"
    },
    {
      name: "Pedro Bautista",
      role: "UX Designer",
      desc: "Creates user-friendly interfaces for Filipino users",
      bg: "from-blue-400 to-teal-300"
    },
    {
      name: "Ana Reyes",
      role: "Researcher",
      desc: "Conducts user studies and market analysis",
      bg: "from-blue-500 to-teal-400"
    }
  ];

  const significanceItems: SignificanceItem[] = [
    {
      title: "For Landlords",
      icon: <Building className="w-6 h-6 text-blue-500" />,
      desc: "Reduces administrative burdens and improves oversight of rental properties"
    },
    {
      title: "For Tenants",
      icon: <Users className="w-6 h-6 text-blue-500" />,
      desc: "Provides transparent property search and better communication"
    },
    {
      title: "For Cebu City",
      icon: <MapPin className="w-6 h-6 text-blue-500" />,
      desc: "Supports urban development goals through transparent rental management"
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 md:px-6 md:py-12 bg-gradient-to-b from-blue-50/20 to-teal-50/20">
      {/* Hero Section */}
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

      {/* Rationale Section */}
      <section className="mb-16">
        <motion.div 
          className="flex items-center gap-3 mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <BookOpen className="h-8 w-8 text-teal-500" />
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-teal-500 bg-clip-text text-transparent">
            Rationale of the Study
          </h2>
        </motion.div>
        
        <div className="grid md:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="p-6 bg-white border-0 shadow-sm hover:shadow-md transition-shadow">
              <h3 className="font-semibold mb-3 text-blue-600">The Problem</h3>
              <p className="text-gray-700 dark:text-gray-300">
                The rental housing sector in the Philippines relies heavily on inefficient, informal systems. 
                Manual processes lead to poor documentation, unclear accountability, and inconsistent rent tracking.
              </p>
            </Card>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="p-6 bg-gradient-to-r from-blue-500 to-teal-500 text-white">
              <h3 className="font-semibold mb-3">Our Solution</h3>
              <p>
                RentEase bridges the gap with a lightweight, user-friendly platform featuring 
                AI-assisted property recommendations, integrated communication, and rent tracking tools.
              </p>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Objectives Section */}
      <section className="mb-16">
        <motion.div 
          className="flex items-center gap-3 mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Target className="h-8 w-8 text-teal-500" />
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-teal-500 bg-clip-text text-transparent">
            Objectives
          </h2>
        </motion.div>
        
        <div className="grid md:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="p-6 bg-white border-0 shadow-sm">
              <h3 className="font-semibold mb-3 text-blue-600">General Objective</h3>
              <p className="text-gray-700 dark:text-gray-300">
                To design, develop, and evaluate RentEase, an AI-powered rental management system 
                tailored for small- to mid-scale landlords and tenants in Cebu City.
              </p>
            </Card>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="p-6 bg-gradient-to-r from-blue-500 to-teal-500 text-white">
              <h3 className="font-semibold mb-3">Specific Objectives</h3>
              <ul className="list-disc pl-5 space-y-2">
                <li>Identify current rental management pain points</li>
                <li>Implement AI-powered property search</li>
                <li>Develop landlord dashboard for rent tracking</li>
                <li>Create maintenance request system</li>
                <li>Enable digital lease agreement management</li>
              </ul>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Scope Section */}
      <section className="mb-16">
        <motion.div 
          className="flex items-center gap-3 mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <MapPin className="h-8 w-8 text-teal-500" />
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-teal-500 bg-clip-text text-transparent">
            Scope
          </h2>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="p-6 bg-white border-0 shadow-sm">
            <ul className="list-disc pl-5 space-y-2 text-gray-700 dark:text-gray-300">
              <li>Web-based platform focused on Cebu City</li>
              <li>User registration and property listing</li>
              <li>Manual rent tracking and lease monitoring</li>
              <li>AI chatbot for property search</li>
              <li>Maintenance request system</li>
            </ul>
          </Card>
        </motion.div>
      </section>

      {/* Significance */}
      <section className="mb-16">
        <motion.div 
          className="flex items-center gap-3 mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <TrendingUp className="h-8 w-8 text-teal-500" />
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-teal-500 bg-clip-text text-transparent">
            Significance
          </h2>
        </motion.div>
        
        <div className="grid md:grid-cols-3 gap-6">
          {significanceItems.map((item, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
            >
              <Card className="p-6 bg-white border-0 shadow-sm hover:shadow-md transition-shadow h-full">
                <div className="flex items-center mb-3">
                  <div className="p-2 bg-blue-50 rounded-lg mr-3">
                    {item.icon}
                  </div>
                  <h3 className="font-semibold text-blue-600">{item.title}</h3>
                </div>
                <p className="text-gray-700 dark:text-gray-300">{item.desc}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Team Section */}
      <section className="mb-16">
        <motion.div 
          className="flex items-center gap-3 mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Users className="h-8 w-8 text-teal-500" />
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-teal-500 bg-clip-text text-transparent">
            Our Team
          </h2>
        </motion.div>
        
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {teamMembers.map((member, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              whileHover={{ y: -5 }}
            >
              <Card className="p-6 text-center h-full border-0 overflow-hidden relative group">
                <div className={`absolute inset-0 bg-gradient-to-r ${member.bg} opacity-10 group-hover:opacity-20 transition-opacity`} />
                <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-r from-blue-100 to-teal-100 mb-4 relative overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center text-blue-500">
                    <Users className="w-10 h-10" />
                  </div>
                </div>
                <h3 className="font-semibold text-blue-800">{member.name}</h3>
                <p className="text-gray-600 dark:text-gray-400">{member.role}</p>
                <p className="text-sm text-gray-500 mt-2">{member.desc}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Call to Action */}
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
            className="text-white border-white hover:bg-white/10"
            size="lg"
          >
            For Tenants
          </Button>
        </div>
      </motion.section>
    </div>
  );
};

export default AboutPage;