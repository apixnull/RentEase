import { Building, MapPin, TrendingUp, Users } from "lucide-react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";

interface SignificanceItem {
  title: string;
  icon: React.ReactNode;
  desc: string;
}



// Significance Section Component
export const SignificanceSection = () => {
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
    <section className="mb-16">
      <div className="flex items-center gap-3 mb-6">
        <TrendingUp className="h-8 w-8 text-teal-500" />
        <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-teal-500 bg-clip-text text-transparent">
          Significance
        </h2>
      </div>
      
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
  );
};
