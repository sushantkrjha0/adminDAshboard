import React, { useState, useEffect } from 'react';
import { FaFileAlt, FaSpinner, FaSync, FaTimes } from 'react-icons/fa';
import styles from './Listing.module.css';
import adminService from '../../services/adminService';

const GeneratedListing = () => {
  const [users, setUsers] = useState([]);
  const [totals, setTotals] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await adminService.getListingsGeneratedStats();
      if (response.success) {
        setTotals(response.totals || {});
        setUsers(response.users || []);
      }
    } catch (err) {
      setError('Failed to fetch generated listing data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerTitle}>
          <FaFileAlt className={styles.headerIcon} />
          <h1>Generated Listings</h1>
        </div>
        <p className={styles.headerSubtitle}>Listings generated per user — single vs bulk breakdown</p>
      </div>

      {/* Summary Cards */}
      <div className={styles.statsContainer}>
        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.genIcon}`}><FaFileAlt /></div>
          <div className={styles.statContent}>
            <h3>{isLoading ? '—' : (totals.total_single || 0)}</h3>
            <p>Single Listings Generated</p>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.genIcon}`}><FaFileAlt /></div>
          <div className={styles.statContent}>
            <h3>{isLoading ? '—' : (totals.total_bulk || 0)}</h3>
            <p>Bulk Listings Generated</p>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.genIcon}`}><FaFileAlt /></div>
          <div className={styles.statContent}>
            <h3>{isLoading ? '—' : (totals.total || 0)}</h3>
            <p>Total Listings Generated</p>
          </div>
        </div>
      </div>

      {error && <div className={styles.errorMessage}>{error}</div>}

      {isLoading ? (
        <div className={styles.loadingContainer}>
          <FaSpinner className={styles.spinner} />
          <p>Loading generated listing data...</p>
        </div>
      ) : users.filter(u => u.total > 0).length === 0 ? (
        <div className={styles.emptyState}>
          <FaFileAlt className={styles.emptyIcon} />
          <p>No generated listing activity found.</p>
        </div>
      ) : (
        <div className={styles.tableContainer}>
          <div className={styles.tableHeader}>
            <h2>Per-User Generated Listing Breakdown</h2>
            <button className={styles.refreshButton} onClick={fetchData}>
              <FaSync className={styles.refreshIcon} /> Refresh
            </button>
          </div>
          <table className={styles.listingTable}>
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th className={styles.centerCell}>Single Listings Generated</th>
                <th className={styles.centerCell}>Bulk Listings Generated</th>
                <th className={styles.centerCell}>Total</th>
                <th className={styles.centerCell}>New vs Existing</th>
              </tr>
            </thead>
            <tbody>
              {users.filter(u => u.total > 0).map((user) => (
                <tr key={user.user_uuid} className={styles.tableRow}>
                  <td className={styles.userCell}>
                    <span className={styles.username}>{user.username}</span>
                    <small className={styles.userId}>{user.user_uuid}</small>
                  </td>
                  <td className={styles.emailCell}>{user.email || 'N/A'}</td>
                  <td className={styles.centerCell}>
                    <span className={styles.countBadge}>{user.single || 0}</span>
                  </td>
                  <td className={styles.centerCell}>
                    <span className={styles.countBadge}>{user.bulk || 0}</span>
                  </td>
                  <td className={styles.centerCell}>
                    <span className={`${styles.countBadge} ${styles.genBadge}`}>
                      {user.total || 0}
                    </span>
                  </td>
                  <td className={styles.centerCell}>
                    <span
                      className={`${styles.countBadge} ${styles.totalBadge} ${styles.clickableBadge}`}
                      onClick={() => setSelectedUser(user)}
                      title="Click to see new vs existing breakdown"
                    >
                      View
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* New vs Existing popup */}
      {selectedUser && (
        <div className={styles.modalOverlay} onClick={() => setSelectedUser(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div className={styles.modalTitle}>
                <span className={styles.modalTitleIcon}><FaFileAlt /></span>
                <h2>New vs Existing Breakdown</h2>
              </div>
              <button className={styles.modalClose} onClick={() => setSelectedUser(null)}>
                <FaTimes />
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.userScoreDetail}>
                <div className={styles.userScoreHeader}>
                  <span className={styles.username}>{selectedUser.username}</span>
                  <small className={styles.userId}>{selectedUser.email || selectedUser.user_uuid}</small>
                </div>
                <div className={styles.scoreBreakdownCards}>
                  <div className={styles.scoreCard}>
                    <span className={styles.scoreCardLabel}>New Listings</span>
                    <span className={`${styles.countBadge} ${styles.genBadge}`}>
                      {selectedUser.new || 0}
                    </span>
                  </div>
                  <div className={styles.scoreCard}>
                    <span className={styles.scoreCardLabel}>Existing Listings</span>
                    <span className={`${styles.countBadge} ${styles.totalBadge}`}>
                      {selectedUser.existing || 0}
                    </span>
                  </div>
                  <div className={`${styles.scoreCard} ${styles.scoreCardTotal}`}>
                    <span className={styles.scoreCardLabel}>Total</span>
                    <span className={`${styles.countBadge} ${styles.totalBadge}`}>
                      {selectedUser.total || 0}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GeneratedListing;
