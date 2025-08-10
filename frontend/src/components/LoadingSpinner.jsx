import React from 'react';
import { ShieldCheckIcon } from '@heroicons/react/24/outline';

const LoadingSpinner = ({ size = 'md', message = 'Loading...' }) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16'
  };

  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div className="relative">
        <div className={`${sizeClasses[size]} animate-spin rounded-full border-4 border-gray-200 border-t-emerald-500`}></div>
        <ShieldCheckIcon className={`${sizeClasses[size]} absolute inset-0 text-emerald-500 animate-pulse`} />
      </div>
      {message && (
        <p className="mt-4 text-gray-600 text-center">{message}</p>
      )}
    </div>
  );
};

export default LoadingSpinner;
