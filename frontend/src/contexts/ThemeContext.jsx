import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Check if we're in browser environment
    if (typeof window === 'undefined') return false;
    
    // Check if user has a saved preference
    const savedTheme = localStorage.getItem('trustchain-theme');
    if (savedTheme) {
      return savedTheme === 'dark';
    }
    // Default to light mode for better initial experience
    return false;
  });

  useEffect(() => {
    // Update localStorage when theme changes
    localStorage.setItem('trustchain-theme', isDarkMode ? 'dark' : 'light');
    
    // Update document class for Tailwind dark mode
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    
    // Debug log
    console.log('Theme changed to:', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  const toggleTheme = () => {
    console.log('Toggling theme from', isDarkMode ? 'dark' : 'light', 'to', isDarkMode ? 'light' : 'dark');
    setIsDarkMode(prev => !prev);
  };

  const value = {
    isDarkMode,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};
