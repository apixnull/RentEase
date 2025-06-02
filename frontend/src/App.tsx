import { Route, Routes } from "react-router-dom";
import { toast } from "sonner";
import PublicLayout from "./layouts/PublicLayout";
import Home from "./pages/public/Home";
import NotFound from "./pages/NotFound";
import AuthLayout from "./layouts/AuthLayout";
import { Login } from "./pages/auth/Login";
import { Register } from "./pages/auth/Register";

function App() {
  return (
    <>
      <Routes>
        {/* Public Routes */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          {/* <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/unauthorized" element={<Unauthorized />} /> */}
        </Route>
        
         <Route element={<AuthLayout />}>
          <Route path="/auth/login" element={<Login />} />
          <Route path="/auth/register" element={<Register />} />
          {/* <Route path="/unauthorized" element={<Unauthorized />} /> */} 
        </Route>


         
            
        {/* Fallback route */}
        <Route path="*" element={<NotFound />} />
      </Routes>


      <div className="p-4 space-y-4 flex items-start gap-2">
        <button onClick={() => toast.success("Payment received successfully!")}>
          Show Success
        </button>

        <button onClick={() => toast.error("Failed to fetch data.")}>
          Show Error
        </button>

        <button onClick={() => toast.warning("Storage space is almost full.")}>
          Show Warning
        </button>

        <button onClick={() => toast.info("New feature available!")}>
          Show Info
        </button>

        <button onClick={() => toast.loading("Loading...")}>
          Show Loading
        </button>
      </div>
    </>
  );
}

export default App;
