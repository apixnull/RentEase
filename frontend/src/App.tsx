import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes";
import { Toaster } from "sonner";
import { AuthProvider } from "./pages/context/AuthContext";

const App = () => {

  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
        <Toaster
          position="top-center"
          theme="system"
          duration={4000}
          closeButton
          offset={40}
          expand
          visibleToasts={2}
          richColors
        />
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
