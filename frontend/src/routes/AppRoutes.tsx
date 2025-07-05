import ProtectedRoute from "@/guards/ProtectedRoutes"
import { LandlordLayout } from "@/layouts/LandlordLayout"
import PublicLayout from "@/layouts/PublicLayout"
import ForgotPassword from "@/pages/authentication/forgotPassword/ForgotPassword"
import Login from "@/pages/authentication/login/Login"
import Register from "@/pages/authentication/register/Register"
import ResetPassword from "@/pages/authentication/resetPassword/ResetPassword"
import VerifyEmail from "@/pages/authentication/verifyEmail/VerifyEmail"
import DisabledAccount from "@/pages/DisabledAccount"
import InvalidAction from "@/pages/InvalidAction"
import LandlordDashboard from "@/pages/landlord/dashboard/LandlordDashboard"
import NotFound from "@/pages/NotFound"
import About from "@/pages/public/about/About"
import Features from "@/pages/public/features/Features"
import Landing from "@/pages/public/landing/Landing"
import Unauthorized from "@/pages/Unauthorized"
import { Route, Routes } from "react-router-dom"

const AppRoutes = () => {
  return (
    <>
      <Routes>
        {/* ******************** PUBLIC routes ******************** */}
        <Route path="/" element={<PublicLayout />}>
          <Route index element={<Landing />} />
          <Route path="about" element={<About />} />
          <Route path="features" element={<Features />} />
        </Route>

        {/* ******************** AUTHENTICATION routes ******************** */}
        <Route path="auth">
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="verify-email" element={<VerifyEmail />} />
          <Route path="forget-password" element={<ForgotPassword />} />
          <Route path="reset-password" element={<ResetPassword />} />
        </Route>

        {/* ******************** LANDLORD routes ******************** */}
        <Route path="landlord" element={<ProtectedRoute allowedRoles={["LANDLORD"]}><LandlordLayout /></ProtectedRoute>}>
          <Route index element={<LandlordDashboard />}/>
        </Route>

        {/* ******************** NOTFOUND 404 routes ******************** */}
        <Route path="*" element={<NotFound />}/>

        {/* ******************** UNAUTHORIZED 403 routes ******************** */}
        <Route path="/unauthorized" element={<Unauthorized />}/>

        {/* ******************** DISABLED ACCOUNT routes ******************** */}
        <Route path="/disabled" element={<DisabledAccount />}/>

        {/* ******************** INVAID ACTION routes ******************** */}
        <Route path="/invalid-action" element={<InvalidAction />}/>
        
      </Routes>
    </>
  )
}

export default AppRoutes