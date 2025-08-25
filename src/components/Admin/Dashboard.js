import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCoins, FaUsers, FaChartBar, FaClock, FaCheckCircle, FaTimesCircle, FaCommentDots, FaShareAlt } from 'react-icons/fa';
import styles from './Dashboard.module.css';
import adminService from '../../services/adminService';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    pendingRequests: 0,
    approvedRequests: 0,
    rejectedRequests: 0,
    totalRequests: 0,
    totalFeedback: 0,
    totalReferrals: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setIsLoading(true);
      
      // Fetch credit requests to get stats
      const [creditResponse, feedbackResponse, referralsResponse] = await Promise.all([
        adminService.getCreditRequests('all'),
        adminService.getAllFeedback(),
        adminService.getAllReferrals()
      ]);
      
      const allRequests = creditResponse.credit_requests || [];
      const allFeedback = feedbackResponse.feedback || [];
      const allReferrals = referralsResponse.referrals || [];
      
      setStats({
        totalUsers: allRequests.length > 0 ? new Set(allRequests.map(req => req.user_uuid)).size : 0,
        pendingRequests: allRequests.filter(req => req.status === 'pending').length,
        approvedRequests: allRequests.filter(req => req.status === 'approved').length,
        rejectedRequests: allRequests.filter(req => req.status === 'rejected').length,
        totalRequests: allRequests.length,
        totalFeedback: allFeedback.length,
        totalReferrals: allReferrals.length
      });
    } catch (err) {
      console.error("Error fetching dashboard stats:", err);
      setError("Failed to load dashboard statistics");
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = (action) => {
    switch (action) {
      case 'credit-requests':
        navigate('/admin/credit-requests');
        break;
      case 'users':
        navigate('/admin/users');
        break;
      case 'feedback':
        navigate('/admin/feedback');
        break;
      case 'referrals':
        navigate('/admin/referrals');
        break;
      case 'settings':
        navigate('/admin/settings');
        break;
      default:
        break;
    }
  };

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <p>{error}</p>
        <button onClick={fetchDashboardStats} className={styles.retryButton}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Welcome Header */}
      <div className={styles.welcomeHeader}>
        <h1>Welcome to Admin Dashboard</h1>
        
      </div>

      {/* Statistics Cards */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <FaUsers />
          </div>
          <div className={styles.statContent}>
            <h3>{stats.totalUsers}</h3>
            <p>Total Users</p>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <FaCoins />
          </div>
          <div className={styles.statContent}>
            <h3>{stats.totalRequests}</h3>
            <p>Total Credit Requests</p>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <FaCommentDots />
          </div>
          <div className={styles.statContent}>
            <h3>{stats.totalFeedback}</h3>
            <p>Total Feedback</p>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <FaShareAlt />
          </div>
          <div className={styles.statContent}>
            <h3>{stats.totalReferrals}</h3>
            <p>Total Referrals</p>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <FaClock />
          </div>
          <div className={styles.statContent}>
            <h3>{stats.pendingRequests}</h3>
            <p>Pending Requests</p>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <FaCheckCircle />
          </div>
          <div className={styles.statContent}>
            <h3>{stats.approvedRequests}</h3>
            <p>Approved Requests</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className={styles.quickActions}>
        <h2>Quick Actions</h2>
        <div className={styles.actionGrid}>
          <div 
            className={styles.actionCard}
            onClick={() => handleQuickAction('credit-requests')}
          >
            <div className={styles.actionIcon}>
              <FaCoins />
            </div>
            <h3>Credit Requests</h3>
            <p>Manage user credit requests and approvals</p>
            <div className={styles.actionBadge}>
              {stats.pendingRequests} pending
            </div>
          </div>

          <div 
            className={styles.actionCard}
            onClick={() => handleQuickAction('feedback')}
          >
            <div className={styles.actionIcon}>
              <FaCommentDots />
            </div>
            <h3>User Feedback</h3>
            <p>View and manage user feedback</p>
            <div className={styles.actionBadge}>
              {stats.totalFeedback} total
            </div>
          </div>

          <div 
            className={styles.actionCard}
            onClick={() => handleQuickAction('referrals')}
          >
            <div className={styles.actionIcon}>
              <FaShareAlt />
            </div>
            <h3>User Referrals</h3>
            <p>View and manage user referrals</p>
            <div className={styles.actionBadge}>
              {stats.totalReferrals} total
            </div>
          </div>

          <div 
            className={styles.actionCard}
            onClick={() => handleQuickAction('users')}
          >
            <div className={styles.actionIcon}>
              <FaUsers />
            </div>
            <h3>User Management</h3>
            <p>View and manage user accounts</p>
            <div className={styles.actionBadge}>
              Coming Soon
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className={styles.recentActivity}>
        <h2>Recent Activity</h2>
        <div className={styles.activityList}>
          {stats.pendingRequests > 0 ? (
            <div className={styles.activityItem}>
              <div className={styles.activityIcon}>
                <FaClock />
              </div>
              <div className={styles.activityContent}>
                <p><strong>{stats.pendingRequests} credit requests</strong> are pending approval</p>
                <span className={styles.activityTime}>Action required</span>
              </div>
              <button 
                onClick={() => handleQuickAction('credit-requests')}
                className={styles.viewButton}
              >
                View
              </button>
            </div>
          ) : (
            <div className={styles.activityItem}>
              <div className={styles.activityIcon}>
                <FaCheckCircle />
              </div>
              <div className={styles.activityContent}>
                <p>All credit requests have been processed</p>
                <span className={styles.activityTime}>Up to date</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 