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

// Generic GET/POST wrappers that handle the safeFetch + createRequestOptions + handleResponse
// chain so each endpoint helper below stays a one-liner. Errors are logged with a contextual
// label and rethrown — same behaviour the old per-method try/catch blocks had.
const apiGet = async (path, label) => {
  try {
    const response = await safeFetch(`${API_BASE_URL}${path}`, createRequestOptions('GET'));
    return await handleResponse(response);
  } catch (error) {
    console.error(`Error ${label}:`, error);
    throw error;
  }
};

// Reshape the per-user fields from /admin/listing/stats into the {single, bulk, total, failed?, last_activity_at_ist}
// envelope each breakdown page expects. `keys` maps the generic names → backend field names.
const _mapListingCategoryStats = (data, keys) => {
  if (!data || !data.success) return data;
  const totals = data.totals || {};
  const users = (data.users || []).map(u => {
    const row = {
      user_uuid: u.user_uuid, username: u.username, email: u.email,
      single: u[keys.single] || 0,
      bulk: u[keys.bulk] || 0,
      total: u[keys.total] || 0,
      last_activity_at_ist: u[keys.lastActivity] || null,
    };
    if (keys.failed) row.failed = u[keys.failed] || 0;
    return row;
  });
  const outTotals = {
    total_single: totals[keys.totalsSingle] || 0,
    total_bulk: totals[keys.totalsBulk] || 0,
    total: totals[keys.totalsTotal] || 0,
  };
  if (keys.totalsFailed) outTotals.total_failed = totals[keys.totalsFailed] || 0;
  return { success: true, totals: outTotals, users };
};

const adminService = {
  // Check if admin is logged in
  isAdmin: () => !!localStorage.getItem('userUuid'),

  // Admin login — handles its own POST since it also writes to localStorage on success.
  login: async (email, password) => {
    try {
      const response = await safeFetch(
        `${API_BASE_URL}/auth/login`,
        createRequestOptions('POST', { email, password })
      );
      const data = await handleResponse(response);
      localStorage.setItem('userUuid', data.uuid);
      localStorage.setItem('adminEmail', email);
      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  // Get users for the admin dashboard. Without `period` (or with 'all') returns every user.
  // With period=daily/weekly/monthly the backend restricts by IST calendar boundary.
  // Route: GET /api/admin/users[?period=...] (admin_dashboard module)
  getAllUsers: (period = null) => {
    const path = period
      ? `/admin/users?period=${encodeURIComponent(period)}`
      : '/admin/users';
    return apiGet(path, 'fetching users');
  },

  // Get all referrals for admin dashboard
  // Route: GET /api/admin/referrals (admin_dashboard module)
  getAllReferrals: () => apiGet('/admin/referrals', 'fetching all referrals'),

  // Get all feedback for admin dashboard
  // Route: GET /api/admin/feedback (admin_dashboard module)
  getAllFeedback: () => apiGet('/admin/feedback', 'fetching all feedback'),

  // Single API call to GET /api/admin/listing/stats — cached so multiple components share one in-flight request
  _listingStatsPromise: null,
  getListingStats: async () => {
    if (!adminService._listingStatsPromise) {
      adminService._listingStatsPromise = (async () => {
        try {
          return await apiGet('/admin/listing/stats', 'fetching listing stats');
        } finally {
          adminService._listingStatsPromise = null;
        }
      })();
    }
    return adminService._listingStatsPromise;
  },

  getDealTagsStats: async () => _mapListingCategoryStats(await adminService.getListingStats(), {
    single: 'deal_tags_single', bulk: 'deal_tags_bulk', total: 'deal_tags_checked',
    failed: 'deal_tags_failed', lastActivity: 'last_deal_tag_at_ist',
    totalsSingle: 'total_deal_tags_single', totalsBulk: 'total_deal_tags_bulk',
    totalsTotal: 'total_deal_tags', totalsFailed: 'total_deal_tags_failed',
  }),

  getListingScoresStats: async () => _mapListingCategoryStats(await adminService.getListingStats(), {
    single: 'single_listing_scores', bulk: 'bulk_listing_scores', total: 'total_listing_scores',
    failed: 'listing_scores_failed', lastActivity: 'last_listing_score_at_ist',
    totalsSingle: 'total_single_listing_scores', totalsBulk: 'total_bulk_listing_scores',
    totalsTotal: 'total_listing_scores', totalsFailed: 'total_listing_scores_failed',
  }),

  getListingsGeneratedStats: async () => _mapListingCategoryStats(await adminService.getListingStats(), {
    single: 'listings_generated_single', bulk: 'listings_generated_bulk', total: 'listings_generated',
    lastActivity: 'last_listing_at_ist',
    totalsSingle: 'total_listings_generated_single', totalsBulk: 'total_listings_generated_bulk',
    totalsTotal: 'total_listings_generated',
  }),

  // Get a single user's full activity (generations + listing scores + deal tags)
  // Route: GET /api/admin/user/:user_uuid/activity?limit=50 (admin_dashboard module)
  getUserActivity: (userUuid, limit = 50) => {
    if (!userUuid) throw new Error('userUuid is required');
    return apiGet(
      `/admin/user/${encodeURIComponent(userUuid)}/activity?limit=${limit}`,
      'fetching user activity'
    );
  },
};

export default adminService;