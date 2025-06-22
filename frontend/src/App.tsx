import { Routes, Route} from "react-router-dom";
import PublicLayout from "./layout/PublicLayout";
import Landing from "./pages/public/landing/Landing";
import About from "./pages/public/about/About";



function App() {
  return (
    <>
      <Routes>

        {/* **************************** PUBLIC ROUTES **************************** */}
        <Route path="/" element={<PublicLayout />}>
          <Route index element={<Landing />}></Route>
          <Route path="/about" element={<About />}></Route>
        </Route>

        {/* **************************** AUTH ROUTES **************************** */}
        <Route>

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
