// src/context/AuthContext.js
import React, { createContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

// Create the Auth Context
const AuthContext = createContext({
  isAuthenticated: false,
  user: null,
  token: null,
  userUuid: null,
  isAdmin: false,
  isLoading: true,
  login: () => {},
  logout: () => {},
  refreshUserData: () => {},
  updateUserCredits: () => {}
});

// Create a provider component
export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [userUuid, setUserUuid] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Function to get API URL
  const getApiUrl = () => {
    return process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
  };

  // Configure axios with the auth token and user UUID
  const configureAxios = useCallback((authToken, uuid) => {
    // Parse the token if it's a JSON string
    let parsedToken = authToken;
    let parsedUuid = uuid;

    // If the token is a JSON string (our custom token format)
    if (typeof authToken === 'string' && authToken.startsWith('{')) {
      try {
        const tokenData = JSON.parse(authToken);
        parsedUuid = tokenData.user_uuid || uuid;
      } catch (e) {
        console.error('Error parsing token:', e);
      }
    }

    // Set default headers for all axios requests
    axios.defaults.headers.common['Authorization'] = `Bearer ${parsedToken}`;
    if (parsedUuid) {
      axios.defaults.headers.common['X-User-UUID'] = parsedUuid;
    }
    
    return { parsedToken, parsedUuid };
  }, []);

  // Function to refresh user data
  const refreshUserData = useCallback(async () => {
    if (!token) return;

    try {
      const API_URL = getApiUrl();
      const response = await axios.get(`${API_URL}/auth/user`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-User-UUID': userUuid,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 200) {
        setUser(response.data.user);
        // Check if user has admin role
        setIsAdmin(response.data.user?.role === 'admin');
      }
    } catch (error) {
      console.error('Error refreshing user data:', error);
      // If unauthorized, logout
      if (error.response && error.response.status === 401) {
        logout();
      }
    }
  }, [token, userUuid]);

  // Function to update user credits
  const updateUserCredits = useCallback((newCreditAmount) => {
    if (user) {
      setUser(prevUser => ({
        ...prevUser,
        credits: newCreditAmount
      }));
    }
  }, [user]);

  // Login function
  const login = useCallback(async (loginToken) => {
    try {
      // Attempt to parse the token if it's a JSON string
      let uuid = null;
      let role = null;
      
      if (typeof loginToken === 'string' && loginToken.startsWith('{')) {
        try {
          const tokenData = JSON.parse(loginToken);
          uuid = tokenData.user_uuid;
          role = tokenData.role;
        } catch (e) {
          console.error('Error parsing token:', e);
        }
      }
      
      setToken(loginToken);
      setUserUuid(uuid);
      setIsAuthenticated(true);
      localStorage.setItem('auth_token', loginToken);
      
      // Configure axios with the new token and UUID
      configureAxios(loginToken, uuid);
      
      // If we have role information from the token
      if (role === 'admin') {
        setIsAdmin(true);
      }
      
      // After setting token, refresh user data
      const API_URL = getApiUrl();
      const response = await axios.get(`${API_URL}/auth/user`, {
        headers: {
          'Authorization': `Bearer ${loginToken}`,
          'X-User-UUID': uuid,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 200) {
        setUser(response.data.user);
        // Check if user has admin role from API response
        setIsAdmin(response.data.user?.role === 'admin');
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      logout();
    }
  }, [configureAxios]);

  // Logout function
  const logout = useCallback(() => {
    setToken(null);
    setUserUuid(null);
    setUser(null);
    setIsAuthenticated(false);
    setIsAdmin(false);
    localStorage.removeItem('auth_token');
    
    // Remove auth headers
    delete axios.defaults.headers.common['Authorization'];
    delete axios.defaults.headers.common['X-User-UUID'];
  }, []);

  // Check for token in localStorage on initial load
  useEffect(() => {
    const checkAuthStatus = async () => {
      setIsLoading(true);
      const storedToken = localStorage.getItem('auth_token');
      
      if (storedToken) {
        try {
          // Extract UUID from token if it's our custom format
          let uuid = null;
          
          if (storedToken.startsWith('{')) {
            try {
              const tokenData = JSON.parse(storedToken);
              uuid = tokenData.user_uuid;
              
              // Set admin status from token if available
              if (tokenData.role === 'admin') {
                setIsAdmin(true);
              }
            } catch (e) {
              console.error('Error parsing stored token:', e);
            }
          }
          
          setToken(storedToken);
          setUserUuid(uuid);
          setIsAuthenticated(true);
          
          // Configure axios with the stored token and UUID
          configureAxios(storedToken, uuid);
          
          // Verify token and get user data
          const API_URL = getApiUrl();
          const response = await axios.get(`${API_URL}/auth/user`, {
            headers: {
              'Authorization': `Bearer ${storedToken}`,
              'X-User-UUID': uuid,
              'Content-Type': 'application/json'
            }
          });

          if (response.status === 200) {
            setUser(response.data.user);
            // Check if user has admin role from API
            setIsAdmin(response.data.user?.role === 'admin');
          }
        } catch (error) {
          console.error('Error validating token:', error);
          logout();
        }
      }
      
      setIsLoading(false);
    };

    checkAuthStatus();
  }, [logout, configureAxios]);

  // Context value
  const contextValue = {
    isAuthenticated,
    user,
    token,
    userUuid,
    isAdmin,
    isLoading,
    login,
    logout,
    refreshUserData,
    updateUserCredits
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;