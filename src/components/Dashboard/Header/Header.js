import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './Header.css';

const Header = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  
  const handleLogout = () => {
    // Call the logout function from AuthContext
    logout();
    // Navigate to login page
    navigate('/login');
  };
  
  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  return (
    <header className="header">
      <div className="search-bar">
        <input 
          type="text" 
          placeholder="Search..." 
          className="search-input"
        />
      </div>
      
      <div className="header-actions">
        {/* Add a direct logout button for easier access */}
        <button onClick={handleLogout} className="logout-button">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            <polyline points="16 17 21 12 16 7"></polyline>
            <line x1="21" y1="12" x2="9" y2="12"></line>
          </svg>
          <span>Logout</span>
        </button>
        
        <div className="notifications">
          <button className="notification-button">
            <span className="notification-count">3</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
            </svg>
          </button>
        </div>
        
        <div className="user-profile">
          <button className="profile-button" onClick={toggleDropdown}>
            <div className="avatar">
              {currentUser?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <span className="user-name">{currentUser?.name || 'User'}</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </button>
          
          {showDropdown && (
            <div className="dropdown-menu">
              <div className="dropdown-header">
                <div className="dropdown-avatar">{currentUser?.name?.charAt(0).toUpperCase() || 'U'}</div>
                <div className="dropdown-user-info">
                  <p className="dropdown-user-name">{currentUser?.name || 'User'}</p>
                  <p className="dropdown-user-email">{currentUser?.email || 'user@ecombuddha.in'}</p>
                </div>
              </div>
              <div className="dropdown-items">
                <button className="dropdown-item">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                  Profile
                </button>
                <button className="dropdown-item">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 12H5m7 7l-7-7 7-7" />
                  </svg>
                  Settings
                </button>
                <button className="dropdown-item" onClick={handleLogout}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                    <polyline points="16 17 21 12 16 7"></polyline>
                    <line x1="21" y1="12" x2="9" y2="12"></line>
                  </svg>
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;