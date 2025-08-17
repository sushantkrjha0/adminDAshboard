// src/utils/apiConfig.js
// Centralized API configuration that automatically detects environment

/**
 * Automatically detects the current environment and returns the appropriate API URL
 * @returns {string} The API base URL
 */
export const getApiBaseUrl = () => {
  // Check if we're in production (deployed to a domain)
  if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    // Production environment - use production API
    return 'https://api.ecombuddha.ai/api';
  }
  
  // Local development - use localhost
  return 'http://localhost:5000/api';
};

/**
 * Gets the full API URL for a specific endpoint
 * @param {string} endpoint - The API endpoint (e.g., 'auth/credit_requests')
 * @returns {string} The full API URL
 */
export const getApiUrl = (endpoint = '') => {
  const baseUrl = getApiBaseUrl();
  return endpoint ? `${baseUrl}/${endpoint}` : baseUrl;
};

/**
 * Logs the current API configuration for debugging
 */
export const logApiConfig = () => {
  const baseUrl = getApiBaseUrl();
  const hostname = window.location.hostname;
  const isProduction = hostname !== 'localhost' && hostname !== '127.0.0.1';
  
  console.log('🌐 API Configuration:', {
    hostname,
    environment: isProduction ? 'Production' : 'Development',
    apiBaseUrl: baseUrl,
    timestamp: new Date().toISOString()
  });
};

// Log configuration on import (for debugging)
if (process.env.NODE_ENV === 'development') {
  logApiConfig();
} 