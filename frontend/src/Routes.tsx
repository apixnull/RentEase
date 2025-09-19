import { createBrowserRouter, RouterProvider } from "react-router-dom";

import PublicLayout from "./layouts/PublicLayout";
import Landing from "./pages/public/Landing";
import About from "./pages/public/About";
import Features from "./pages/public/Features";
import Register from "./pages/authentication/Register";
import Login from "./pages/authentication/Login";
import ForgotPassword from "./pages/authentication/ForgotPassword";
import ResetPassword from "./pages/authentication/ResetPassword";
import VerifyEmail from "./pages/authentication/VerifyEmail";
import Onboarding from "./pages/authentication/Onboarding";
import { LandlordLayout } from "./layouts/LandlordLayout";
import LandlordDashboard from "./pages/private/landlord/LandlordDashboard";
import { TenantLayout } from "./layouts/TenantLayout";
import TenantDashboard from "./pages/private/tenant/TenantDashboard";
import { AdminLayout } from "./layouts/AdminLayout";
import AdminDashboard from "./pages/private/admin/AdminDashboard";
import AccountProfile from "./pages/private/AccountProfile";
import CreateProperty from "./pages/private/landlord/property/CreateProperty";
import DisplayProperty from "./pages/private/landlord/property/DisplayAllProperties";
import PropertyDetails from "./pages/private/landlord/property/PropertyDetails";
import BrowseProperties from "./pages/private/tenant/BrowseProperties";
import Messages from "./pages/private/Messages";
import AddUnit from "./pages/private/landlord/property/AddUnit";
import NotFound from "./pages/fallbacks/NotFound";
import Unauthorized from "./pages/fallbacks/Unauthorized";
import DisabledAccount from "./pages/fallbacks/DisabledAccount";


const router = createBrowserRouter([
  // ------------------------------- PUBLIC ROUTES
  {
    path: "/",
    element: <PublicLayout />, 
    children: [
      { index: true, element: <Landing /> },  
      { path: "about", element: <About /> },  
      { path: "features", element: <Features /> },      
    ],
  },
  // ------------------------------- AUTHENTICATION ROUTES
  {
    path: "auth",
    children: [
        { path: "register", element: <Register />},
        { path: "login", element: <Login />},
        { path: "forgot-password", element: <ForgotPassword />},
        { path: "reset-password", element: <ResetPassword />},
        { path: "verify-email", element: <VerifyEmail />},
        { path: "onboarding", element: <Onboarding />},
    ]
  },
  // ------------------------------- LANDLORD ROUTES
  {
    path: "landlord",
    element: <LandlordLayout />,
    children: [
        { index: true, element: <LandlordDashboard />},
        { path: "properties", element: <DisplayProperty />},
        { path: "properties/:propertyId", element: <PropertyDetails />},
        { path: "properties/create", element: <CreateProperty />},
        { path: "properties/unit/add", element: <AddUnit />},
        { path: "account", element: <AccountProfile />},
        { path: "messages", element: <Messages />}

    ]
  }, 
  // ------------------------------- TENANT ROUTES
  {
    path: "tenant",
    element: <TenantLayout />,
    children: [
        { index: true, element: <TenantDashboard />},
        { path: "account", element: <AccountProfile />},
        { path: "messages", element: <Messages />}
    ]
  }, 
  { 
    path: "tenant/browse-properties", 
    element: <BrowseProperties />
  },
  // ------------------------------- ADMIN ROUTES
  {
    path: "admin",
    element: <AdminLayout />,
    children: [
        {index: true, element: <AdminDashboard />},
        { path: "account", element: <AccountProfile />},
    ]
  },
  // ------------------------------- FALLBACK ROUTES
  {  path: "*", element: <NotFound />}, // 404 not found
  {  path: "unauthorized", element: <Unauthorized />}, // 401 unauthorized access
  {  path: "disabled", element: <DisabledAccount />} // 403 unauthorized access


]);

const Routes = () => <RouterProvider router={router} />;

export default Routes;
