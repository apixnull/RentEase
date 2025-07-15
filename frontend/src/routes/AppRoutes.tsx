// src/router/appRouter.tsx

// Import core routing tools from React Router v6.4+
import {
  createBrowserRouter,
  RouterProvider,
  redirect,
  type LoaderFunctionArgs,
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
import Properties from "@/pages/landlord/property/Properties";

// Public Pages
import About from "@/pages/public/about/About";
import Features from "@/pages/public/features/Features";
import Landing from "@/pages/public/landing/Landing";

// Error/System Pages
import NotFound from "@/pages/NotFound";
import Unauthorized from "@/pages/Unauthorized";
import DisabledAccount from "@/pages/DisabledAccount";
import InvalidAction from "@/pages/InvalidAction";
import axios from "axios";
import PropertyDetails from "@/pages/landlord/property/PropertyDetails";

// -------------------------------------------------------------------
// ⏳ Loader: Pre-fetch landlord properties data before rendering page
// -------------------------------------------------------------------
const fetchLandlordProperties = async () => {
  try {
    const res = await axios.get("http://localhost:4000/api/landlord/property/properties", {
      withCredentials: true,
    });

    // ✅ The actual properties array is under res.data.properties
    const properties = res.data?.properties;

    if (!Array.isArray(properties)) {
      throw new Error("Invalid response format: expected properties to be an array.");
    }

    return { properties }; // loader data must match the expected structure
  } catch (err: any) {
    if (err.response?.status === 401) {
      throw redirect("/unauthorized");
    }

    throw new Response("Failed to load properties", {
      status: err.response?.status || 500,
      statusText: err.message || "Unknown error",
    });
  }
};

const propertyDetailsLoader = async ({ params }: LoaderFunctionArgs) => {
  const id = params?.id;

  if (!id) {
    throw new Response("Missing property ID", { status: 400 });
  }

  try {
    const { data } = await axios.get(`http://localhost:4000/api/landlord/property/${id}`, {
      withCredentials: true,
    });

    if (!data?.property) {
      throw new Response("Property not found", { status: 404 });
    }

    return { property: data.property };
  } catch (error: any) {
    const status = error?.response?.status;

    if (status === 401) throw redirect("/unauthorized");

    throw new Response("Error fetching property details", {
      status: status || 500,
      statusText: error?.message || "Unexpected error",
    });
  }
};

// -------------------------------------------------------------------
// 🌐 Main Application Router Configuration
// -------------------------------------------------------------------
const router = createBrowserRouter([
  // 🔓 Public Routes
  {
    path: "/",
    element: <PublicLayout />,
    children: [
      { index: true, element: <Landing /> },
      { path: "about", element: <About /> },
      { path: "features", element: <Features /> },
    ],
  },

  // 🔐 Authentication Routes
  { path: "auth/login", element: <Login /> },
  { path: "auth/register", element: <Register /> },
  { path: "auth/verify-email", element: <VerifyEmail /> },
  { path: "auth/forget-password", element: <ForgotPassword /> },
  { path: "auth/reset-password", element: <ResetPassword /> },

  // 🏠 Landlord Portal (Protected)
  {
    path: "/landlord",
    element: (
      <ProtectedRoute allowedRoles={["LANDLORD"]}>
        <LandlordLayout />
      </ProtectedRoute>
    ),
    children: [
      // Dashboard (default child)
      { index: true, element: <LandlordDashboard /> },

      // Properties page with loader (server-side data fetch)
      {
        path: "property/my-properties",
        element: <Properties />,
        loader: fetchLandlordProperties,
      },
      {
        path: "property/:id",
        element: <PropertyDetails />,
        loader: propertyDetailsLoader, // <- add loader here
      }
    ],
  },

  // 🚫 System & Error Routes
  { path: "/unauthorized", element: <Unauthorized /> },
  { path: "/disabled", element: <DisabledAccount /> },
  { path: "/invalid-action", element: <InvalidAction /> },
  { path: "*", element: <NotFound /> }, // 404 fallback
]);

// Export the RouterProvider to be used in main.tsx
const AppRoutes = () => <RouterProvider router={router} />;

export default AppRoutes;
