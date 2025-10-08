// file: App.tsx
import { useEffect, lazy, Suspense } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Toaster } from "sonner";

// Guards
import { AuthRedirectRoute, ProtectedRoute } from "./Guard";

// Store + API
import { useAuthStore } from "./stores/useAuthStore";
import {
  checkAuthStatusRequest,
  refreshTokenRequest,
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
  () => import("./pages/private/landlord/LandlordDashboard")
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
const Messages = lazy(() => import("./pages/private/Messages"));

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
  {
    path: "/",
    element: <Suspense fallback={<Loader />}><PublicLayout /></Suspense>,
    children: [
      { index: true, element: <Suspense fallback={<Loader />}><Landing /></Suspense> },
      { path: "about", element: <Suspense fallback={<Loader />}><About /></Suspense> },
      { path: "features", element: <Suspense fallback={<Loader />}><Features /></Suspense> },
    ],
  },
  {
    path: "auth",
    children: [
      { path: "register", element: <AuthRedirectRoute><Suspense fallback={<Loader />}><Register /></Suspense></AuthRedirectRoute> },
      { path: "login", element: <AuthRedirectRoute><Suspense fallback={<Loader />}><Login /></Suspense></AuthRedirectRoute> },
      { path: "forgot-password", element: <AuthRedirectRoute><Suspense fallback={<Loader />}><ForgotPassword /></Suspense></AuthRedirectRoute> },
      { path: "reset-password/:token", element: <Suspense fallback={<Loader />}><ResetPassword /></Suspense> },
      { path: "verify-email/:token", element: <Suspense fallback={<Loader />}><VerifyEmail /></Suspense> },
      { path: "onboarding", element: <Suspense fallback={<Loader />}><Onboarding /></Suspense> },
    ],
  },
  {
    path: "landlord",
    element: <ProtectedRoute allowedRoles={["LANDLORD"]}><Suspense fallback={<Loader />}><LandlordLayout /></Suspense></ProtectedRoute>,
    children: [
      // dashboard
      { index: true, element: <Suspense fallback={<Loader />}><LandlordDashboard /></Suspense> },

      // properties
      { path: "properties", element: <Suspense fallback={<Loader />}><DisplayProperties /></Suspense> },                                                        // display all properties 
      { path: "properties/create", element: <Suspense fallback={<Loader />}><CreateProperty /></Suspense> },                                                    // create property
      { path: "properties/:propertyId", element: <Suspense fallback={<Loader />}><PropertyLayout><DisplaySpecificProperty /></PropertyLayout></Suspense> },     // display specific property

      // units
      { path: "units/:propertyId", element: <Suspense fallback={<Loader />}><PropertyLayout><DisplayUnits /></PropertyLayout></Suspense> },                     // display all units 
      { path: "units/:propertyId/create", element: <Suspense fallback={<Loader />}><CreateUnit /></Suspense> },                                                 // create a unit 
      { path: "units/:propertyId/:unitId", element: <Suspense fallback={<Loader />}><DisplaySpecificUnit /></Suspense> },                                       // display specific unit 
        
      // listing
      { path: "listing", element: <Suspense fallback={<Loader />}><LandlordListing /></Suspense>},                                                              // display all landlord listings
      { path: "listing/:unitId/review", element: ( <Suspense fallback={<Loader />}> <ReviewUnitForListing /> </Suspense>) },                                    // ✅ review specific unit before creating a listing
      { path: "listing/:listingId/success",  element: ( <Suspense fallback={<Loader />}> <ListingPaymentSuccess /> </Suspense>) },
      { path: "listing/:listingId/details", element: (<Suspense fallback={<Loader />}> <ListingDetails /></Suspense> ), },                                      // ✅ display specific listing details (property + unit info)
      // account
      { path: "account", element: <Suspense fallback={<Loader />}><AccountProfile /></Suspense> },  
      { path: "messages", element: <Suspense fallback={<Loader />}><Messages /></Suspense> },
    ],
  },
  {
    path: "tenant",
    element: <ProtectedRoute allowedRoles={["TENANT"]}><Suspense fallback={<Loader />}><TenantLayout /></Suspense></ProtectedRoute>,
    children: [
      { index: true, element: <Suspense fallback={<Loader />}><TenantDashboard /></Suspense> },
      { path: "account", element: <Suspense fallback={<Loader />}><AccountProfile /></Suspense> },
      { path: "messages", element: <Suspense fallback={<Loader />}><Messages /></Suspense> },
    ],
  },
  { path: "tenant/browse-unit", element: <ProtectedRoute allowedRoles={["TENANT"]}><Suspense fallback={<Loader />}><BrowseProperties /></Suspense></ProtectedRoute>},
  { path: "tenant/browse-unit/:listingId/details", element: <ProtectedRoute allowedRoles={["TENANT"]}><Suspense fallback={<Loader />}><ViewUnitDetails/></Suspense></ProtectedRoute>},

  {
    path: "admin",
    element: <ProtectedRoute allowedRoles={["ADMIN"]}><Suspense fallback={<Loader />}><AdminLayout /></Suspense></ProtectedRoute>,
    children: [
      { index: true, element: <Suspense fallback={<Loader />}><AdminDashboard /></Suspense> },
      { path: "account", element: <Suspense fallback={<Loader />}><AccountProfile /></Suspense> },
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
        await checkAuthStatusRequest({ signal });
        const userRes = await getUserInfoRequest({ signal });
        setUser(userRes.data.user);
      } catch (err: any) {
        if ([401, 403, 500].includes(err.response?.status)) {
          try {
            await refreshTokenRequest({ signal });
            await checkAuthStatusRequest({ signal });
            const userRes = await getUserInfoRequest({ signal });
            setUser(userRes.data.user);
          } catch {
            setUser(null);
          }
        } else {
          setUser(null);
        }
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
