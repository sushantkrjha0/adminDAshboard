import React, { useState, useEffect } from 'react';
import { FaStar, FaSpinner, FaSync } from 'react-icons/fa';
import styles from './Listing.module.css';
import adminService from '../../services/adminService';

const ListingScore = () => {
  const [users, setUsers] = useState([]);
  const [totals, setTotals] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await adminService.getListingStats();
      if (response.success) {
        setTotals(response.totals || {});
        setUsers(response.users || []);
      }
    } catch (err) {
      setError('Failed to fetch listing score data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerTitle}>
          <FaStar className={styles.headerIcon} />
          <h1>Listing Score</h1>
        </div>
        <p className={styles.headerSubtitle}>Listing scores per user — single vs bulk breakdown</p>
      </div>

      {/* Summary Cards */}
      <div className={styles.statsContainer}>
        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.scoreIcon}`}><FaStar /></div>
          <div className={styles.statContent}>
            <h3>{isLoading ? '—' : (totals.total_single_listing_scores || 0)}</h3>
            <p>Single Listing Scores</p>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.scoreIcon}`}><FaStar /></div>
          <div className={styles.statContent}>
            <h3>{isLoading ? '—' : (totals.total_bulk_listing_scores || 0)}</h3>
            <p>Bulk Listing Scores</p>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.scoreIcon}`}><FaStar /></div>
          <div className={styles.statContent}>
            <h3>{isLoading ? '—' : (totals.total_listing_scores || 0)}</h3>
            <p>Total Listing Scores</p>
          </div>
        </div>
      </div>

      {error && <div className={styles.errorMessage}>{error}</div>}

      {isLoading ? (
        <div className={styles.loadingContainer}>
          <FaSpinner className={styles.spinner} />
          <p>Loading listing score data...</p>
        </div>
      ) : users.length === 0 ? (
        <div className={styles.emptyState}>
          <FaStar className={styles.emptyIcon} />
          <p>No listing score activity found.</p>
        </div>
      ) : (
        <div className={styles.tableContainer}>
          <div className={styles.tableHeader}>
            <h2>Per-User Listing Score Breakdown</h2>
            <button className={styles.refreshButton} onClick={fetchData}>
              <FaSync className={styles.refreshIcon} /> Refresh
            </button>
          </div>
          <table className={styles.listingTable}>
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th className={styles.centerCell}>Single Listing Scores</th>
                <th className={styles.centerCell}>Bulk Listing Scores</th>
                <th className={styles.centerCell}>Total Listing Scores</th>
              </tr>
            </thead>
            <tbody>
              {users.filter(u => u.total_listing_scores > 0).map((user) => (
                <tr key={user.user_uuid} className={styles.tableRow}>
                  <td className={styles.userCell}>
                    <span className={styles.username}>{user.username}</span>
                    <small className={styles.userId}>{user.user_uuid}</small>
                  </td>
                  <td className={styles.emailCell}>{user.email || 'N/A'}</td>
                  <td className={styles.centerCell}>
                    <span className={styles.countBadge}>{user.single_listing_scores || 0}</span>
                  </td>
                  <td className={styles.centerCell}>
                    <span className={styles.countBadge}>{user.bulk_listing_scores || 0}</span>
                  </td>
                  <td className={styles.centerCell}>
                    <span className={`${styles.countBadge} ${styles.totalBadge}`}>
                      {user.total_listing_scores || 0}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ListingScore;
