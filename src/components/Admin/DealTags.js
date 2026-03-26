import React, { useState, useEffect } from 'react';
import { FaTag, FaSpinner, FaSync } from 'react-icons/fa';
import styles from './Listing.module.css';
import adminService from '../../services/adminService';

const DealTags = () => {
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
      setError('Failed to fetch deal tag data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerTitle}>
          <FaTag className={styles.headerIcon} />
          <h1>Deal Tags</h1>
        </div>
        <p className={styles.headerSubtitle}>Deal tags checked per user — single vs bulk breakdown</p>
      </div>

      {/* Summary Cards */}
      <div className={styles.statsContainer}>
        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.dealIcon}`}><FaTag /></div>
          <div className={styles.statContent}>
            <h3>{isLoading ? '—' : (totals.total_deal_tags_single || 0)}</h3>
            <p>Single Deal Tags</p>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.dealIcon}`}><FaTag /></div>
          <div className={styles.statContent}>
            <h3>{isLoading ? '—' : (totals.total_deal_tags_bulk || 0)}</h3>
            <p>Bulk Deal Tags</p>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.dealIcon}`}><FaTag /></div>
          <div className={styles.statContent}>
            <h3>{isLoading ? '—' : (totals.total_deal_tags || 0)}</h3>
            <p>Total Deal Tags Checked</p>
          </div>
        </div>
      </div>

      {error && <div className={styles.errorMessage}>{error}</div>}

      {isLoading ? (
        <div className={styles.loadingContainer}>
          <FaSpinner className={styles.spinner} />
          <p>Loading deal tag data...</p>
        </div>
      ) : users.length === 0 ? (
        <div className={styles.emptyState}>
          <FaTag className={styles.emptyIcon} />
          <p>No deal tag activity found.</p>
        </div>
      ) : (
        <div className={styles.tableContainer}>
          <div className={styles.tableHeader}>
            <h2>Per-User Deal Tag Breakdown</h2>
            <button className={styles.refreshButton} onClick={fetchData}>
              <FaSync className={styles.refreshIcon} /> Refresh
            </button>
          </div>
          <table className={styles.listingTable}>
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th className={styles.centerCell}>Single Deal Tags</th>
                <th className={styles.centerCell}>Bulk Deal Tags</th>
                <th className={styles.centerCell}>Total Deal Tags</th>
              </tr>
            </thead>
            <tbody>
              {users.filter(u => u.deal_tags_checked > 0).map((user) => (
                <tr key={user.user_uuid} className={styles.tableRow}>
                  <td className={styles.userCell}>
                    <span className={styles.username}>{user.username}</span>
                    <small className={styles.userId}>{user.user_uuid}</small>
                  </td>
                  <td className={styles.emailCell}>{user.email || 'N/A'}</td>
                  <td className={styles.centerCell}>
                    <span className={styles.countBadge}>{user.deal_tags_single || 0}</span>
                  </td>
                  <td className={styles.centerCell}>
                    <span className={styles.countBadge}>{user.deal_tags_bulk || 0}</span>
                  </td>
                  <td className={styles.centerCell}>
                    <span className={`${styles.countBadge} ${styles.totalBadge}`}>
                      {user.deal_tags_checked || 0}
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

export default DealTags;
