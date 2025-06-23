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
        <GlobalLoader
  isLoading={false}
  size="lg"
  variant="blue-green"
/>

    </div>
  );
};

export default PublicLayout;
