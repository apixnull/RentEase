// src/router/appRouter.tsx

// Import core routing tools from React Router v6.4+
import {
  createBrowserRouter,
  RouterProvider
} from "react-router-dom";

// Guards & Layouts
import ProtectedRoute from "@/guards/ProtectedRoutes";
import { LandlordLayout } from "@/layouts/LandlordLayout";
import PublicLayout from "@/layouts/PublicLayout";

// Auth Pages
import ForgotPassword from "@/pages/authentication/forgotPassword/ForgotPassword";
import Login from "@/pages/authentication/login/Login";
import Register from "@/pages/authentication/register/Register";
import ResetPassword from "@/pages/authentication/resetPassword/ResetPassword";
import VerifyEmail from "@/pages/authentication/verifyEmail/VerifyEmail";

// Landlord Pages
import LandlordDashboard from "@/pages/landlord/dashboard/LandlordDashboard";
import Properties from "@/pages/landlord/property/properties/Properties";

// Public Pages
import About from "@/pages/public/about/About";
import Features from "@/pages/public/features/Features";
import Landing from "@/pages/public/landing/Landing";

// Error/System Pages
import NotFound from "@/pages/NotFound";
import Unauthorized from "@/pages/Unauthorized";
import DisabledAccount from "@/pages/DisabledAccount";
import InvalidAction from "@/pages/InvalidAction";
import PropertyDetails from "@/pages/landlord/property/property-details/PropertyDetails";
import TenantLayout  from "@/layouts/TenantLayout";
import TenantDashboard from "@/pages/tenant/dashboard/TenantDashboard";
import BrowseProperty from "@/pages/tenant/browse-property/BrowseProperty";
import Maintenances from "@/pages/landlord/maintenance/Maintenances";
import AddProperty from "@/pages/landlord/property/add-property/AddProperty";
import ManageUnit from "@/pages/landlord/property/property-details/ManageUnit";




// -------------------------------------------------------------------
// 🌐 Main Application Router Configuration
// -------------------------------------------------------------------
const router = createBrowserRouter([

  /* **************************************************** PUBLIC ROUTES **************************************************** */
  {
    path: "/",
    element: <PublicLayout />,
    children: [
      { index: true, element: <Landing /> },
      { path: "about", element: <About /> },
      { path: "features", element: <Features /> },
    ],
  },
  { path: "auth/login", element: <Login /> },
  { path: "auth/register", element: <Register /> },
  { path: "auth/verify-email", element: <VerifyEmail /> },
  { path: "auth/forget-password", element: <ForgotPassword /> },
  { path: "auth/reset-password", element: <ResetPassword /> },

  /* **************************************************** LANDLORD ROUTES **************************************************** */

  {
    path: "/landlord",
    element: (
      <ProtectedRoute allowedRoles={["LANDLORD"]}>
        <LandlordLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <LandlordDashboard /> },

      // property
      {
        path: "property/my-properties",
        element: <Properties />,
      },
      {
        path: "property/:id",
        element: <PropertyDetails />,
      },
      {
        path: "property/add-property",
        element: <AddProperty/>,
      },
      {
        path: "property/:propertyId/unit/:unitId",
        element: <ManageUnit />, 
      },

      // maintenances
      {
        path: "maintenance/maintenances",
        element: <Maintenances />
      }
    ],
  },

  /* **************************************************** TENANT ROUTES **************************************************** */
  {
    path: "/tenant",
    element: (
      <ProtectedRoute allowedRoles={["TENANT"]}>
        <TenantLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <TenantDashboard /> },
      {
        path: "listing/my-properties",
        element: <Properties />,
      },
      {
        path: "property/:id",
        element: <PropertyDetails />,
      },
    ],
  },

  // Standalone route without TenantLayout
  {
    path: "/tenant/browse-property",
    element: (
      <ProtectedRoute allowedRoles={["TENANT"]}>
        <BrowseProperty />
      </ProtectedRoute>
    ),
  },






  /* **************************************************** STATUS ROUTES **************************************************** */
  { path: "/unauthorized", element: <Unauthorized /> },
  { path: "/disabled", element: <DisabledAccount /> },
  { path: "/invalid-action", element: <InvalidAction /> },
  { path: "*", element: <NotFound /> },
]);

const AppRoutes = () => <RouterProvider router={router} />;
export default AppRoutes;
