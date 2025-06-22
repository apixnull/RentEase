import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { Toaster } from "./components/ui/sonner.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
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
  </StrictMode>
);
