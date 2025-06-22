import { Routes, Route} from "react-router-dom";
import PublicLayout from "./layout/PublicLayout";
import Landing from "./pages/public/landing/Landing";
import About from "./pages/public/about/About";
import Login from "./pages/public/auth/login/Login";



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
          <Route path="register" />
          <Route path="verify-email" />
        </Route>
        
        {/* **************************** PRIVATE ROUTES **************************** */}
        <Route>

        </Route>

        {/* **************************** ADMIN ROUTES **************************** */}
        <Route>

        </Route>


        {/* **************************** TENANT ROUTES **************************** */}
        <Route>

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
