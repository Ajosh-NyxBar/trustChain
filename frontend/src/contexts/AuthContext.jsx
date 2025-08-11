import React, { createContext, useContext, useState, useEffect } from 'react';
import apiService from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is authenticated on component mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      apiService.setToken(token);
      const userData = await apiService.getCurrentUser();
      setUser(userData);
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('token');
      apiService.setToken(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      setError(null);
      setLoading(true);

      const response = await apiService.login(credentials);
      setUser(response.user);
      
      // Set up token refresh timer
      setupTokenRefresh();
      
      return response;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setError(null);
      setLoading(true);

      const response = await apiService.register(userData);
      return response;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await apiService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      localStorage.removeItem('token');
      apiService.setToken(null);
      clearTokenRefresh();
    }
  };

  const updateProfile = async (profileData) => {
    try {
      setError(null);
      const updatedUser = await apiService.updateProfile(profileData);
      setUser(updatedUser);
      return updatedUser;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  // Token refresh management
  let refreshTimer = null;

  const setupTokenRefresh = () => {
    // Clear existing timer
    clearTokenRefresh();

    // Set up refresh timer (refresh 5 minutes before expiry)
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const expiresIn = payload.exp * 1000 - Date.now() - 5 * 60 * 1000; // 5 minutes before expiry

        if (expiresIn > 0) {
          refreshTimer = setTimeout(async () => {
            try {
              await apiService.refreshToken();
              setupTokenRefresh(); // Set up next refresh
            } catch (error) {
              console.error('Token refresh failed:', error);
              logout();
            }
          }, expiresIn);
        }
      } catch (error) {
        console.error('Token parsing failed:', error);
      }
    }
  };

  const clearTokenRefresh = () => {
    if (refreshTimer) {
      clearTimeout(refreshTimer);
      refreshTimer = null;
    }
  };

  // Clean up timer on unmount
  useEffect(() => {
    return () => clearTokenRefresh();
  }, []);

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    updateProfile,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isSupplier: user?.role === 'supplier',
    isConsumer: user?.role === 'consumer',
    clearError: () => setError(null)
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
