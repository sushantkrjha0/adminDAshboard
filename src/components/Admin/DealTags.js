import React, { useState, useEffect } from 'react';
import { FaTag, FaSpinner, FaSync, FaClock } from 'react-icons/fa';
import styles from './Listing.module.css';
import adminService from '../../services/adminService';
import { formatIst } from '../../utils/dateFormat';
import UserActivityModal from './UserActivityModal';
import Pagination, { usePagination } from './Pagination';

const DealTags = () => {
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
      const response = await adminService.getDealTagsStats();
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

  const filteredUsers = users.filter(u => (u.total || 0) > 0 || (u.failed || 0) > 0);
  const { pageItems: pagedUsers, page, setPage, totalPages, total } = usePagination(filteredUsers);

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
            <h3>{isLoading ? '—' : (totals.total_single || 0)}</h3>
            <p>Single Deal Tags</p>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.dealIcon}`}><FaTag /></div>
          <div className={styles.statContent}>
            <h3>{isLoading ? '—' : (totals.total_bulk || 0)}</h3>
            <p>Bulk Deal Tags</p>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.dealIcon}`}><FaTag /></div>
          <div className={styles.statContent}>
            <h3>{isLoading ? '—' : (totals.total || 0)}</h3>
            <p>Total Deal Tags Checked</p>
          </div>
        </div>
        {(totals.total_failed || 0) > 0 && (
          <div className={styles.statCard}>
            <div className={`${styles.statIcon} ${styles.dealIcon}`} style={{ background: 'linear-gradient(135deg, #fc8181 0%, #c53030 100%)' }}>
              <FaTag />
            </div>
            <div className={styles.statContent}>
              <h3>{totals.total_failed}</h3>
              <p>Failed Tasks</p>
            </div>
          </div>
        )}
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
                <th className={styles.centerCell}>Total</th>
                <th className={styles.centerCell}>Failed</th>
                <th>Last Activity (IST)</th>
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
                    <span className={`${styles.countBadge} ${styles.totalBadge}`}>
                      {user.total || 0}
                    </span>
                  </td>
                  <td className={styles.centerCell}>
                    {(user.failed || 0) > 0 ? (
                      <span className={styles.countBadge} style={{ background: '#fed7d7', color: '#c53030' }}>
                        {user.failed}
                      </span>
                    ) : (
                      <span style={{ color: '#a0aec0' }}>—</span>
                    )}
                  </td>
                  <td>
                    <FaClock style={{ marginRight: '0.4rem', color: '#667eea', fontSize: '0.85rem' }} />
                    <span style={{ fontSize: '0.85rem', color: '#4a5568' }}>
                      {formatIst(user.last_activity_at_ist)}
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
          initialTab="deal_tags"
          onClose={() => setSelectedUser(null)}
        />
      )}
    </div>
  );
};

export default DealTags;
