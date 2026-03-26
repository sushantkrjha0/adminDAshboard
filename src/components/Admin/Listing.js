import React, { useState, useEffect } from 'react';
import { FaListAlt, FaTag, FaStar, FaFileAlt, FaSpinner, FaSync, FaTimes } from 'react-icons/fa';
import styles from './Listing.module.css';
import adminService from '../../services/adminService';

const Listing = () => {
  const [users, setUsers] = useState([]);
  const [totals, setTotals] = useState({
    total_deal_tags: 0,
    total_listing_scores: 0,
    total_listings_generated: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalType, setModalType] = useState(null); // 'deal_tags' | 'listing_scores' | 'listings_generated'
  const [selectedUser, setSelectedUser] = useState(null); // user object for score breakdown popup

  useEffect(() => {
    fetchListingStats();
  }, []);

  const fetchListingStats = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await adminService.getListingStats();
      if (response.success) {
        setTotals(response.totals || {});
        setUsers(response.users || []);
      }
    } catch (err) {
      console.error('Error fetching listing stats:', err);
      setError('Failed to fetch listing stats. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const modalConfigs = {
    deal_tags: {
      title: 'Deal Tags Breakdown',
      icon: <FaTag />,
      singleKey: 'deal_tags_single',
      bulkKey: 'deal_tags_bulk',
      totalKey: 'deal_tags_checked',
    },
    listing_scores: {
      title: 'Listing Score Breakdown',
      icon: <FaStar />,
      singleKey: 'single_listing_scores',
      bulkKey: 'bulk_listing_scores',
      totalKey: 'total_listing_scores',
    },
    listings_generated: {
      title: 'Listings Generated Breakdown',
      icon: <FaFileAlt />,
      singleKey: 'listings_generated_single',
      bulkKey: 'listings_generated_bulk',
      totalKey: 'listings_generated',
    },
  };

  const modalConfig = modalType ? modalConfigs[modalType] : null;

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerTitle}>
          <FaListAlt className={styles.headerIcon} />
          <h1>Listing</h1>
        </div>
        <p className={styles.headerSubtitle}>
          Overview of deal tags, listing scores, and listings generated per user
        </p>
      </div>

      {/* Summary Cards — clickable */}
      <div className={styles.statsContainer}>
        <div
          className={`${styles.statCard} ${styles.clickableCard}`}
          onClick={() => setModalType('deal_tags')}
        >
          <div className={`${styles.statIcon} ${styles.dealIcon}`}>
            <FaTag />
          </div>
          <div className={styles.statContent}>
            <h3>{isLoading ? '—' : totals.total_deal_tags}</h3>
            <p>Total Deal Tags Checked</p>
          </div>
          <span className={styles.clickHint}>View details</span>
        </div>

        <div
          className={`${styles.statCard} ${styles.clickableCard}`}
          onClick={() => setModalType('listing_scores')}
        >
          <div className={`${styles.statIcon} ${styles.scoreIcon}`}>
            <FaStar />
          </div>
          <div className={styles.statContent}>
            <h3>{isLoading ? '—' : totals.total_listing_scores}</h3>
            <p>Total Listing Scores</p>
          </div>
          <span className={styles.clickHint}>View details</span>
        </div>

        <div
          className={`${styles.statCard} ${styles.clickableCard}`}
          onClick={() => setModalType('listings_generated')}
        >
          <div className={`${styles.statIcon} ${styles.genIcon}`}>
            <FaFileAlt />
          </div>
          <div className={styles.statContent}>
            <h3>{isLoading ? '—' : totals.total_listings_generated}</h3>
            <p>Total Listings Generated</p>
          </div>
          <span className={styles.clickHint}>View details</span>
        </div>
      </div>

      {error && <div className={styles.errorMessage}>{error}</div>}

      {/* Main Table */}
      {isLoading ? (
        <div className={styles.loadingContainer}>
          <FaSpinner className={styles.spinner} />
          <p>Loading listing data...</p>
        </div>
      ) : users.length === 0 ? (
        <div className={styles.emptyState}>
          <FaListAlt className={styles.emptyIcon} />
          <p>No listing activity found.</p>
        </div>
      ) : (
        <div className={styles.tableContainer}>
          <div className={styles.tableHeader}>
            <h2>Per-User Breakdown</h2>
            <button className={styles.refreshButton} onClick={fetchListingStats}>
              <FaSync className={styles.refreshIcon} />
              Refresh
            </button>
          </div>
          <table className={styles.listingTable}>
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th className={styles.centerCell}>
                  <FaTag className={styles.colIcon} /> Deal Tags Checked
                </th>
                <th className={styles.centerCell}>
                  <FaStar className={styles.colIcon} /> Score
                </th>
                <th className={styles.centerCell}>
                  <FaFileAlt className={styles.colIcon} /> Listings Generated
                </th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.user_uuid} className={styles.tableRow}>
                  <td className={styles.userCell}>
                    <span className={styles.username}>{user.username}</span>
                    <small className={styles.userId}>{user.user_uuid}</small>
                  </td>
                  <td className={styles.emailCell}>{user.email || 'N/A'}</td>
                  <td className={styles.centerCell}>
                    <span className={styles.countBadge}>{user.deal_tags_checked}</span>
                  </td>
                  <td className={styles.centerCell}>
                    <span
                      className={`${styles.countBadge} ${styles.totalBadge} ${styles.clickableBadge}`}
                      onClick={() => setSelectedUser(user)}
                      title="Click to see single vs bulk breakdown"
                    >
                      {user.total_listing_scores}
                    </span>
                  </td>
                  <td className={styles.centerCell}>
                    <span className={`${styles.countBadge} ${styles.genBadge}`}>
                      {user.listings_generated}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* User score breakdown popup */}
      {selectedUser && (
        <div className={styles.modalOverlay} onClick={() => setSelectedUser(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div className={styles.modalTitle}>
                <span className={styles.modalTitleIcon}><FaStar /></span>
                <h2>Listing Score Breakdown</h2>
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
                    <span className={styles.scoreCardLabel}>Single Listing Score</span>
                    <span className={`${styles.countBadge} ${styles.totalBadge}`}>
                      {selectedUser.single_listing_scores || 0}
                    </span>
                  </div>
                  <div className={styles.scoreCard}>
                    <span className={styles.scoreCardLabel}>Bulk Listing Score</span>
                    <span className={`${styles.countBadge} ${styles.totalBadge}`}>
                      {selectedUser.bulk_listing_scores || 0}
                    </span>
                  </div>
                  <div className={`${styles.scoreCard} ${styles.scoreCardTotal}`}>
                    <span className={styles.scoreCardLabel}>Total Score</span>
                    <span className={`${styles.countBadge} ${styles.totalBadge}`}>
                      {selectedUser.total_listing_scores || 0}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stat card modal */}
      {modalType && modalConfig && (
        <div className={styles.modalOverlay} onClick={() => setModalType(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div className={styles.modalTitle}>
                <span className={styles.modalTitleIcon}>{modalConfig.icon}</span>
                <h2>{modalConfig.title}</h2>
              </div>
              <button className={styles.modalClose} onClick={() => setModalType(null)}>
                <FaTimes />
              </button>
            </div>
            <div className={styles.modalBody}>
              {users.length === 0 ? (
                <p className={styles.modalEmpty}>No data available.</p>
              ) : (
                <table className={styles.listingTable}>
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Email</th>
                      <th className={styles.centerCell}>Single</th>
                      <th className={styles.centerCell}>Bulk</th>
                      <th className={styles.centerCell}>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.user_uuid} className={styles.tableRow}>
                        <td className={styles.userCell}>
                          <span className={styles.username}>{user.username}</span>
                          <small className={styles.userId}>{user.user_uuid}</small>
                        </td>
                        <td className={styles.emailCell}>{user.email || 'N/A'}</td>
                        <td className={styles.centerCell}>
                          <span className={styles.countBadge}>{user[modalConfig.singleKey] || 0}</span>
                        </td>
                        <td className={styles.centerCell}>
                          <span className={styles.countBadge}>{user[modalConfig.bulkKey] || 0}</span>
                        </td>
                        <td className={styles.centerCell}>
                          <span className={`${styles.countBadge} ${styles.totalBadge}`}>
                            {user[modalConfig.totalKey] || 0}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Listing;
