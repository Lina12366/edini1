import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import { FaSignOutAlt, FaExternalLinkAlt, FaBell, FaCog } from 'react-icons/fa';

const AdminLayout = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleViewSite = () => {
    window.location.href = '/';
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <AdminSidebar />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Admin Header */}
        <header className="h-16 bg-white border-b border-gray-200 shadow-sm">
          <div className="h-full px-6 flex items-center justify-between">
            {/* Left side - Breadcrumb */}
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-800">Dashboard</h1>
            </div>

            {/* Right side - Actions */}
            <div className="flex items-center gap-4">
              {/* Notifications */}
              <button className="p-2 text-gray-600 hover:text-red rounded-full hover:bg-gray-100 transition-colors relative">
                <FaBell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red rounded-full"></span>
              </button>

              {/* Settings */}
              <button className="p-2 text-gray-600 hover:text-red rounded-full hover:bg-gray-100 transition-colors">
                <FaCog className="w-5 h-5" />
              </button>

              {/* View Site */}
              <button
                onClick={handleViewSite}
                className="h-9 px-4 flex items-center text-sm text-gray-600 hover:text-red rounded-md hover:bg-gray-50 transition-colors border border-gray-200"
              >
                <FaExternalLinkAlt className="w-4 h-4 mr-2" />
                View Site
              </button>

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="h-9 px-4 flex items-center text-sm text-white bg-red hover:bg-red-600 rounded-md transition-colors"
              >
                <FaSignOutAlt className="w-4 h-4 mr-2" />
                Logout
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50">
          <div className="max-w-7xl mx-auto p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;