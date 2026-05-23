import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUsers, FaCommentDots, FaShareAlt } from 'react-icons/fa';
import styles from './Dashboard.module.css';
import adminService from '../../services/adminService';

const Dashboard = () => {
  const [stats, setStats] = useState({
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

      const [feedbackResponse, referralsResponse] = await Promise.all([
        adminService.getAllFeedback(),
        adminService.getAllReferrals()
      ]);

      const allFeedback = feedbackResponse.feedback || [];
      const allReferrals = referralsResponse.referrals || [];

      setStats({
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
      </div>

      {/* Quick Actions */}
      <div className={styles.quickActions}>
        <h2>Quick Actions</h2>
        <div className={styles.actionGrid}>
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
    </div>
  );
};

export default Dashboard; 