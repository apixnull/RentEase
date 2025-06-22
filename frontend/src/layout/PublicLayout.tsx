import Footer from '@/components/public/Footer';
import Navbar from '@/components/public/Navbar';
import { GlobalLoader } from '@/components/shared/GlobalLoader';
import React from 'react';
import { Outlet } from 'react-router-dom';

const PublicLayout: React.FC = () => {
  return (
    <div>
        <Navbar />
        <Outlet />
        <Footer />
        <GlobalLoader isLoading={true} variant="green-blue"
  
  text="Loading data..."
  customColors={["#ec4899", "#8b5cf6"]} 
  size="sm" />

    </div>
  );
};

export default PublicLayout;
