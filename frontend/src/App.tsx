import { Route, Routes } from "react-router-dom";
// import { toast } from "sonner";
import PublicLayout from "./layouts/PublicLayout";
import Home from "./pages/public/Home";
import NotFound from "./pages/NotFound";
import { Register } from "./pages/auth/Register";
import {Login} from "./pages/auth/Login";
import { LandlordLayout } from "./layouts/LandlordLayout";
import LandlordDashboard from "./pages/landlord/dashboard/LandlordDashboard";
import { TenantLayout } from "./layouts/TenantLayout";
import TenantDashboard from "./pages/tenant/TenantDashboard";
import { toast } from "sonner";
import { AdminLayout } from "./layouts/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import Listing from "./pages/listing/Listing";
import { ListingLayout } from "./layouts/ListingLayout";
import PropertyDetails from "./pages/listing/PropertyDetails";
import About from "./pages/public/About";
import { PropertiesPage } from "./pages/landlord/property/Properties";
import { PropertyInfo } from "./pages/landlord/property/PropertyInfo";
import Leases from "./pages/landlord/lease/Leases";
import LeaseDetails from "./pages/landlord/lease/LeaseDetails";
import Maintenance from "./pages/landlord/maintenance/Maintenance";
import MaintenanceDetails from "./pages/landlord/maintenance/MaintenanceDetails";
import Applicants from "./pages/landlord/applicant/Applicants";
import Tenants from "./pages/landlord/tenant/tenant";
import PaymentHistory from "./pages/landlord/payments/PaymentHistory";
import PaymentDetails from "./pages/landlord/payments/PaymentDetails";
import Financials from "./pages/landlord/financial/Financial";
import Reports from "./pages/landlord/report/Report";
import PropertyRented from "./pages/tenant/PropertyRented";
import RequestMaintenance from "./pages/tenant/RequestMaintenance";
import PaymentHistoryTenant from "./pages/tenant/PaymentHistory";
import LeaseAgreements from "./pages/tenant/LeaseAgreements";
import UserManagement from "./pages/admin/UserManagement";
import ListingReview from "./pages/admin/ListingReview";
import WebsiteReports from "./pages/admin/Reports";
import { ForgetPassword } from "./pages/auth/ForgetPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import VerifyOtp from "./pages/auth/VerifiyOTP";
import Unauthorized from "./pages/Unauthorized";

function App() {
  return (
    <>
      <Routes>
        {/* Public Routes */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
        </Route>

        {/* Auth Routes */}
        <Route>
          <Route path="/auth/login" element={<Login />} />
          <Route path="/auth/register" element={<Register />} />
          <Route path="/auth/forget-password" element={<ForgetPassword />} />
          <Route path="/auth/reset-password" element={<ResetPassword />} />
          <Route path="/auth/verify" element={<VerifyOtp />} />
          {/* <Route path="/unauthorized" element={<Unauthorized />} /> */} 
        </Route>
        
        {/* Landlord Routes */}
        <Route path="/landlord" element={<LandlordLayout />}>
          <Route index element={<LandlordDashboard />} />

           <Route path="/landlord/properties" element={<PropertiesPage />} />
           <Route path="/landlord/property-info" element={<PropertyInfo />}/>

           <Route path="/landlord/leases" element={<Leases />} />
           <Route path="/landlord/lease-details" element={<LeaseDetails />} />

          <Route path="/landlord/maintenance" element={<Maintenance />} />
          <Route path="/landlord/maintenance-details" element={<MaintenanceDetails />} />

          <Route path="/landlord/applicants" element={<Applicants />} />
          <Route path="/landlord/tenants" element={<Tenants />} />

          <Route path="/landlord/payments" element={<PaymentHistory />} />
          <Route path="/landlord/payment-details" element={<PaymentDetails />} />
          
          <Route path="/landlord/financials" element={<Financials />} />

          <Route path="/landlord/reports" element={<Reports />} />
        </Route>

        {/* Tenant Routes */}
        <Route path="/tenant" element={<TenantLayout />}>
          <Route index element={<TenantDashboard />}></Route>

          <Route path="/tenant/property-rented" element={<PropertyRented />}></Route>
          <Route path="/tenant/requestMaintenance" element={<RequestMaintenance />}></Route>
          <Route path="/tenant/paymentHistory" element={<PaymentHistoryTenant />}></Route>
          <Route path="/tenant/leases" element={<LeaseAgreements />}></Route>
        </Route>

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />}></Route>
          <Route path="/admin/user-management" element={<UserManagement />}></Route>
          <Route path="/admin/listings" element={<ListingReview />}></Route>
          <Route path="/admin/reports" element={<WebsiteReports />}></Route>
        </Route>

        {/* Listing Routes */}
        <Route path="/listing" element={<ListingLayout />}>
          <Route index element={<Listing />}></Route>
          <Route path="/listing/property-details" element={<PropertyDetails />}></Route>
        </Route>

        {/* Fallback route */}
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route path="*" element={<NotFound />} />



      </Routes>


      <div className="p-4 space-y-4 flex items-start gap-2">
        <button onClick={() => toast.success("Payment received successfully!")}>
          Show Success
        </button>

        <button onClick={() => toast.error("Failed to fetch data.")}>
          Show Error
        </button>

        <button onClick={() => toast.warning("Storage space is almost full.")}>
          Show Warning
        </button>

        <button onClick={() => toast.info("New feature available!")}>
          Show Info
        </button>

        <button onClick={() => toast.loading("Loading...")}>
          Show Loading
        </button>
      </div>
    </>
  );
}

export default App;
