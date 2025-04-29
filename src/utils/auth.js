/**
 * Utility functions for authentication
 * 
 * Note: The system uses a fixed password 'Ecombuddha@Visionary' for all authorized users
 */

// Check if a user is authenticated by verifying local storage
export const isAuthenticated = () => {
  const user = localStorage.getItem('ecombuddha_user');
  return !!user;
};

// Get the current user from local storage
export const getCurrentUser = () => {
  try {
    const user = localStorage.getItem('ecombuddha_user');
    return user ? JSON.parse(user) : null;
  } catch (error) {
    console.error('Error parsing user data:', error);
    return null;
  }
};

// List of authorized email domains
export const AUTHORIZED_DOMAINS = ['ecombuddha.in'];

// List of authorized email addresses
export const AUTHORIZED_EMAILS = [
  'naveen@ecombuddha.in',
  'karthik@ecombuddha.in',
  'sahaj@ecombuddha.in',
  'sushant@ecombuddha.in'
];

// Check if email is authorized
export const isAuthorizedEmail = (email) => {
  if (!email) return false;
  
  // Normalize email
  const normalizedEmail = email.toLowerCase().trim();
  
  // Check if email is in authorized list
  if (AUTHORIZED_EMAILS.includes(normalizedEmail)) {
    return true;
  }
  
  // Check if email domain is authorized
  const domain = normalizedEmail.split('@')[1];
  return AUTHORIZED_DOMAINS.includes(domain);
};

// Format user name from email
export const formatNameFromEmail = (email) => {
  if (!email) return '';
  
  // Get the part before @ and capitalize first letter
  const name = email.split('@')[0];
  return name.charAt(0).toUpperCase() + name.slice(1);
};