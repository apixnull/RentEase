// file: App.tsx
import { useEffect, lazy, Suspense } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Toaster } from "sonner";

// Guards
import { AuthRedirectRoute, ProtectedRoute } from "./Guard";
import { OnboardingRoute } from "./Guard";

// Store + API
import { useAuthStore } from "./stores/useAuthStore";
import {
  getUserInfoRequest,
} from "./api/authApi";
import DisplaySpecificUnit from "./pages/private/landlord/unit/DisplaySpecificUnit";
import DisplayUnits from "./pages/private/landlord/unit/DisplayUnits";
import PropertyLayout from "./pages/private/landlord/property/PropertyLayout";
import LandlordListing from "./pages/private/landlord/listing/LandlordListing";
import ReviewUnitForListing from "./pages/private/landlord/listing/ReviewUnitForListing";
import { ListingDetails } from "./pages/private/landlord/listing/ListingDetails";
import ListingPaymentSuccess from "./pages/private/landlord/listing/ListingPaymentSuccess";
import ViewUnitDetails from "./pages/private/tenant/browse-unit/ViewUnitDetails.tsx";
import BrowseUnitLayout from "./pages/private/tenant/browse-unit/BrowseUnitLayout.tsx";
import LandlordMessages from "./pages/private/landlord/messages/LandlordMessages.tsx";
import TenantMessages from "./pages/private/tenant/messages/TenantMessages.tsx";
import ViewChannelMessages from "./pages/private/tenant/messages/ViewChannelMessagesTenant.tsx";
import ViewChannelMessagesLandlord from "./pages/private/landlord/messages/ViewChannelMessagesLandlord.tsx";
import Leases from "./pages/private/landlord/lease/Leases.tsx";
import ViewSpecificLease from "./pages/private/landlord/lease/ViewSpecificLease.tsx";
import MyLease from "./pages/private/tenant/lease/MyLease.tsx";
import ScreeningForm from "./pages/private/tenant/screening/ScreeningForm.tsx";
import Maintenance from "./pages/private/landlord/maintenance/Maintenance.tsx";
import Tenants from "./pages/private/landlord/tenants/Tenants.tsx";
import Financials from "./pages/private/landlord/financials/Financials.tsx";
import Reports from "./pages/private/landlord/reports/Reports.tsx";
import Engagement from "./pages/private/landlord/reports/Engagement.tsx";
import TenantScreeningLandlord from "./pages/private/landlord/screening/TenantScreeningLandlord.tsx";
import TenantScreeningTenant from "./pages/private/tenant/screening/TenantScreeningTenant.tsx";
import ViewSpecificScreeningLandlord from "./pages/private/landlord/screening/ViewSpecificScreeningLandlord.tsx";
import ViewSpecificScreeningTenant from "./pages/private/tenant/screening/ViewSpecificScreeningTenant.tsx";
import CreateLease from "./pages/private/landlord/lease/CreateLease.tsx";
import EditLease from "./pages/private/landlord/lease/EditLease.tsx";
import MyLeaseDetails from "./pages/private/tenant/lease/MyLeaseDetails.tsx";
import AdminListing from "./pages/private/admin/listing/AdminListing.tsx";
import AdminListingDetails from "./pages/private/admin/listing/specific-listing-details/AdminListingDetailsLayout.tsx";
import AllUsers from "./pages/private/admin/users/AllUsers.tsx";
import UserDetails from "./pages/private/admin/users/UserDetails.tsx";
import AdminEarnings from "./pages/private/admin/earnings/AdminEarnings.tsx";
import RentPayments from "./pages/private/landlord/payments/RentPayments.tsx";


// ------------------------------- Lazy Imports
// Layouts
const PublicLayout = lazy(() => import("./layouts/PublicLayout"));
const LandlordLayout = lazy(() => import("./layouts/LandlordLayout"));
const TenantLayout = lazy(() => import("./layouts/TenantLayout"));
const AdminLayout = lazy(() => import("./layouts/AdminLayout"));

// Public pages
const Landing = lazy(() => import("./pages/public/Landing"));
const About = lazy(() => import("./pages/public/About"));
const Features = lazy(() => import("./pages/public/Features"));

// Authentication pages
const Register = lazy(() => import("./pages/authentication/Register"));
const Login = lazy(() => import("./pages/authentication/Login"));
const ForgotPassword = lazy(
  () => import("./pages/authentication/ForgotPassword")
);
const ResetPassword = lazy(
  () => import("./pages/authentication/ResetPassword")
);
const VerifyEmail = lazy(() => import("./pages/authentication/VerifyEmail"));
const Onboarding = lazy(() => import("./pages/authentication/Onboarding"));

// Private pages - Landlord
const LandlordDashboard = lazy(
  () => import("./pages/private/landlord/dashboard/LandlordDashboard.tsx")
);
const CreateProperty = lazy(
  () => import("./pages/private/landlord/property/CreateProperty")
);
const DisplayProperties = lazy(
  () => import("./pages/private/landlord/property/DisplayProperties")
);
const DisplaySpecificProperty = lazy(
  () => import("./pages/private/landlord/property/DisplaySpecificProperty")
);
const CreateUnit = lazy(() => import("./pages/private/landlord/unit/CreateUnit"));

// Private pages - Tenant
const TenantDashboard = lazy(
  () => import("./pages/private/tenant/TenantDashboard")
);
const BrowseProperties = lazy(
  () => import("./pages/private/tenant/browse-unit/BrowseUnit.tsx")
);

// Private pages - Admin
const AdminDashboard = lazy(
  () => import("./pages/private/admin/AdminDashboard")
);

// Shared private pages
const AccountProfile = lazy(() => import("./pages/private/AccountProfile"));

// Fallbacks
const NotFound = lazy(() => import("./pages/fallbacks/NotFound"));
const Unauthorized = lazy(() => import("./pages/fallbacks/Unauthorized"));
const DisabledAccount = lazy(() => import("./pages/fallbacks/DisabledAccount"));

// ------------------------------- Loader Component
const Loader = () => (
  <div className="flex items-center justify-center min-h-screen bg-gray-50">
    <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
    <span className="ml-3 text-gray-600 font-medium">Loading…</span>
  </div>
);

// ------------------------------- ROUTES SETUP
const router = createBrowserRouter([

  // public routes
  {
    path: "/",
    element: <Suspense fallback={<Loader />}><PublicLayout /></Suspense>,
    children: [
      { index: true, element: <Suspense fallback={<Loader />}><Landing /></Suspense> },
      { path: "about", element: <Suspense fallback={<Loader />}><About /></Suspense> },
      { path: "features", element: <Suspense fallback={<Loader />}><Features /></Suspense> },
    ],
  },

  // auth routes
  {
    path: "auth",
    children: [
      { path: "register", element: <AuthRedirectRoute><Suspense fallback={<Loader />}><Register /></Suspense></AuthRedirectRoute> },
      { path: "login", element: <AuthRedirectRoute><Suspense fallback={<Loader />}><Login /></Suspense></AuthRedirectRoute> },
      { path: "forgot-password", element: <AuthRedirectRoute><Suspense fallback={<Loader />}><ForgotPassword /></Suspense></AuthRedirectRoute> },
      { path: "reset-password/:token", element: <Suspense fallback={<Loader />}><ResetPassword /></Suspense> },
      { path: "verify-email/:token", element: <Suspense fallback={<Loader />}><VerifyEmail /></Suspense> },
      { path: "onboarding", element: <OnboardingRoute><Suspense fallback={<Loader />}><Onboarding /></Suspense></OnboardingRoute> },
    ],
  },

  // landlord routes
  {
    path: "landlord",
    element: <ProtectedRoute allowedRoles={["LANDLORD"]}><Suspense fallback={<Loader />}><LandlordLayout /></Suspense></ProtectedRoute>,
    children: [
      // dashboard
      { index: true, element: <Suspense fallback={<Loader />}><LandlordDashboard /></Suspense> },

      // properties
      { path: "properties", element: <Suspense fallback={<Loader />}><DisplayProperties /></Suspense> },                                                        // display all properties 
      { path: "properties/:propertyId", element: <Suspense fallback={<Loader />}><PropertyLayout><DisplaySpecificProperty property={null} /></PropertyLayout></Suspense> },     // display specific property

      // units
      { path: "units/:propertyId", element: <Suspense fallback={<Loader />}><PropertyLayout><DisplayUnits units={[]} /></PropertyLayout></Suspense> },                     // display all units 
      { path: "units/:propertyId/:unitId", element: <Suspense fallback={<Loader />}><DisplaySpecificUnit /></Suspense> },                                       // display specific unit 
        
      // listing
      { path: "listing", element: <Suspense fallback={<Loader />}><LandlordListing /></Suspense>},                                                              // display all landlord listings
      { path: "listing/:unitId/review", element: ( <Suspense fallback={<Loader />}> <ReviewUnitForListing /> </Suspense>) },                                    // ✅ review specific unit before creating a listing
      { path: "listing/:listingId/details", element: (<Suspense fallback={<Loader />}> <ListingDetails /></Suspense> ), },                                      // ✅ display specific listing details (property + unit info)

      // account
      { path: "account", element: <Suspense fallback={<Loader />}><AccountProfile /></Suspense> },                                                              // display all account profile
      
      // messages
      { path: "messages", element: <Suspense fallback={<Loader />}><LandlordMessages /></Suspense> },                                                           // display all channel of the landlord
      { path: "messages/:channelId", element: <Suspense fallback={<Loader />}><ViewChannelMessagesLandlord /></Suspense> },                                     // view specific specific channel

      // screening  
      { path: "screening", element: <Suspense fallback={<Loader />}><TenantScreeningLandlord /></Suspense>},                                                      // display all tenant screening report
      { path: "screening/:screeningId/details", element: <Suspense fallback={<Loader />}><ViewSpecificScreeningLandlord /></Suspense>},                                         // view specific screening 

      // leases
      { path: "leases", element: <Suspense fallback={<Loader />}><Leases /></Suspense>},                                                                        // display all leases                                         // create a new lease
      { path: "leases/:leaseId/details", element: <Suspense fallback={<Loader />}><ViewSpecificLease /></Suspense>},                                                    // display specific lease 
      
      // maintenance
      { path: "maintenance", element: <Suspense fallback={<Loader />}><Maintenance /></Suspense>},                                                    // display specific lease 

      // tenants 
      { path: "tenants", element: <Suspense fallback={<Loader />}><Tenants /></Suspense>},                                                    // display specific lease 

      // financials
      { path: "financials", element: <Suspense fallback={<Loader />}><Financials /></Suspense>},

      // reports 
      { path: "reports", element: <Suspense fallback={<Loader />}><Reports /></Suspense>},
      { path: "reports/engagement", element: <Suspense fallback={<Loader />}><Engagement /></Suspense>},

      // payments
      { path: "payments", element: <Suspense fallback={<Loader />}><RentPayments /></Suspense>},

    ],    
  },

  // create units  
  { path: "landlord/units/:propertyId/create", element: ( <ProtectedRoute allowedRoles={["LANDLORD"]}><Suspense fallback={<Loader />}> <CreateUnit /> </Suspense></ProtectedRoute> ), },
  // create property
  { path: "landlord/properties/create", element: ( <ProtectedRoute allowedRoles={["LANDLORD"]}><Suspense fallback={<Loader />}> <CreateProperty /></Suspense></ProtectedRoute>), },
  // listing success
  { path: "landlord/listing/payment-success",  element: ( <Suspense fallback={<Loader />}> <ListingPaymentSuccess /> </Suspense>) },
    // create lease
  { path: "landlord/leases/create", element: ( <ProtectedRoute allowedRoles={["LANDLORD"]}><Suspense fallback={<Loader />}> <CreateLease /> </Suspense></ProtectedRoute> ), },
  // edit lease
  { path: "landlord/leases/:leaseId/edit", element: ( <ProtectedRoute allowedRoles={["LANDLORD"]}><Suspense fallback={<Loader />}> <EditLease /> </Suspense></ProtectedRoute> ), },

  // tenant routes
  {
    path: "tenant",
    element: <ProtectedRoute allowedRoles={["TENANT"]}><Suspense fallback={<Loader />}><TenantLayout /></Suspense></ProtectedRoute>,
    children: [
      { index: true, element: <Suspense fallback={<Loader />}><TenantDashboard /></Suspense> },

      // account account
      { path: "account", element: <Suspense fallback={<Loader />}><AccountProfile /></Suspense> },

      // messages
      { path: "messages", element: <Suspense fallback={<Loader />}><TenantMessages /></Suspense> },
      { path: "messages/:channelId", element: <Suspense fallback={<Loader />}><ViewChannelMessages /></Suspense> },

      // lease
      { path: "my-lease", element: <Suspense fallback={<Loader />}><MyLease /></Suspense> },
      { path: "my-lease/:leaseId/details", element: <Suspense fallback={<Loader />}><MyLeaseDetails /></Suspense> },

      // tenant screening
      { path: "screening", element: <Suspense fallback={<Loader />}><TenantScreeningTenant /></Suspense> },
      { path: "screening/:screeningId/details", element: <Suspense fallback={<Loader />}><ViewSpecificScreeningTenant /></Suspense> }, // view specific screening detials tenant perspective

    ],
  },

  // browse unit
  { path: "tenant/browse-unit",element: <ProtectedRoute allowedRoles={["TENANT"]}><BrowseUnitLayout /></ProtectedRoute>,
    children: [
      { index: true, element: <Suspense fallback={<Loader />}><BrowseProperties /></Suspense> },
      { path: ":listingId/details", element: <Suspense fallback={<Loader />}><ViewUnitDetails /></Suspense> },
    ],
  },

  // fill up lease
  { path: "tenant/screening/:screeningId/fill", element: ( <ProtectedRoute allowedRoles={["TENANT"]}><Suspense fallback={<Loader />}> <ScreeningForm /></Suspense></ProtectedRoute> ),},

  // admin routes
  {
    path: "admin",
    element: <ProtectedRoute allowedRoles={["ADMIN"]}><Suspense fallback={<Loader />}><AdminLayout /></Suspense></ProtectedRoute>,
    children: [
      { index: true, element: <Suspense fallback={<Loader />}><AdminDashboard /></Suspense> },
      { path: "account", element: <Suspense fallback={<Loader />}><AccountProfile /></Suspense> },

      // users
      { path: "users", element: <Suspense fallback={<Loader />}><AllUsers /></Suspense> },
      { path: "users/:userId", element: <Suspense fallback={<Loader />}><UserDetails /></Suspense> },
      { path: "earnings", element: <Suspense fallback={<Loader />}><AdminEarnings /></Suspense> },
      // listing
      { path: "listing", element: <Suspense fallback={<Loader />}><AdminListing /></Suspense> },
      { path: "listing/:listingId/details", element: <Suspense fallback={<Loader />}><AdminListingDetails/></Suspense> },
    ],
  },
  { path: "*", element: <Suspense fallback={<Loader />}><NotFound /></Suspense> },
  { path: "unauthorized", element: <Suspense fallback={<Loader />}><Unauthorized /></Suspense> },
  { path: "disabled", element: <Suspense fallback={<Loader />}><DisabledAccount /></Suspense> },
]);


// ------------------------------- APP
const App = () => {
  const { setUser, setLoading, setValidated, loading, validated } =
    useAuthStore();

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    const initAuth = async () => {
      setLoading(true);
      try {
        const userRes = await getUserInfoRequest({ signal });
        setUser(userRes.data.user);
      } catch {
        setUser(null);
      } finally {
        setValidated(true);
        setLoading(false);
      }
    };

    initAuth();
    return () => controller.abort();
  }, [setUser, setLoading, setValidated]);

  if (loading || !validated) {
    return <Loader />;
  }

  return (
    <>
      <RouterProvider router={router} />
      <Toaster
        position="top-center"
        theme="system"
        duration={4000}
        closeButton
        offset={40}
        expand
        visibleToasts={2}
        richColors
      />
    </>
  );
};

export default App;
