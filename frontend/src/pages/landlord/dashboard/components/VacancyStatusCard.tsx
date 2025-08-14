import React from "react";
import { Megaphone, Users, UserPlus, Home } from "lucide-react";

const VacancyStatusCard: React.FC = () => {
  const stats = [
    { label: "Marketing On", value: 0, icon: <Megaphone size={28} /> },
    { label: "Leads", value: 0, icon: <Users size={28} /> },
    { label: "Applicants", value: 0, icon: <UserPlus size={28} /> },
    { label: "Tenants", value: 0, icon: <Home size={28} /> },
  ];

  return (
    <div className="bg-white shadow rounded-lg p-4 border border-gray-200">
      <div className="grid grid-cols-4 divide-x divide-gray-200 text-center">
        {stats.map((stat) => (
          <div key={stat.label} className="px-2 flex flex-col items-center">
            <div className="text-gray-600 mb-1">{stat.icon}</div>
            <p className="text-sm font-medium text-gray-500">{stat.label}</p>
            <p className="mt-1 text-lg font-semibold text-gray-800">{stat.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VacancyStatusCard;
