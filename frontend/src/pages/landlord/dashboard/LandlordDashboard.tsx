// Still in Static Page
import TenantLeaseReportCard from "./components/TenantLeaseReportCard";
import VacancyStatusCard from "./components/VacancyStatusCard";
import PaymentStatusCard from "./components/PaymentStatusCard";

const LandlordDashboard = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex justify-center">
      <div className="flex flex-col gap-6 w-[93%] max-w-6xl px-6 py-8">

        {/* Greeting */}
        <h3 className="text-2xl font-bold text-gray-800 tracking-tight">
          Hello, Alex Morgan 
        </h3>

        {/* Dashboard Cards */}
        <div className="flex flex-col gap-6">
          <div className="bg-white shadow-md rounded-lg p-4 hover:shadow-lg transition-shadow duration-300">
            <VacancyStatusCard />
          </div>
          <div className="bg-white shadow-md rounded-lg p-4 hover:shadow-lg transition-shadow duration-300">
            <PaymentStatusCard />
          </div>
          <div className="bg-white shadow-md rounded-lg p-4 hover:shadow-lg transition-shadow duration-300">
            <TenantLeaseReportCard />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandlordDashboard;
