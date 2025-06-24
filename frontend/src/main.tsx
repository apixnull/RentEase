// import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { Toaster } from "./components/ui/sonner.tsx";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.tsx";



createRoot(document.getElementById("root")!).render(
  // <StrictMode>  if enabled useEffects and components are run twice or more 
      <BrowserRouter>
       <AuthProvider>
          <App />
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
      </BrowserRouter>
  // </StrictMode>
);
