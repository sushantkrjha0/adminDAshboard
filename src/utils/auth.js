// src/utils/auth.js
import axios from 'axios';
import { getApiBaseUrl } from './apiConfig';

// User credentials with their UUIDs
const AUTHORIZED_USERS = {
  'naveen@ecombuddha.in': {
    password: 'Naveen@123',
    uuid: 'd1633d8a-00a1-7073-16e2-d2805d998a9f'
  },
  'sahaj005@gmail.com': {
    password: 'Sahaj@123',
    uuid: 'a113fd5a-1011-7063-3cf9-7ac0110aafe4'
  },
  'sushant@ecombuddha.in': {
    password: 'Sushant@123',
    uuid: '71b3fd3a-f011-70ed-07f8-d327ee3c7749'
  },
  'harshita@ecombuddha.in': {
    password: 'Harshita@123',
    uuid: '41331d0a-2001-7041-f1e8-dc538b4c4707'
  }
};

// Setup API URL
export const getApiUrl = () => {
  return getApiBaseUrl();
};

// Setup auth headers for all requests
export const setupAxiosInterceptors = () => {
  // Add request interceptor to include auth headers for all requests
  axios.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('adminToken');
      const userUuid = localStorage.getItem('userUuid');
      
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
      
      if (userUuid) {
        config.headers['X-User-UUID'] = userUuid;
      }
      
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );
  
  // Add response interceptor to handle auth errors
  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      // If 401 Unauthorized, log out the user
      if (error.response && error.response.status === 401) {
        logout();
        window.location.href = '/admin/login';
      }
      return Promise.reject(error);
    }
  );
};

// Login function
export const login = (email, password) => {
  // Check if user exists and password is correct
  const lowerEmail = email.toLowerCase();
  const userCredentials = AUTHORIZED_USERS[lowerEmail];
  
  if (!userCredentials) {
    return Promise.reject(new Error('Unauthorized email address'));
  }
  
  if (password !== userCredentials.password) {
    return Promise.reject(new Error('Invalid password'));
  }
  
  // Create admin info
  const adminInfo = {
    email: lowerEmail,
    role: 'admin',
    loginTime: new Date().toISOString()
  };
  
  // Store authentication data
  localStorage.setItem('adminToken', JSON.stringify(adminInfo));
  localStorage.setItem('adminEmail', lowerEmail);
  localStorage.setItem('userUuid', userCredentials.uuid);
  
  // Set UUID in axios default headers for all future requests
  axios.defaults.headers.common['X-User-UUID'] = userCredentials.uuid;
  
  return Promise.resolve({ 
    user: {
      email: lowerEmail,
      role: 'admin',
      uuid: userCredentials.uuid
    }
  });
};

// Logout function
export const logout = () => {
  localStorage.removeItem('adminToken');
  localStorage.removeItem('adminEmail');
  localStorage.removeItem('userUuid');
  delete axios.defaults.headers.common['Authorization'];
  delete axios.defaults.headers.common['X-User-UUID'];
};

// Check if user is authenticated
export const isAuthenticated = () => {
  const token = localStorage.getItem('adminToken');
  const userUuid = localStorage.getItem('userUuid');
  return !!token && !!userUuid;
};

// Get current user info
export const getCurrentUser = () => {
  const token = localStorage.getItem('adminToken');
  const email = localStorage.getItem('adminEmail');
  const userUuid = localStorage.getItem('userUuid');
  
  if (!token || !email || !userUuid) {
    return null;
  }
  
  try {
    // Parse the token if it's a JSON string
    const userData = typeof token === 'string' && token.startsWith('{') 
      ? JSON.parse(token) 
      : { email, role: 'admin' };
      
    return {
      ...userData,
      uuid: userUuid,
      email: email
    };
  } catch (e) {
    console.error('Error parsing user data:', e);
    return null;
  }
};

// API request helpers that include authorization headers
export const apiGet = (endpoint) => {
  const API_URL = getApiUrl();
  return axios.get(`${API_URL}/${endpoint}`);
};

export const apiPost = (endpoint, data) => {
  const API_URL = getApiUrl();
  return axios.post(`${API_URL}/${endpoint}`, data);
};

export const apiPut = (endpoint, data) => {
  const API_URL = getApiUrl();
  return axios.put(`${API_URL}/${endpoint}`, data);
};

export const apiDelete = (endpoint) => {
  const API_URL = getApiUrl();
  return axios.delete(`${API_URL}/${endpoint}`);
};