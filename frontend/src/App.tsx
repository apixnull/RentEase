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
// ------------------------------- Lazy Imports
// Layouts
const PublicLayout = lazy(() => import("./layouts/PublicLayout"));
const LandlordLayout = lazy(() => import("./layouts/LandlordLayout"));
const TenantLayout = lazy(() => import("./layouts/TenantLayout"));
const AdminLayout = lazy(() => import("./layouts/AdminLayout"));
const PropertyLayout = lazy(
  () => import("./pages/private/landlord/property/PropertyLayout")
);
const BrowseUnitLayout = lazy(
  () => import("./pages/private/tenant/browse-unit/BrowseUnitLayout")
);

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
const EditProperty = lazy(
  () => import("./pages/private/landlord/property/EditProperty")
);
const DisplayUnits = lazy(
  () => import("./pages/private/landlord/unit/DisplayUnits")
);
const DisplaySpecificUnit = lazy(
  () => import("./pages/private/landlord/unit/DisplaySpecificUnit")
);
const CreateUnit = lazy(() => import("./pages/private/landlord/unit/CreateUnit"));
const EditUnit = lazy(() => import("./pages/private/landlord/unit/EditUnit"));
const LandlordListing = lazy(
  () => import("./pages/private/landlord/listing/LandlordListing")
);
const ReviewUnitForListing = lazy(
  () => import("./pages/private/landlord/listing/ReviewUnitForListing")
);
const ListingDetails = lazy(() =>
  import("./pages/private/landlord/listing/ListingDetails").then(
    (module) => ({ default: module.ListingDetails })
  )
);
const ListingPaymentSuccess = lazy(
  () => import("./pages/private/landlord/listing/ListingPaymentSuccess")
);
const LandlordMessages = lazy(
  () => import("./pages/private/landlord/messages/LandlordMessages.tsx")
);
const ViewChannelMessagesLandlord = lazy(
  () => import("./pages/private/landlord/messages/ViewChannelMessagesLandlord.tsx")
);
const TenantScreeningLandlord = lazy(
  () => import("./pages/private/landlord/screening/TenantScreeningLandlord.tsx")
);
const ViewSpecificScreeningLandlord = lazy(
  () =>
    import("./pages/private/landlord/screening/ViewSpecificScreeningLandlord.tsx")
);
const Leases = lazy(() => import("./pages/private/landlord/lease/Leases.tsx"));
const ViewSpecificLease = lazy(
  () => import("./pages/private/landlord/lease/ViewSpecificLease.tsx")
);
const CreateLease = lazy(
  () => import("./pages/private/landlord/lease/CreateLease.tsx")
);
const EditLease = lazy(
  () => import("./pages/private/landlord/lease/EditLease.tsx")
);
const Maintenance = lazy(
  () => import("./pages/private/landlord/maintenance/Maintenance.tsx")
);
const Tenants = lazy(() => import("./pages/private/landlord/tenants/Tenants.tsx"));
const Financials = lazy(
  () => import("./pages/private/landlord/financials/Financials.tsx")
);
const Engagement = lazy(
  () => import("./pages/private/landlord/reports/Engagement.tsx")
);
const RentPayments = lazy(
  () => import("./pages/private/landlord/payments/RentPayments.tsx")
);

// Private pages - Tenant
const TenantDashboard = lazy(
  () => import("./pages/private/tenant/TenantDashboard")
);
const BrowseProperties = lazy(
  () => import("./pages/private/tenant/browse-unit/BrowseUnit.tsx")
);
const ViewUnitDetails = lazy(
  () => import("./pages/private/tenant/browse-unit/ViewUnitDetails.tsx")
);
const TenantMessages = lazy(
  () => import("./pages/private/tenant/messages/TenantMessages.tsx")
);
const ViewChannelMessages = lazy(
  () => import("./pages/private/tenant/messages/ViewChannelMessagesTenant.tsx")
);
const MyLease = lazy(() => import("./pages/private/tenant/lease/MyLease.tsx"));
const MyLeaseDetails = lazy(
  () => import("./pages/private/tenant/lease/MyLeaseDetails.tsx")
);
const ScreeningForm = lazy(
  () => import("./pages/private/tenant/screening/ScreeningForm.tsx")
);
const TenantScreeningTenant = lazy(
  () => import("./pages/private/tenant/screening/TenantScreeningTenant.tsx")
);
const ViewSpecificScreeningTenant = lazy(
  () =>
    import("./pages/private/tenant/screening/ViewSpecificScreeningTenant.tsx")
);

// Private pages - Admin
const AdminDashboard = lazy(
  () => import("./pages/private/admin/AdminDashboard")
);
const AdminListing = lazy(
  () => import("./pages/private/admin/listing/AdminListing.tsx")
);
const AdminListingDetails = lazy(
  () =>
    import(
      "./pages/private/admin/listing/specific-listing-details/AdminListingDetailsLayout.tsx"
    )
);
const AllUsers = lazy(() => import("./pages/private/admin/users/AllUsers.tsx"));
const UserDetailsPage = lazy(
  () => import("./pages/private/admin/users/UserDetails.tsx")
);
const AdminEarnings = lazy(
  () => import("./pages/private/admin/earnings/AdminEarnings.tsx")
);
const AdminFraudReports = lazy(
  () => import("./pages/private/admin/reports/AdminFraudReports.tsx")
);
const AdminAnalytics = lazy(
  () => import("./pages/private/admin/analytics/AdminAnalytics.tsx")
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
      { path: "properties/:propertyId/edit", element: <Suspense fallback={<Loader />}><EditProperty /></Suspense> },                                           // edit property basics

      // units
      { path: "units/:propertyId", element: <Suspense fallback={<Loader />}><PropertyLayout><DisplayUnits units={[]} /></PropertyLayout></Suspense> },                     // display all units 
      { path: "units/:propertyId/:unitId", element: <Suspense fallback={<Loader />}><DisplaySpecificUnit /></Suspense> },                                       // display specific unit 
      { path: "units/:propertyId/:unitId/edit", element: <Suspense fallback={<Loader />}><EditUnit /></Suspense> },                                       // edit unit 
        
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

      // engagement
      { path: "engagement", element: <Suspense fallback={<Loader />}><Engagement /></Suspense>},

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
  { path: "tenant/browse-unit",element: <ProtectedRoute allowedRoles={["TENANT"]}><Suspense fallback={<Loader />}><BrowseUnitLayout /></Suspense></ProtectedRoute>,
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
      { path: "users/:userId", element: <Suspense fallback={<Loader />}><UserDetailsPage /></Suspense> },
      { path: "earnings", element: <Suspense fallback={<Loader />}><AdminEarnings /></Suspense> },
      { path: "analytics", element: <Suspense fallback={<Loader />}><AdminAnalytics /></Suspense> },
      // listing
      { path: "listing", element: <Suspense fallback={<Loader />}><AdminListing /></Suspense> },
      { path: "listing/:listingId/details", element: <Suspense fallback={<Loader />}><AdminListingDetails/></Suspense> },
      // fraud reports
      { path: "fraud-reports", element: <Suspense fallback={<Loader />}><AdminFraudReports /></Suspense> },
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
