import AppRoutes from "./routes/AppRoutes";
import { Toaster } from "sonner";
import { AuthProvider } from "./context/AuthContext";

const App = () => {

  return (
    <AuthProvider>
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
    </AuthProvider>
  );
};

export default App;
