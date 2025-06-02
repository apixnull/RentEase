import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles/index.css";
import App from "./App.tsx";
import { Toaster } from "./components/ui/sonner.tsx";;
import {BrowserRouter} from 'react-router-dom'

createRoot(document.getElementById("root")!).render(
  <StrictMode>
      <BrowserRouter>
      <App />
    <Toaster
      position="top-right"
      theme="dark"
      duration={4000}
      closeButton
      offset={20}
      expand
      visibleToasts={2}
      richColors
    />
</BrowserRouter>
  </StrictMode>
);
