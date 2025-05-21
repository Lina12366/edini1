import React from 'react';

const AdminPageLayout = ({ title, children, actionButton }) => {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">{title}</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your {title.toLowerCase()} efficiently</p>
        </div>
        {actionButton}
      </div>

      {/* Page Content */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        {children}
      </div>
    </div>
  );
};

export default AdminPageLayout; 