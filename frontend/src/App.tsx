import { Routes, Route} from "react-router-dom";
import PublicLayout from "./layout/PublicLayout";
import Landing from "./pages/public/landing/Landing";
import About from "./pages/public/about/About";
import Login from "./pages/public/auth/login/Login";
import { Register } from "./pages/public/auth/register/Register";
import VerifyOtp from "./pages/public/auth/verifyOtp/VerifyOtp";



function App() {

  return (
    <>
      <Routes>

        {/* **************************** PUBLIC ROUTES **************************** */}
        <Route path="/" element={<PublicLayout />}>
          <Route index element={<Landing />} />
          <Route path="/about" element={<About />} />
        </Route>

        {/* **************************** AUTH ROUTES **************************** */}
        <Route path="auth">
          <Route path="login" element={<Login />}/>
          <Route path="register" element={<Register />}/>
          <Route path="verify-email" element={<VerifyOtp />}/>
        </Route>
        
        {/* **************************** level 1 PRIVATE ROUTES **************************** */}
        <Route>

          {/* **************************** level 2 ADMIN ROUTES **************************** */}
          <Route>

          </Route>

          {/* **************************** level 2 LANDLORD ROUTES **************************** */}
          <Route>

          </Route>


          {/* **************************** level 2 TENANT ROUTES **************************** */}
          <Route>

          </Route>  

        </Route>
        {/* **************************** NOT FOUND 404 **************************** */}
        <Route path="*"/>

        
        {/* **************************** UNAUTHORIZED ACCESS 401 **************************** */}
        <Route path="*"/>

      </Routes> 
    </>
  );
}

export default App;
