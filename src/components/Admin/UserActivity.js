import React, { useState, useEffect } from 'react';
import { FaChartLine, FaSpinner, FaCalendar, FaClock } from 'react-icons/fa';
import styles from './UserActivity.module.css';
import adminService from '../../services/adminService';

const UserActivity = () => {
  const [activeUsers, setActiveUsers] = useState([]);
  const [isLoadingActiveUsers, setIsLoadingActiveUsers] = useState(false);
  const [activeUsersPeriod, setActiveUsersPeriod] = useState('daily'); // daily, weekly, monthly
  const [activeUsersStats, setActiveUsersStats] = useState({
    daily: 0,
    weekly: 0,
    monthly: 0
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchActiveUsers();
    fetchAllStats();
  }, []);

  useEffect(() => {
    fetchActiveUsers();
  }, [activeUsersPeriod]);

  const fetchActiveUsers = async (period = null) => {
    try {
      setIsLoadingActiveUsers(true);
      setError(null);
      const targetPeriod = period || activeUsersPeriod;
      const response = await adminService.getActiveUsers(targetPeriod);
      if (response.success) {
        setActiveUsers(response.active_users || []);
        // Update stats for current period
        setActiveUsersStats(prev => ({
          ...prev,
          [targetPeriod]: response.total_active_users || 0
        }));
      }
    } catch (err) {
      console.error('Error fetching active users:', err);
      setError('Failed to fetch active users. Please try again later.');
    } finally {
      setIsLoadingActiveUsers(false);
    }
  };

  // Fetch all periods stats on mount
  const fetchAllStats = async () => {
    try {
      const [dailyRes, weeklyRes, monthlyRes] = await Promise.all([
        adminService.getActiveUsers('daily'),
        adminService.getActiveUsers('weekly'),
        adminService.getActiveUsers('monthly')
      ]);
      
      if (dailyRes.success) setActiveUsersStats(prev => ({ ...prev, daily: dailyRes.total_active_users || 0 }));
      if (weeklyRes.success) setActiveUsersStats(prev => ({ ...prev, weekly: weeklyRes.total_active_users || 0 }));
      if (monthlyRes.success) setActiveUsersStats(prev => ({ ...prev, monthly: monthlyRes.total_active_users || 0 }));
    } catch (err) {
      console.error('Error fetching active users stats:', err);
    }
  };

  const handlePeriodChange = (period) => {
    setActiveUsersPeriod(period);
  };

  const formatDate = (dateString) => {
    if (dateString === 'N/A' || !dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    } catch {
      return dateString;
    }
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerTitle}>
          <FaChartLine className={styles.headerIcon} />
          <h1>User Activity</h1>
        </div>
        <p className={styles.headerSubtitle}>
          Track user activity based on generation history
        </p>
      </div>

      {/* Statistics Cards */}
      <div className={styles.statsContainer}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <FaChartLine />
          </div>
          <div className={styles.statContent}>
            <h3>{activeUsersStats.daily}</h3>
            <p>Daily Active Users</p>
          </div>
        </div>
        
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <FaChartLine />
          </div>
          <div className={styles.statContent}>
            <h3>{activeUsersStats.weekly}</h3>
            <p>Weekly Active Users</p>
          </div>
        </div>
        
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <FaChartLine />
          </div>
          <div className={styles.statContent}>
            <h3>{activeUsersStats.monthly}</h3>
            <p>Monthly Active Users</p>
          </div>
        </div>
      </div>

      {/* Period Tabs */}
      <div className={styles.tabsContainer}>
        <button 
          className={`${styles.tabButton} ${activeUsersPeriod === 'daily' ? styles.activeTab : ''}`}
          onClick={() => handlePeriodChange('daily')}
        >
          <FaCalendar className={styles.tabIcon} />
          Daily Activity ({activeUsersStats.daily})
        </button>
        <button 
          className={`${styles.tabButton} ${activeUsersPeriod === 'weekly' ? styles.activeTab : ''}`}
          onClick={() => handlePeriodChange('weekly')}
        >
          <FaCalendar className={styles.tabIcon} />
          Weekly Activity ({activeUsersStats.weekly})
        </button>
        <button 
          className={`${styles.tabButton} ${activeUsersPeriod === 'monthly' ? styles.activeTab : ''}`}
          onClick={() => handlePeriodChange('monthly')}
        >
          <FaCalendar className={styles.tabIcon} />
          Monthly Activity ({activeUsersStats.monthly})
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className={styles.errorMessage}>
          {error}
        </div>
      )}

      {/* User Activity Table */}
      {isLoadingActiveUsers ? (
        <div className={styles.loadingContainer}>
          <FaSpinner className={styles.spinner} />
          <p>Loading active users...</p>
        </div>
      ) : activeUsers.length > 0 ? (
        <div className={styles.tableContainer}>
          <div className={styles.activityHeader}>
            <h2>User Activity - {activeUsersPeriod.charAt(0).toUpperCase() + activeUsersPeriod.slice(1)}</h2>
            <p>Users who have generated content in the last {activeUsersPeriod === 'daily' ? '24 hours' : activeUsersPeriod === 'weekly' ? '7 days' : '30 days'}</p>
          </div>
          <table className={styles.usersTable}>
            <thead>
              <tr>
                <th>Username</th>
                <th>User ID</th>
                <th>Last Generation</th>
                <th>Generation Type</th>
                <th>Listing Mode</th>
              </tr>
            </thead>
            <tbody>
              {activeUsers.map((user) => (
                <tr key={user.user_uuid} className={styles.userRow}>
                  <td className={styles.userCell}>
                    <span className={styles.username}>{user.username}</span>
                  </td>
                  <td>
                    <small className={styles.userId}>{user.user_uuid}</small>
                  </td>
                  <td>
                    <FaClock className={styles.inlineIcon} />
                    {formatDate(user.last_generation)}
                  </td>
                  <td>
                    <span className={styles.generationTypeBadge}>
                      {user.last_generation_type === 'single_generate' ? 'Single' : 
                       user.last_generation_type === 'bulk_gen_new' ? 'Bulk (New)' :
                       user.last_generation_type === 'bulk_gen_existing' ? 'Bulk (Existing)' :
                       user.last_generation_type}
                    </span>
                  </td>
                  <td>
                    <span className={styles.listingModeBadge}>
                      {user.last_listing_mode === 'new' ? 'New' : 
                       user.last_listing_mode === 'existing' ? 'Existing' : 
                       user.last_listing_mode || 'N/A'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className={styles.emptyState}>
          <FaChartLine className={styles.emptyIcon} />
          <p>No active users found for {activeUsersPeriod} period.</p>
        </div>
      )}
    </div>
  );
};

export default UserActivity;

