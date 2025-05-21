import React from 'react';
import { FaEllipsisV } from 'react-icons/fa';

const AdminCard = ({ children, className = '', loading = false }) => (
  <div className={`bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 ${className}`}>
    {loading ? (
      <div className="animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        </div>
      </div>
    ) : children}
  </div>
);

const CardHeader = ({ title, subtitle, action, menuItems }) => (
  <div className="p-6 border-b border-gray-100">
    <div className="flex items-center justify-between">
      <div>
        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-3">
        {action}
        {menuItems && (
          <div className="relative group">
            <button className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
              <FaEllipsisV className="w-4 h-4" />
            </button>
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-1 hidden group-hover:block">
              {menuItems.map((item, index) => (
                <button
                  key={index}
                  onClick={item.onClick}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 hover:text-red transition-colors"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  </div>
);

const CardBody = ({ children, className = '' }) => (
  <div className={`p-6 ${className}`}>
    {children}
  </div>
);

const CardFooter = ({ children, className = '' }) => (
  <div className={`p-6 border-t border-gray-100 ${className}`}>
    {children}
  </div>
);

const StatusBadge = ({ status, type = 'default', size = 'md' }) => {
  const getStatusColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 text-green-700 border border-green-200';
      case 'warning':
        return 'bg-yellow-50 text-yellow-700 border border-yellow-200';
      case 'error':
        return 'bg-red-50 text-red-700 border border-red-200';
      case 'info':
        return 'bg-blue-50 text-blue-700 border border-blue-200';
      default:
        return 'bg-gray-50 text-gray-700 border border-gray-200';
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'px-2 py-0.5 text-xs';
      case 'lg':
        return 'px-4 py-1.5 text-base';
      default:
        return 'px-3 py-1 text-sm';
    }
  };

  return (
    <span className={`inline-flex items-center rounded-full font-medium ${getStatusColor()} ${getSizeClasses()}`}>
      {status}
    </span>
  );
};

const CardGrid = ({ children, cols = 3, gap = 6 }) => (
  <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-${cols} gap-${gap}`}>
    {children}
  </div>
);

export { AdminCard, CardHeader, CardBody, CardFooter, StatusBadge, CardGrid }; 