import React from 'react';
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline';
import { useTheme } from '../contexts/ThemeContext';

const ThemeToggle = () => {
  const { isDarkMode, toggleTheme } = useTheme();

  const handleToggle = () => {
    console.log('ThemeToggle clicked! Current mode:', isDarkMode ? 'dark' : 'light');
    toggleTheme();
  };

  return (
    <button
      onClick={handleToggle}
      className="relative p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 group border border-gray-200 dark:border-gray-600"
      aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <div className="relative w-6 h-6">
        {/* Sun Icon - visible in light mode */}
        <SunIcon 
          className={`absolute inset-0 w-6 h-6 transition-all duration-300 transform ${
            isDarkMode 
              ? 'opacity-0 rotate-90 scale-0 text-gray-400' 
              : 'opacity-100 rotate-0 scale-100 text-yellow-500'
          }`}
        />
        
        {/* Moon Icon - visible in dark mode */}
        <MoonIcon 
          className={`absolute inset-0 w-6 h-6 transition-all duration-300 transform ${
            isDarkMode 
              ? 'opacity-100 rotate-0 scale-100 text-blue-300' 
              : 'opacity-0 -rotate-90 scale-0 text-gray-600'
          }`}
        />
      </div>
      
      {/* Debug indicator */}
      <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-500" 
           style={{ display: isDarkMode ? 'block' : 'none' }}></div>
    </button>
  );
};

export default ThemeToggle;
