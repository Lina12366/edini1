import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaHome, FaSignOutAlt, FaBell, FaCog } from 'react-icons/fa';

const AdminNavbar = () => {
  const navigate = useNavigate();

  return (
    <nav className="bg-white h-16 shadow-sm flex items-center justify-between px-6 border-b border-gray-100">
      <div className="flex items-center">
        <h1 className="text-xl font-semibold text-gray-800">Edini Ticket Booking</h1>
      </div>
      
      <div className="flex items-center space-x-4">
        <button
          className="p-2 text-gray-600 hover:text-red rounded-full hover:bg-gray-100 transition-colors"
          title="Notifications"
        >
          <FaBell className="w-5 h-5" />
        </button>
        
        <button
          className="p-2 text-gray-600 hover:text-red rounded-full hover:bg-gray-100 transition-colors"
          title="Settings"
        >
          <FaCog className="w-5 h-5" />
        </button>

        <button
          onClick={() => navigate('/')}
          className="flex items-center px-4 py-2 text-gray-600 hover:text-red transition-colors"
        >
          <FaHome className="w-5 h-5 mr-2" />
          <span>View Site</span>
        </button>

        <button
          onClick={() => {
            // Add logout logic here
            navigate('/login');
          }}
          className="flex items-center px-4 py-2 bg-red text-white rounded-lg hover:bg-red-600 transition-colors"
        >
          <FaSignOutAlt className="w-5 h-5 mr-2" />
          <span>Logout</span>
        </button>
      </div>
    </nav>
  );
};

export default AdminNavbar;