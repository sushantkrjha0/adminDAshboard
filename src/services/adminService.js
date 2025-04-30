// src/services/adminService.js
import axios from 'axios';

// Configure axios with base URL from environment variables
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add user UUID header to all requests
apiClient.interceptors.request.use(
  (config) => {
    const userUuid = localStorage.getItem('userUuid');
    if (userUuid) {
      config.headers['X-User-UUID'] = userUuid;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

const adminService = {
  // Check if admin is logged in
  isAdmin: () => {
    return !!localStorage.getItem('userUuid');
  },

  // Admin login
  login: async (email, password) => {
    try {
      const response = await apiClient.post('/auth/login', { email, password });
      
      // Store UUID and email in localStorage
      localStorage.setItem('userUuid', response.data.uuid);
      localStorage.setItem('adminEmail', email);
      
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get all credit requests with optional status filter
  getCreditRequests: async (status = null) => {
    try {
      const url = status ? `/auth/credit_requests?status=${status}` : '/auth/credit_requests';
      const response = await apiClient.get(url);
      
      // Validate response structure
      if (!response.data || !Array.isArray(response.data.credit_requests)) {
        console.error('Invalid API response format:', response.data);
        return { credit_requests: [] }; // Return a safe default
      }
      
      // Transform/normalize data if needed
      const normalizedRequests = response.data.credit_requests.map(request => ({
        user_uuid: request.user_uuid || '',
        username: request.username || 'Unknown User',
        current_credit: typeof request.current_credit === 'number' ? request.current_credit : 0,
        requested_credit: typeof request.requested_credit === 'number' ? request.requested_credit : 0,
        status: request.status || 'unknown',
        requested_at: request.requested_at || null,
        processed_at: request.processed_at || null,
        processed_by: request.processed_by || null,
        notes: request.notes || null,
      }));
      
      return { credit_requests: normalizedRequests };
    } catch (error) {
      console.error('Error fetching credit requests:', error);
      throw error;
    }
  },

  // Approve a credit request
  approveCreditRequest: async (requestId, notes = '') => {
    try {
      const response = await apiClient.post(`/auth/credit_requests/${requestId}/approve`, { notes });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Reject a credit request
  rejectCreditRequest: async (requestId, notes = '') => {
    try {
      const response = await apiClient.post(`/auth/credit_requests/${requestId}/reject`, { notes });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get admin dashboard statistics
  getStatistics: async () => {
    try {
      const response = await apiClient.get('/auth/statistics');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get admin profile
  getProfile: async () => {
    try {
      const response = await apiClient.get('/auth/profile');
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default adminService;