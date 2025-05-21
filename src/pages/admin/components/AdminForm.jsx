import React from 'react';
import { FaSpinner } from 'react-icons/fa';

const AdminForm = ({ 
  onSubmit, 
  children, 
  submitText = 'Submit',
  loading = false,
  className = '',
  submitButtonProps = {}
}) => {
  return (
    <form onSubmit={onSubmit} className={`space-y-6 ${className}`}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {children}
      </div>
      <div className="flex justify-end gap-3">
        <button
          type="submit"
          disabled={loading}
          className={`px-6 py-2.5 bg-red text-white rounded-lg hover:bg-red-600 transition-all duration-200 
            focus:outline-none focus:ring-2 focus:ring-red focus:ring-offset-2 disabled:opacity-50 
            disabled:cursor-not-allowed flex items-center gap-2 ${submitButtonProps.className || ''}`}
          {...submitButtonProps}
        >
          {loading && <FaSpinner className="w-4 h-4 animate-spin" />}
          {submitText}
        </button>
      </div>
    </form>
  );
};

const FormGroup = ({ 
  label, 
  children, 
  fullWidth = false, 
  required = false,
  error,
  helperText,
  className = ''
}) => (
  <div className={`${fullWidth ? 'col-span-2' : ''} ${className}`}>
    <label className="block text-sm font-medium text-gray-700 mb-1.5">
      {label}
      {required && <span className="text-red ml-1">*</span>}
    </label>
    {children}
    {error && (
      <p className="mt-1 text-sm text-red-600">{error}</p>
    )}
    {helperText && !error && (
      <p className="mt-1 text-sm text-gray-500">{helperText}</p>
    )}
  </div>
);

const FormInput = ({ 
  type = 'text', 
  error,
  className = '',
  ...props 
}) => (
  <input
    type={type}
    className={`w-full rounded-lg border-gray-300 shadow-sm 
      focus:border-red focus:ring-red transition-colors duration-200
      ${error ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}
      ${className}`}
    {...props}
  />
);

const FormSelect = ({ 
  children, 
  error,
  className = '',
  ...props 
}) => (
  <select
    className={`w-full rounded-lg border-gray-300 shadow-sm 
      focus:border-red focus:ring-red transition-colors duration-200
      ${error ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}
      ${className}`}
    {...props}
  >
    {children}
  </select>
);

const FormTextarea = ({ 
  error,
  className = '',
  ...props 
}) => (
  <textarea
    className={`w-full rounded-lg border-gray-300 shadow-sm 
      focus:border-red focus:ring-red transition-colors duration-200
      ${error ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}
      ${className}`}
    {...props}
  />
);

const FormCheckbox = ({ 
  label, 
  error,
  className = '',
  ...props 
}) => (
  <div className="flex items-center">
    <input
      type="checkbox"
      className={`h-4 w-4 text-red focus:ring-red border-gray-300 rounded
        ${error ? 'border-red-300' : ''}
        ${className}`}
      {...props}
    />
    <label className="ml-2 block text-sm text-gray-700">
      {label}
    </label>
  </div>
);

export { 
  AdminForm, 
  FormGroup, 
  FormInput, 
  FormSelect, 
  FormTextarea,
  FormCheckbox
}; 