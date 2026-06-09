// src/utils/auth.js
import axios from 'axios';
import { getApiBaseUrl } from './apiConfig';

// Setup API URL
export const getApiUrl = () => {
  return getApiBaseUrl();
};

// Setup auth headers for all requests
export const setupAxiosInterceptors = () => {
  axios.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('adminToken');
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response && error.response.status === 401) {
        logout();
        window.location.href = '/admin/login';
      }
      return Promise.reject(error);
    }
  );
};

// Login: backend verifies password, returns signed JWT
export const login = async (email, password) => {
  const API_URL = getApiUrl();
  const lowerEmail = email.toLowerCase();

  try {
    const response = await axios.post(`${API_URL}/admin/login`, {
      email: lowerEmail,
      password: password,
    });

    const { token, user } = response.data;
    localStorage.setItem('adminToken', token);
    localStorage.setItem('adminEmail', user.email);
    localStorage.setItem('userUuid', user.uuid);

    return { user };
  } catch (err) {
    const msg = err.response?.data?.error || 'Login failed';
    throw new Error(msg);
  }
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

// Get current user info from localStorage
export const getCurrentUser = () => {
  const token = localStorage.getItem('adminToken');
  const email = localStorage.getItem('adminEmail');
  const userUuid = localStorage.getItem('userUuid');

  if (!token || !email || !userUuid) {
    return null;
  }

  return {
    email,
    uuid: userUuid,
    role: 'admin',
  };
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