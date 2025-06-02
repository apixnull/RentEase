import Navbar from '@/components/public/Navbar';
import React from 'react';
import { Outlet } from 'react-router-dom';

const PublicLayout: React.FC = () => {
  return (
    <div>
        <Navbar />

      <main className="min-h-[80vh] p-6">
        <Outlet />
      </main>

      <footer className="bg-gray-200 text-center py-4 text-sm text-gray-600">
        © 2025 RentEase. All rights reserved.
      </footer>
    </div>
  );
};

export default PublicLayout;
