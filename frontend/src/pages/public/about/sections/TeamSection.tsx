import { Users } from "lucide-react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
// Type definitions
interface TeamMember {
  name: string;
  role: string;
  desc: string;
  bg: string;
}

// Team Section Component
export const TeamSection = () => {
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

  return (
    <section className="mb-16">
      <div className="flex items-center gap-3 mb-6">
        <Users className="h-8 w-8 text-teal-500" />
        <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-teal-500 bg-clip-text text-transparent">
          Our Team
        </h2>
      </div>
      
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
  );
};
