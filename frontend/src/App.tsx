import { Routes, Route } from "react-router-dom";
import PublicLayout from "./layout/PublicLayout";
import Landing from "./pages/public/landing/Landing";
import About from "./pages/public/about/About";
import Login from "./pages/public/auth/login/Login";
import { Register } from "./pages/public/auth/register/Register";
import { LandlordLayout } from "./layout/LandlordLayout";
import LandlordDashboard from "./pages/private/landlord/dashboard/LandlordDashboard";
import NotFound from "./pages/NotFound404";
import VerifyOtp from "./pages/public/auth/verifyOtp/VerifyOtp";
import Unauthorized from "./pages/UnAuthorized";
import { ProtectedRoute } from "./guards/PrivateRoute";
import { TenantLayout } from "./layout/TenantLayout";
import TenantDashboard from "./pages/private/tenant/dashboard/TenantDashboard";
import { Properties } from "./pages/private/landlord/properties/Properties";
import { ViewProperty } from "./pages/private/landlord/properties/ViewProperty";
import { AddProperty } from "./pages/private/landlord/properties/AddProperty";



function App() {

  return (
    <>
      <Routes>

        {/* **************************** PUBLIC ROUTES **************************** */}
        <Route path="/" element={<PublicLayout />}>
          <Route index element={<Landing />} />
          <Route path="about" element={<About />} />
        </Route>

        {/* **************************** AUTH ROUTES **************************** */}
        <Route path="auth">
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="verify-email" element={<VerifyOtp />} />
        </Route>

        {/* ****************************  PRIVATE ROUTES **************************** */}

        {/* ****************************  ADMIN ROUTES **************************** */}
        {/* ****************************  LANDLORD ROUTES **************************** */}
        
        <Route path="landlord" element={ <ProtectedRoute allowedRoles={["LANDLORD"]}> <LandlordLayout /> </ProtectedRoute> }>
          <Route index element={<LandlordDashboard />} />

          <Route path="property/properties" element={<Properties />} />
          <Route path="property/view-property" element={<ViewProperty />} />
          <Route path="property/add-property" element={<AddProperty />} />
          
        </Route>

        {/* ****************************  TENANT ROUTES **************************** */}

        <Route path="tenant" element={ <ProtectedRoute allowedRoles={["TENANT"]}> <TenantLayout /> </ProtectedRoute> }>
          <Route index element={<TenantDashboard />} />
      
        </Route>

        {/* **************************** NOT FOUND 404 **************************** */}
        <Route path="*" element={<NotFound />} />
        {/* **************************** UNAUTHORIZED ACCESS 401 **************************** */}
        <Route path="unauthorized" element={<Unauthorized />} />

      </Routes>
    </>
  );
}

export default App;
