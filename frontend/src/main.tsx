import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { Toaster } from "./components/ui/sonner.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
    <Toaster
      position="top-right"
      richColors
      closeButton
      expand
      toastOptions={{
        duration: 4000,
        style: {
          fontSize: "0.9rem",
          padding: "0.9rem",
        },
      }}
    />
  </StrictMode>
);
