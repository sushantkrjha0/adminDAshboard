// src/pages/AdminDashboard.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import './AdminDashboard.css';
import AdminCreditRequests from '../components/Admin/AdminCreditRequests';
import { FaChartBar, FaUsersCog, FaSignOutAlt, FaCoins } from 'react-icons/fa';

const AdminDashboard = () => {
  const { currentUser, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('creditRequests');
  
  // Check if user is authorized to access admin dashboard
  useEffect(() => {
    if (!currentUser || !isAdmin) {
      navigate('/dashboard');
    }
  }, [currentUser, isAdmin, navigate]);
  
  // Get current time to display greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  // Handle logout
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!currentUser || !isAdmin) {
    return null; // Don't render anything if not admin (will redirect)
  }

  return (
    <div className="admin-dashboard">
      {/* Header with logout */}
      <div className="admin-header">
        <div className="admin-logo-section">
          <h1 className="admin-logo">EcomBuddha</h1>
          <span className="admin-badge">Admin Panel</span>
        </div>
        
        <div className="admin-user">
          <span className="admin-username">{currentUser?.email}</span>
          <button onClick={handleLogout} className="admin-logout-button">
            <FaSignOutAlt /> Logout
          </button>
        </div>
      </div>
      
      <div className="admin-layout">
        {/* Sidebar Navigation */}
        <div className="admin-sidebar">
          <div className="admin-welcome">
            <h3>{getGreeting()},</h3>
            <p>{currentUser?.name || 'Admin'}</p>
          </div>
          
          <ul className="admin-nav">
            <li 
              className={activeTab === 'dashboard' ? 'active' : ''} 
              onClick={() => setActiveTab('dashboard')}
            >
              <FaChartBar /> 
              <span>Dashboard</span>
            </li>
            
            <li 
              className={activeTab === 'creditRequests' ? 'active' : ''} 
              onClick={() => setActiveTab('creditRequests')}
            >
              <FaCoins /> 
              <span>Credit Requests</span>
            </li>
            
            <li 
              className={activeTab === 'userManagement' ? 'active' : ''} 
              onClick={() => setActiveTab('userManagement')}
            >
              <FaUsersCog /> 
              <span>User Management</span>
            </li>
          </ul>
        </div>
        
        <div className="admin-content">
          {activeTab === 'dashboard' && (
            <div className="admin-dashboard-summary">
              <h1>Admin Dashboard</h1>
              <div className="admin-stats">
                <div className="admin-stat-card">
                  <h3>Pending Requests</h3>
                  <p className="admin-stat-value">5</p>
                  <p className="admin-stat-description">Credit requests awaiting approval</p>
                </div>
                
                <div className="admin-stat-card">
                  <h3>Users</h3>
                  <p className="admin-stat-value">12</p>
                  <p className="admin-stat-description">Active users in the system</p>
                </div>
                
                <div className="admin-stat-card">
                  <h3>Credits Issued</h3>
                  <p className="admin-stat-value">250</p>
                  <p className="admin-stat-description">Total credits approved this month</p>
                </div>
                
                <div className="admin-stat-card">
                  <h3>System Status</h3>
                  <p className="admin-stat-value">Online</p>
                  <p className="admin-stat-description">All systems operational</p>
                </div>
              </div>
              
              <div className="admin-recent-activity">
                <h2>Recent Admin Activity</h2>
                <div className="admin-activity-list">
                  <div className="admin-activity-item">
                    <div className="admin-activity-time">Today, 10:45 AM</div>
                    <div className="admin-activity-details">
                      <h4>Credit Request Approved</h4>
                      <p>User: karthik@ecombuddha.in - 25 credits</p>
                    </div>
                  </div>
                  
                  <div className="admin-activity-item">
                    <div className="admin-activity-time">Today, 09:30 AM</div>
                    <div className="admin-activity-details">
                      <h4>New User Login</h4>
                      <p>User: naveen@ecombuddha.in logged in</p>
                    </div>
                  </div>
                  
                  <div className="admin-activity-item">
                    <div className="admin-activity-time">Yesterday</div>
                    <div className="admin-activity-details">
                      <h4>Credit Request Rejected</h4>
                      <p>User: external@example.com - Reason: Unauthorized email</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'creditRequests' && (
            <AdminCreditRequests />
          )}
          
          {activeTab === 'userManagement' && (
            <div className="admin-placeholder">
              <h1>User Management</h1>
              <p>This feature is coming soon.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;