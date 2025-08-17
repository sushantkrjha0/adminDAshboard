// src/services/adminService.js using fetch instead of axios
import { getApiBaseUrl } from '../utils/apiConfig';

const API_BASE_URL = getApiBaseUrl();

// Helper function to create consistent request options with CORS support
const createRequestOptions = (method, body = null) => {
  const userUuid = localStorage.getItem('userUuid');
  
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'X-User-UUID': userUuid || ''
    },
    credentials: 'include', // Include cookies if your API uses them
    mode: 'cors' // Explicitly set CORS mode
  };
  
  if (body) {
    options.body = JSON.stringify(body);
  }
  
  return options;
};

// Helper function to handle fetch responses with better error handling
const handleResponse = async (response) => {
  // Check if response is ok before trying to parse JSON
  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Unknown error');
    let errorMessage;
    
    try {
      const errorData = JSON.parse(errorText);
      errorMessage = (errorData && errorData.message) || response.statusText;
    } catch (e) {
      // If JSON parsing fails, use the raw text
      errorMessage = errorText || response.statusText || `HTTP error ${response.status}`;
    }
    
    return Promise.reject(errorMessage);
  }
  
  // For successful responses, safely parse JSON
  try {
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error parsing JSON response:', error);
    return Promise.reject('Invalid response format from server');
  }
};

// Enhanced fetch wrapper with CORS handling
const safeFetch = async (url, options, timeout = 30000) => {
  // Create abort controller for timeout
  const controller = new AbortController();
  const signal = controller.signal;
  
  // Add signal to options
  const enhancedOptions = {
    ...options,
    signal
  };
  
  // Create timeout promise
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => {
      controller.abort();
      reject(new Error('Request timeout - server did not respond within time limit'));
    }, timeout);
  });
  
  // Try the fetch with timeout race
  try {
    const response = await Promise.race([
      fetch(url, enhancedOptions),
      timeoutPromise
    ]);
    
    return response;
  } catch (error) {
    // Handle network errors, CORS issues, etc.
    if (error.name === 'AbortError') {
      throw new Error('Request was aborted due to timeout');
    }
    
    // Handle CORS errors specifically
    if (error.message && error.message.includes('CORS')) {
      console.error('CORS error detected:', error);
      throw new Error(`CORS error: The server is not allowing cross-origin requests. Please check your server CORS configuration.`);
    }
    
    console.error('Network error:', error);
    throw new Error(`Network error: ${error.message || 'Failed to connect to server'}`);
  }
};

// Track if we have a request in progress to prevent duplicate calls
let requestsInProgress = {};

const adminService = {
  // Check if admin is logged in
  isAdmin: () => {
    return !!localStorage.getItem('userUuid');
  },

  // Admin login
  login: async (email, password) => {
    try {
      const response = await safeFetch(
        `${API_BASE_URL}/auth/login`, 
        createRequestOptions('POST', { email, password })
      );
      
      const data = await handleResponse(response);
      
      // Store UUID and email in localStorage
      localStorage.setItem('userUuid', data.uuid);
      localStorage.setItem('adminEmail', email);
      
      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  // Get all credit requests with optional status filter - with request deduplication
  getCreditRequests: async (status = null, forceRefresh = false) => {
    const requestKey = `getCreditRequests_${status || 'all'}`;
    
    // If a request with this key is already in progress and we're not forcing a refresh,
    // return a promise that will resolve when the original request completes
    if (!forceRefresh && requestsInProgress[requestKey]) {
      console.log(`Request already in progress for ${requestKey}, reusing existing promise`);
      return requestsInProgress[requestKey];
    }
    
    // Create a new promise for this request
    const requestPromise = (async () => {
      try {
        const url = `${API_BASE_URL}/auth/credit_requests${status ? `?status=${status}` : ''}`;
        console.log(`Fetching credit requests from: ${url}`);
        
        const requestOptions = createRequestOptions('GET');
        console.log('With options:', JSON.stringify(requestOptions));
        
        const response = await safeFetch(url, requestOptions);
        console.log('Response received:', response.status, response.statusText);
        
        const data = await handleResponse(response);
        console.log('Data received:', data);
        
        // Validate response structure
        if (!data || !Array.isArray(data.credit_requests)) {
          console.error('Invalid API response format:', data);
          return { credit_requests: [] }; // Return a safe default
        }
        
        // Transform/normalize data for consistency
        const normalizedRequests = data.credit_requests.map(request => ({
          user_uuid: request.user_uuid || '',
          username: request.username || 'Unknown User',
          email: request.email || '',
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
        // Return empty array instead of throwing to prevent UI crashes
        return { credit_requests: [], error: error.message };
      } finally {
        // Remove from in-progress requests when done
        delete requestsInProgress[requestKey];
      }
    })();
    
    // Store the promise so we can reuse it for duplicate calls
    requestsInProgress[requestKey] = requestPromise;
    
    return requestPromise;
  },

  // Approve a credit request
  approveCreditRequest: async (userUuid, notes = '') => {
    try {
      const response = await safeFetch(
        `${API_BASE_URL}/auth/credit_requests/${userUuid}/approve`, 
        createRequestOptions('POST', { notes })
      );
      return handleResponse(response);
    } catch (error) {
      console.error('Error approving credit request:', error);
      throw error;
    }
  },

  // Reject a credit request
  rejectCreditRequest: async (userUuid, notes = '') => {
    try {
      const response = await safeFetch(
        `${API_BASE_URL}/auth/credit_requests/${userUuid}/reject`, 
        createRequestOptions('POST', { notes })
      );
      return handleResponse(response);
    } catch (error) {
      console.error('Error rejecting credit request:', error);
      throw error;
    }
  },

  // Get admin dashboard statistics
  getStatistics: async () => {
    try {
      const response = await safeFetch(
        `${API_BASE_URL}/auth/statistics`, 
        createRequestOptions('GET')
      );
      return handleResponse(response);
    } catch (error) {
      console.error('Error fetching statistics:', error);
      throw error;
    }
  },

  // Get admin profile
  getProfile: async () => {
    try {
      const response = await safeFetch(
        `${API_BASE_URL}/auth/profile`, 
        createRequestOptions('GET')
      );
      return handleResponse(response);
    } catch (error) {
      console.error('Error fetching profile:', error);
      throw error;
    }
  },
  
  // Force refresh of credit requests - to be called manually after approve/reject
  forceRefreshCreditRequests: async (status = null) => {
    return adminService.getCreditRequests(status, true);
  },
  
  // Check server connectivity
  checkConnection: async () => {
    try {
      // Use simple fetch without JSON parsing to check connectivity
      const response = await fetch(`${API_BASE_URL}/health`, {
        method: 'GET',
        mode: 'cors',
        credentials: 'include'
      });
      return response.ok;
    } catch (error) {
      console.error('Server connection check failed:', error);
      return false;
    }
  },
  
  // Get API base URL (useful for debugging)
  getApiBaseUrl: () => {
    return API_BASE_URL;
  }
};

export default adminService;