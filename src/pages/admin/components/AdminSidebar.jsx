import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaChartLine, FaBus, FaRoute, FaCalendarAlt, FaTicketAlt, FaChevronRight } from 'react-icons/fa';

const AdminSidebar = () => {
  const location = useLocation();
  
  const menuItems = [
    { path: '/admin/dashboard', name: 'Dashboard', icon: <FaChartLine className="w-5 h-5" /> },
    { path: '/admin/vehicles', name: 'Vehicles', icon: <FaBus className="w-5 h-5" /> },
    { path: '/admin/routes', name: 'Routes', icon: <FaRoute className="w-5 h-5" /> },
    { path: '/admin/schedules', name: 'Schedules', icon: <FaCalendarAlt className="w-5 h-5" /> },
    { path: '/admin/bookings', name: 'Bookings', icon: <FaTicketAlt className="w-5 h-5" /> }
  ];

  return (
    <div className="bg-white w-64 h-screen shadow-lg flex flex-col border-r border-gray-200">
      {/* Title */}
      <div className="p-6 border-b border-gray-100">
        <h2 className="text-xl font-bold text-gray-800">Admin Panel</h2>
        <p className="text-sm text-gray-500 mt-1">Manage your system</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center justify-between px-4 py-3 text-gray-700 rounded-lg transition-all duration-200 group ${
                isActive 
                  ? 'bg-red/10 text-red' 
                  : 'hover:bg-gray-50 hover:text-red'
              }`}
            >
              <div className="flex items-center">
                <span className={`mr-3 ${isActive ? 'text-red' : 'text-gray-500 group-hover:text-red'}`}>
                  {item.icon}
                </span>
                <span className="font-medium">{item.name}</span>
              </div>
              <FaChevronRight 
                className={`w-4 h-4 transition-transform duration-200 ${
                  isActive ? 'text-red transform rotate-90' : 'text-gray-400 group-hover:text-red'
                }`}
              />
            </Link>
          );
        })}
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-gray-100">
        <div className="flex items-center p-3 rounded-lg bg-gray-50">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red to-red-600 flex items-center justify-center text-white font-bold">
            A
          </div>
          <div className="ml-3 flex-1">
            <p className="text-sm font-medium text-gray-800">Admin User</p>
            <p className="text-xs text-gray-500">admin@example.com</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSidebar;