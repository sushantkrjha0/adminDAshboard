// src/services/adminService.js using fetch instead of axios
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Helper function to create consistent request options
const createRequestOptions = (method, body = null) => {
  const userUuid = localStorage.getItem('userUuid');
  
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'X-User-UUID': userUuid || ''
    },
    credentials: 'include' // Include cookies if your API uses them
  };
  
  if (body) {
    options.body = JSON.stringify(body);
  }
  
  return options;
};

// Helper function to handle fetch responses
const handleResponse = async (response) => {
  const data = await response.json();
  
  // Check for error response
  if (!response.ok) {
    const error = (data && data.message) || response.statusText;
    return Promise.reject(error);
  }
  
  return data;
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
      const response = await fetch(`${API_BASE_URL}/auth/login`, 
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
    
    console.log("HY 22!!")
    // Create a new promise for this request
    const requestPromise = (async () => {
      try {
        const url = `${API_BASE_URL}/auth/credit_requests${status ? `?status=${status}` : ''}`;
        const response = await fetch(url, createRequestOptions('GET'));
        console.log("HY 33!!")
        const data = await handleResponse(response);
        
        console.log("HY 33!!")
        console.log(data)
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
        console.log("HY 33!!")
        console.log(error)
        console.error('Error fetching credit requests:', error);
        throw error;
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
      const response = await fetch(
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
      const response = await fetch(
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
      const response = await fetch(
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
      const response = await fetch(
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
  }
};

export default adminService;