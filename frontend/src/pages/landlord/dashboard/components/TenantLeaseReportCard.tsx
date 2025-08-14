import React from "react";
import { UserCheck, FileText, ClipboardList } from "lucide-react";

const TenantLeaseReportCard: React.FC = () => {
  const sections = [
    { label: "Tenants", value: 0, icon: <UserCheck size={28} /> },
    { label: "Leases", value: 0, icon: <FileText size={28} /> },
    { label: "Conditional Reports", value: 0, icon: <ClipboardList size={28} /> },
  ];

  return (
    <div className="bg-white shadow rounded-lg p-4 border border-gray-200">
      <div className="grid grid-cols-3 divide-x divide-gray-200 text-center">
        {sections.map((section) => (
          <div key={section.label} className="px-4 flex flex-col items-center">
            <div className="text-gray-600 mb-1">{section.icon}</div>
            <p className="text-sm font-medium text-gray-500">{section.label}</p>
            <p className="mt-1 text-lg font-semibold text-gray-800">{section.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TenantLeaseReportCard;
