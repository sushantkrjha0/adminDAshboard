import React, { useState, useEffect } from 'react';
import { FaFileAlt, FaSpinner, FaSync, FaClock } from 'react-icons/fa';
import styles from './Listing.module.css';
import adminService from '../../services/adminService';
import { formatIst } from '../../utils/dateFormat';
import UserActivityModal from './UserActivityModal';
import Pagination, { usePagination } from './Pagination';
import SearchInput, { filterByUserSearch } from './SearchInput';

const GeneratedListing = () => {
  const [users, setUsers] = useState([]);
  const [totals, setTotals] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

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

  const filteredUsers = filterByUserSearch(
    users.filter(u => (u.total || 0) > 0),
    searchQuery,
  );
  const { pageItems: pagedUsers, page, setPage, totalPages, total } = usePagination(filteredUsers);

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
            <SearchInput value={searchQuery} onChange={setSearchQuery} />
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <h2>Per-User Generated Listing Breakdown</h2>
              <button className={styles.refreshButton} onClick={fetchData}>
                <FaSync className={styles.refreshIcon} /> Refresh
              </button>
            </div>
          </div>
          <table className={styles.listingTable}>
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th className={styles.centerCell}>Single</th>
                <th className={styles.centerCell}>Bulk</th>
                <th className={styles.centerCell}>Total</th>
                <th>Last Activity (IST)</th>
                <th className={styles.centerCell}>New vs Existing</th>
              </tr>
            </thead>
            <tbody>
              {pagedUsers.map((user) => (
                <tr
                  key={user.user_uuid}
                  className={styles.tableRow}
                  style={{ cursor: 'pointer' }}
                  onClick={() => setSelectedUser(user)}
                  title="Click to see this user's full activity"
                >
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
                  <td>
                    <FaClock style={{ marginRight: '0.4rem', color: '#667eea', fontSize: '0.85rem' }} />
                    <span style={{ fontSize: '0.85rem', color: '#4a5568' }}>
                      {formatIst(user.last_activity_at_ist)}
                    </span>
                  </td>
                  <td className={styles.centerCell}>
                    <span
                      className={`${styles.countBadge} ${styles.totalBadge} ${styles.clickableBadge}`}
                      onClick={(e) => { e.stopPropagation(); setSelectedUser(user); }}
                      title="Click to see full activity"
                    >
                      View
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <Pagination
            page={page}
            totalPages={totalPages}
            total={total}
            onPageChange={setPage}
            label="users"
          />
        </div>
      )}

      {selectedUser && (
        <UserActivityModal
          userUuid={selectedUser.user_uuid}
          initialTab="generations"
          onClose={() => setSelectedUser(null)}
        />
      )}
    </div>
  );
};

export default GeneratedListing;
