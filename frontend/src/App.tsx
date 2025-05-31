import { Routes, Route } from "react-router-dom";
import PublicLayout from "./layouts/PublicLayout";
import Landing from "./pages/public/landing/Landing";
import AuthLayout from "./layouts/AuthLayout";
import Login from "./pages/auth/login/Login";
import Register from "./pages/auth/register/Register";
import VerifyEmail from "./pages/auth/VerifyEmail";

export default function App() {
  return (
    <>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<PublicLayout />}>
          <Route index element={<Landing />} />
          {/* <Route path="about" element={<About />} /> */}
        </Route>

        {/* Auth Routes */}
        <Route path="/auth" element={<AuthLayout />}>
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="verify-email" element={<VerifyEmail />} /> 
        </Route>

        {/* Private Routes (e.g., dashboard, settings) */}
        {/* <Route path="/dashboard" element={<PrivateLayout />}>
          <Route index element={<Dashboard />} />
        </Route> */}
      </Routes>
      {/* <button onClick={() => toast("Normal message")}>Normal</button>
      <button onClick={() => toast.success("Success message")}>Success</button>
      <button onClick={() => toast.warning("Warning message")}>Warning</button>
      <button onClick={() => toast.error("Error message")}>Error</button> */}

    </>
  );
}


// db password: p5VXaXY1zkDtbCEO
// callback url: https://isdyjljwklxhwouccxff.supabase.co/auth/v1/callback
// api-key-google: AIzaSyDe_9VEp5QLKQcaDerHYdZXZlPW83TAlFk