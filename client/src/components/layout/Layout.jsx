import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { useAuth } from '../../context/AuthContext';

export function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      
      <div className="flex-1 flex">
        {isAuthenticated && (
          <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        )}
        
        <main className={`flex-1 p-4 sm:p-6 lg:p-8 transition-all ${isAuthenticated ? 'lg:pl-72' : ''}`}>
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
