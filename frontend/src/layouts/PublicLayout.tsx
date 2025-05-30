// src/layouts/PublicLayout.tsx
import Footer from "@/components/public/Footer";
import Navbar from "@/components/public/Navbar";
import { Outlet } from "react-router-dom";

export default function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
