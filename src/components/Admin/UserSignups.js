import React, { useState, useEffect } from 'react';
import { FaUserPlus, FaSpinner, FaCalendar, FaClock, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import styles from './UserSignups.module.css';
import adminService from '../../services/adminService';

const UserSignups = () => {
  const [signups, setSignups] = useState([]);
  const [isLoadingSignups, setIsLoadingSignups] = useState(false);
  const [signupsPeriod, setSignupsPeriod] = useState('daily'); // daily, weekly, monthly
  const [signupsStats, setSignupsStats] = useState({
    daily: 0,
    weekly: 0,
    monthly: 0
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSignups();
    fetchAllStats();
  }, []);

  useEffect(() => {
    fetchSignups();
  }, [signupsPeriod]);

  const fetchSignups = async (period = null) => {
    try {
      setIsLoadingSignups(true);
      setError(null);
      const targetPeriod = period || signupsPeriod;
      const response = await adminService.getUserSignups(targetPeriod);
      if (response.success) {
        // Filter out "Error Processing User" entries
        const validSignups = (response.signups || []).filter(
          user => user.username !== "Error Processing User" && user.user_type !== "Error"
        );
        setSignups(validSignups);
        // Update stats for current period (use filtered count)
        setSignupsStats(prev => ({
          ...prev,
          [targetPeriod]: validSignups.length
        }));
      }
    } catch (err) {
      console.error('Error fetching user signups:', err);
      setError('Failed to fetch user signups. Please try again later.');
    } finally {
      setIsLoadingSignups(false);
    }
  };

  // Fetch all periods stats on mount
  const fetchAllStats = async () => {
    try {
      const [dailyRes, weeklyRes, monthlyRes] = await Promise.all([
        adminService.getUserSignups('daily'),
        adminService.getUserSignups('weekly'),
        adminService.getUserSignups('monthly')
      ]);
      
      // Filter out error entries and count valid signups
      if (dailyRes.success) {
        const validDaily = (dailyRes.signups || []).filter(
          user => user.username !== "Error Processing User" && user.user_type !== "Error"
        );
        setSignupsStats(prev => ({ ...prev, daily: validDaily.length }));
      }
      if (weeklyRes.success) {
        const validWeekly = (weeklyRes.signups || []).filter(
          user => user.username !== "Error Processing User" && user.user_type !== "Error"
        );
        setSignupsStats(prev => ({ ...prev, weekly: validWeekly.length }));
      }
      if (monthlyRes.success) {
        const validMonthly = (monthlyRes.signups || []).filter(
          user => user.username !== "Error Processing User" && user.user_type !== "Error"
        );
        setSignupsStats(prev => ({ ...prev, monthly: validMonthly.length }));
      }
    } catch (err) {
      console.error('Error fetching user signups stats:', err);
    }
  };

  const handlePeriodChange = (period) => {
    setSignupsPeriod(period);
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
          <FaUserPlus className={styles.headerIcon} />
          <h1>User Signups</h1>
        </div>
        <p className={styles.headerSubtitle}>
          Track new user registrations and signups
        </p>
      </div>

      {/* Statistics Cards */}
      <div className={styles.statsContainer}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <FaUserPlus />
          </div>
          <div className={styles.statContent}>
            <h3>{signupsStats.daily}</h3>
            <p>Daily Signups</p>
          </div>
        </div>
        
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <FaUserPlus />
          </div>
          <div className={styles.statContent}>
            <h3>{signupsStats.weekly}</h3>
            <p>Weekly Signups</p>
          </div>
        </div>
        
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <FaUserPlus />
          </div>
          <div className={styles.statContent}>
            <h3>{signupsStats.monthly}</h3>
            <p>Monthly Signups</p>
          </div>
        </div>
      </div>

      {/* Period Tabs */}
      <div className={styles.tabsContainer}>
        <button 
          className={`${styles.tabButton} ${signupsPeriod === 'daily' ? styles.activeTab : ''}`}
          onClick={() => handlePeriodChange('daily')}
        >
          <FaCalendar className={styles.tabIcon} />
          Daily Signups ({signupsStats.daily})
        </button>
        <button 
          className={`${styles.tabButton} ${signupsPeriod === 'weekly' ? styles.activeTab : ''}`}
          onClick={() => handlePeriodChange('weekly')}
        >
          <FaCalendar className={styles.tabIcon} />
          Weekly Signups ({signupsStats.weekly})
        </button>
        <button 
          className={`${styles.tabButton} ${signupsPeriod === 'monthly' ? styles.activeTab : ''}`}
          onClick={() => handlePeriodChange('monthly')}
        >
          <FaCalendar className={styles.tabIcon} />
          Monthly Signups ({signupsStats.monthly})
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className={styles.errorMessage}>
          {error}
        </div>
      )}

      {/* User Signups Table */}
      {isLoadingSignups ? (
        <div className={styles.loadingContainer}>
          <FaSpinner className={styles.spinner} />
          <p>Loading user signups...</p>
        </div>
      ) : signups.length > 0 ? (
        <div className={styles.tableContainer}>
          <div className={styles.signupsHeader}>
            <h2>New Signups - {signupsPeriod.charAt(0).toUpperCase() + signupsPeriod.slice(1)}</h2>
            <p>Users who registered in the last {signupsPeriod === 'daily' ? '24 hours' : signupsPeriod === 'weekly' ? '7 days' : '30 days'}</p>
          </div>
          <table className={styles.usersTable}>
            <thead>
              <tr>
                <th>Username</th>
                <th>Email</th>
                <th>Phone Number</th>
                <th>Signup Date</th>
                <th>User Type</th>
                <th>Onboarding Status</th>
              </tr>
            </thead>
            <tbody>
              {signups.map((user) => (
                <tr key={user.user_uuid} className={styles.userRow}>
                  <td className={styles.userCell}>
                    <span className={styles.username}>{user.username}</span>
                  </td>
                  <td>
                    <span className={styles.email}>{user.email}</span>
                  </td>
                  <td>
                    <span className={styles.phoneNumber}>{user.phone_number || 'N/A'}</span>
                  </td>
                  <td>
                    <FaClock className={styles.inlineIcon} />
                    {formatDate(user.created_at)}
                  </td>
                  <td>
                    <span className={styles.userTypeBadge}>
                      {user.user_type}
                    </span>
                  </td>
                  <td>
                    {user.onboarding_complete ? (
                      <span className={`${styles.statusBadge} ${styles.successBadge}`}>
                        <FaCheckCircle className={styles.badgeIcon} />
                        Complete
                      </span>
                    ) : (
                      <span className={`${styles.statusBadge} ${styles.warningBadge}`}>
                        <FaTimesCircle className={styles.badgeIcon} />
                        Pending
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className={styles.emptyState}>
          <FaUserPlus className={styles.emptyIcon} />
          <p>No new signups found for {signupsPeriod} period.</p>
        </div>
      )}
    </div>
  );
};

export default UserSignups;

