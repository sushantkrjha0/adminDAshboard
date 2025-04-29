import React, { createContext, useState, useEffect, useContext } from 'react';

// Create context
const AuthContext = createContext();

// List of authorized emails
const AUTHORIZED_EMAILS = [
  'naveen@ecombuddha.in',
  'karthik@ecombuddha.in',
  'sahaj@ecombuddha.in',
  'sushant@ecombuddha.in',
  'harshita@ecombuddha.in'
];

// Provider component
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is stored in local storage
    const storedUser = localStorage.getItem('ecombuddha_user');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  // Login function
  const login = (email, password) => {
    return new Promise((resolve, reject) => {
      // Check if email is authorized
      if (!AUTHORIZED_EMAILS.includes(email.toLowerCase())) {
        reject(new Error('Email not authorized'));
        return;
      }
      
      // Check for the specific fixed password
      if (password !== 'Ecombuddha@Visionary') {
        reject(new Error('Invalid password'));
        return;
      }

      // Create user object
      const user = {
        email,
        name: email.split('@')[0],
        role: email.includes('sushant') ? 'admin' : 'user',
        lastLogin: new Date().toISOString()
      };

      // Store user in local storage
      localStorage.setItem('ecombuddha_user', JSON.stringify(user));
      
      // Update state
      setCurrentUser(user);
      resolve(user);
    });
  };

  // Logout function
  const logout = () => {
    // Remove user from local storage
    localStorage.removeItem('ecombuddha_user');
    
    // Clear the currentUser state
    setCurrentUser(null);
    
    console.log("Logged out successfully");
  };

  const value = {
    currentUser,
    login,
    logout,
    isAdmin: currentUser?.role === 'admin'
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  return useContext(AuthContext);
};

export default AuthContext;