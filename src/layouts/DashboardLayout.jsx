import React from 'react';
import Sidebar from '../components/Sidebar';

const DashboardLayout = ({ children }) => {

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar fixed on the left */}
      <Sidebar />
      
      {/* Main content area shifted by sidebar width */}
      <main className="flex-1 ml-64 min-h-screen">
        <div className="p-8 md:p-12 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
