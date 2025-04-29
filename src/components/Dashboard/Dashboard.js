import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

const Dashboard = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  
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

  return (
    <div className="dashboard-container">
      {/* Header with logout */}
      <div className="dashboard-header">
        <h1 className="dashboard-logo">EcomBuddha</h1>
        <div className="dashboard-user">
          <span className="dashboard-username">{currentUser?.email}</span>
          <button onClick={handleLogout} className="logout-button">Logout</button>
        </div>
      </div>
      
      <div className="dashboard-content">
        <main className="main-content">
          <div className="welcome-section">
            <h1>{getGreeting()}, {currentUser?.name || 'User'}!</h1>
            <p>Welcome to the EcomBuddha Dashboard</p>
          </div>
          
          <div className="stats-container">
            <div className="stat-card">
              <h3>Orders</h3>
              <p className="stat-value">125</p>
              <p className="stat-description">15% increase from last week</p>
            </div>
            
            <div className="stat-card">
              <h3>Revenue</h3>
              <p className="stat-value">$12,456</p>
              <p className="stat-description">8% increase from last week</p>
            </div>
            
            <div className="stat-card">
              <h3>Customers</h3>
              <p className="stat-value">357</p>
              <p className="stat-description">12 new customers this week</p>
            </div>
            
            <div className="stat-card">
              <h3>Products</h3>
              <p className="stat-value">42</p>
              <p className="stat-description">5 new products added</p>
            </div>
          </div>
          
          <div className="recent-activity">
            <h2>Recent Activity</h2>
            <div className="activity-list">
              <div className="activity-item">
                <div className="activity-time">10:45 AM</div>
                <div className="activity-details">
                  <h4>New order placed</h4>
                  <p>Order #1234 was placed for $123.45</p>
                </div>
              </div>
              
              <div className="activity-item">
                <div className="activity-time">09:30 AM</div>
                <div className="activity-details">
                  <h4>Inventory updated</h4>
                  <p>5 items were restocked</p>
                </div>
              </div>
              
              <div className="activity-item">
                <div className="activity-time">Yesterday</div>
                <div className="activity-details">
                  <h4>Customer feedback</h4>
                  <p>Received a 5-star review from customer ID #456</p>
                </div>
              </div>
              
              <div className="activity-item">
                <div className="activity-time">Yesterday</div>
                <div className="activity-details">
                  <h4>System update</h4>
                  <p>The system was updated to version 2.3.0</p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;