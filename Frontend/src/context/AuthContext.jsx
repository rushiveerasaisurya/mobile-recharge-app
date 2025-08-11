import React, { createContext, useContext, useState, useEffect } from 'react';
import apiService from '../services/api'; // Import your API service

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedUser = localStorage.getItem('user');
        
        if (storedUser && storedUser !== 'undefined') {
          try {
            const parsedUser = JSON.parse(storedUser);
            if (parsedUser && parsedUser.id && parsedUser.role) {
              setUser(parsedUser);
            } else {
              logout(); // Clear invalid data
            }
          } catch (e) {
            console.error('Error parsing user from localStorage:', e.message);
            logout(); // Clear invalid data
          }
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
        logout();
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const register = async (name, mobileNumber, email, password) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const { success, data, error } = await apiService.register(
        name,
        mobileNumber,
        email,
        password
      );

      if (success) {
        localStorage.setItem('user', JSON.stringify(data)); // Fixed: Use data directly
        setUser(data);
        return true;
      } else {
        setError(error);
        return false;
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError('Registration failed. Please try again.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (mobileNumber, password) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const { success, data, error } = await apiService.login(mobileNumber, password);
      
      if (success) {
        localStorage.setItem('user', JSON.stringify(data));
        setUser(data);
        return data;
      } else {
        setError(error || "Invalid response from server");
        return null;
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Login failed. Please try again.');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const getEmail = async (mobileNumber) => {
  try {
    setIsLoading(true);
    setError(null);

    const response = await apiService.getEmail({ mobileNumber }); // Pass as object
    if (response.success) {
      return response; // Return the full response
    } else {
      setError(response.message);
      return null;
    }
  } catch (err) {
    console.error('Get email error:', err);
    setError('Failed to fetch email. Please try again.');
    return null;
  } finally {
    setIsLoading(false);
  }
};
  const resetPassword = async (email, newPassword) => {
    try {
      setIsLoading(true);
      setError(null);

      const { success, message, error } = await apiService.resetPassword(email, newPassword);
      if (success) {
        return message; // Returns the success message
      } else {
        setError(error);
        return null;
      }
    } catch (err) {
      console.error('Reset password error:', err);
      setError('Failed to reset password. Please try again.');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    apiService.logout(); // Use apiService.logout for consistency
    setUser(null);
    setError(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        error,
        login,
        register,
        getEmail,
        resetPassword,
        logout,
        setError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};