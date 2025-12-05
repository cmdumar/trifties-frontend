import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

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
  const [token, setToken] = useState(localStorage.getItem('authToken'));

  useEffect(() => {
    // Check if user is logged in on mount
    const storedToken = localStorage.getItem('authToken');
    const storedUser = localStorage.getItem('user');
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await authAPI.signIn(email, password);
      console.log('Login response:', response.data);
      
      // Token is now in the response body
      const authToken = response.data.token;
      const userData = response.data.user;
      
      if (authToken && userData) {
        localStorage.setItem('authToken', authToken);
        localStorage.setItem('user', JSON.stringify(userData));
        setToken(authToken);
        setUser(userData);
        return { success: true, user: userData };
      }
      throw new Error('No token or user data received');
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          error.message || 
                          'Login failed';
      return { 
        success: false, 
        error: errorMessage
      };
    }
  };

  const signup = async (email, password, passwordConfirmation) => {
    try {
      const response = await authAPI.signUp(email, password, passwordConfirmation);
      console.log('Signup response:', response.data);
      
      // Token is now in the response body
      const authToken = response.data.token;
      const userData = response.data.user;
      
      if (authToken && userData) {
        localStorage.setItem('authToken', authToken);
        localStorage.setItem('user', JSON.stringify(userData));
        setToken(authToken);
        setUser(userData);
        return { success: true, user: userData };
      }
      throw new Error('No token or user data received');
    } catch (error) {
      console.error('Signup error:', error);
      const errorMsg = error.response?.data?.message || 
                      (error.response?.data?.errors ? 
                        (Array.isArray(error.response.data.errors) ? 
                          error.response.data.errors.join(', ') : 
                          JSON.stringify(error.response.data.errors)) : 
                        null) ||
                      error.message ||
                      'Signup failed';
      return { 
        success: false, 
        error: errorMsg
      };
    }
  };

  const logout = async () => {
    try {
      await authAPI.signOut();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      setToken(null);
      setUser(null);
    }
  };

  // Check if user is admin from backend
  const isAdmin = () => {
    if (!user) return false;
    // Check both boolean true and string "true"
    return user.admin === true || user.admin === "true";
  };

  const value = {
    user,
    token,
    loading,
    login,
    signup,
    logout,
    isAdmin: isAdmin(),
    isAuthenticated: !!user && !!token,
  };

  // Debug: log user and admin status
  useEffect(() => {
    if (user) {
      console.log('Current user:', user);
      console.log('Is admin:', isAdmin());
    }
  }, [user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

