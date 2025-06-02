import Footer from '@/components/public/Footer';
import Navbar from '@/components/public/Navbar';
import React from 'react';
import { Outlet } from 'react-router-dom';

const PublicLayout: React.FC = () => {
  return (
    <div>
        <Navbar />
        <Outlet />
        <Footer />
    </div>
  );
};

export default PublicLayout;
