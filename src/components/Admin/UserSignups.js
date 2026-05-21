import React, { useState, useEffect, useRef } from 'react';
import {
  FaUserPlus,
  FaSpinner,
  FaCalendar,
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
  FaTimes,
  FaGoogle,
  FaEnvelope,
  FaPhone,
  FaAmazon,
  FaCoins,
  FaBuilding,
  FaMapMarkerAlt,
  FaUserTag,
  FaIdBadge,
} from 'react-icons/fa';
import styles from './UserSignups.module.css';
import adminService from '../../services/adminService';
import Pagination, { usePagination } from './Pagination';
import SearchInput, { filterByUserSearch } from './SearchInput';

const filterValidSignups = (signups) =>
  (signups || []).filter(
    user => user.username !== "Error Processing User" && user.user_type !== "Error"
  );

const formatDate = (dateString) => {
  if (dateString === 'N/A' || !dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  } catch {
    return dateString;
  }
};

const UserSignups = () => {
  const [signupsByPeriod, setSignupsByPeriod] = useState({
    daily: [],
    weekly: [],
    monthly: [],
    all: [],
  });
  const [isLoadingSignups, setIsLoadingSignups] = useState(false);
  const [signupsPeriod, setSignupsPeriod] = useState('daily');
  const [signupsStats, setSignupsStats] = useState({
    daily: 0,
    weekly: 0,
    monthly: 0,
    all: 0,
  });
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const isInitialMount = useRef(true);

  // On mount: fetch all three period buckets in parallel
  useEffect(() => {
    fetchAllStats();
  }, []);

  // On period change (skip initial mount since fetchAllStats covers it)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    // If we already have data for this period, no need to refetch
    if (signupsByPeriod[signupsPeriod] && signupsByPeriod[signupsPeriod].length > 0) {
      return;
    }
    fetchSignups(signupsPeriod);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signupsPeriod]);

  const fetchSignups = async (period) => {
    try {
      setIsLoadingSignups(true);
      setError(null);
      const response = await adminService.getUserSignups(period);
      if (response.success) {
        const validSignups = filterValidSignups(response.signups);
        setSignupsByPeriod(prev => ({ ...prev, [period]: validSignups }));
        setSignupsStats(prev => ({ ...prev, [period]: validSignups.length }));
      }
    } catch (err) {
      console.error('Error fetching user signups:', err);
      setError('Failed to fetch user signups. Please try again later.');
    } finally {
      setIsLoadingSignups(false);
    }
  };

  const fetchAllStats = async () => {
    try {
      setIsLoadingSignups(true);
      setError(null);
      const [dailyRes, weeklyRes, monthlyRes, allRes] = await Promise.all([
        adminService.getUserSignups('daily'),
        adminService.getUserSignups('weekly'),
        adminService.getUserSignups('monthly'),
        adminService.getUserSignups('all'),
      ]);

      const validDaily = dailyRes.success ? filterValidSignups(dailyRes.signups) : [];
      const validWeekly = weeklyRes.success ? filterValidSignups(weeklyRes.signups) : [];
      const validMonthly = monthlyRes.success ? filterValidSignups(monthlyRes.signups) : [];
      const validAll = allRes.success ? filterValidSignups(allRes.signups) : [];

      setSignupsByPeriod({
        daily: validDaily,
        weekly: validWeekly,
        monthly: validMonthly,
        all: validAll,
      });
      setSignupsStats({
        daily: validDaily.length,
        weekly: validWeekly.length,
        monthly: validMonthly.length,
        all: validAll.length,
      });
    } catch (err) {
      console.error('Error fetching user signups stats:', err);
      setError('Failed to fetch user signups. Please try again later.');
    } finally {
      setIsLoadingSignups(false);
    }
  };

  const handlePeriodChange = (period) => {
    setSignupsPeriod(period);
  };

  const signups = signupsByPeriod[signupsPeriod] || [];
  const filteredSignups = filterByUserSearch(signups, searchQuery);
  const { pageItems: pagedSignups, page, setPage, totalPages, total } = usePagination(filteredSignups);

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
          <div className={styles.statIcon}><FaUserPlus /></div>
          <div className={styles.statContent}>
            <h3>{signupsStats.daily}</h3>
            <p>Daily Signups</p>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}><FaUserPlus /></div>
          <div className={styles.statContent}>
            <h3>{signupsStats.weekly}</h3>
            <p>Weekly Signups</p>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}><FaUserPlus /></div>
          <div className={styles.statContent}>
            <h3>{signupsStats.monthly}</h3>
            <p>Monthly Signups</p>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}><FaUserPlus /></div>
          <div className={styles.statContent}>
            <h3>{signupsStats.all}</h3>
            <p>All Users</p>
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
        <button
          className={`${styles.tabButton} ${signupsPeriod === 'all' ? styles.activeTab : ''}`}
          onClick={() => handlePeriodChange('all')}
        >
          <FaUserPlus className={styles.tabIcon} />
          All Users ({signupsStats.all})
        </button>
      </div>

      {error && <div className={styles.errorMessage}>{error}</div>}

      {/* User Signups Table */}
      {isLoadingSignups ? (
        <div className={styles.loadingContainer}>
          <FaSpinner className={styles.spinner} />
          <p>Loading user signups...</p>
        </div>
      ) : signups.length > 0 ? (
        <div className={styles.tableContainer}>
          <div className={styles.signupsHeader}>
            <h2>
              {signupsPeriod === 'all'
                ? 'All Registered Users'
                : `New Signups - ${signupsPeriod.charAt(0).toUpperCase() + signupsPeriod.slice(1)}`}
            </h2>
            <p>
              {signupsPeriod === 'all'
                ? 'Every user who has registered to date'
                : `Users who registered in the last ${
                    signupsPeriod === 'daily' ? '24 hours' : signupsPeriod === 'weekly' ? '7 days' : '30 days'
                  }`}
              {'  •  Click any row for full details'}
            </p>
            <div style={{ marginTop: '0.75rem' }}>
              <SearchInput value={searchQuery} onChange={setSearchQuery} />
            </div>
          </div>
          <table className={styles.usersTable}>
            <thead>
              <tr>
                <th>Username</th>
                <th>Email</th>
                <th>Phone Number</th>
                <th>Signup Date</th>
                <th>Method</th>
                <th>Amazon</th>
                <th>Onboarding</th>
              </tr>
            </thead>
            <tbody>
              {pagedSignups.map((user) => (
                <tr
                  key={user.user_uuid}
                  className={`${styles.userRow} ${styles.clickableRow}`}
                  onClick={() => setSelectedUser(user)}
                >
                  <td className={styles.userCell}>
                    <span className={styles.username}>{user.username}</span>
                  </td>
                  <td><span className={styles.email}>{user.email}</span></td>
                  <td>
                    <span className={styles.phoneNumber}>{user.phone_number || 'N/A'}</span>
                  </td>
                  <td>
                    <FaClock className={styles.inlineIcon} />
                    {formatDate(user.created_at)}
                  </td>
                  <td>
                    {user.signup_method === 'google' ? (
                      <span className={`${styles.methodBadge} ${styles.googleBadge}`}>
                        <FaGoogle className={styles.badgeIcon} /> Google
                      </span>
                    ) : (
                      <span className={`${styles.methodBadge} ${styles.emailBadge}`}>
                        <FaEnvelope className={styles.badgeIcon} /> Email
                      </span>
                    )}
                  </td>
                  <td>
                    {user.amazon_status ? (
                      <span className={`${styles.statusBadge} ${styles.successBadge}`}>
                        <FaAmazon className={styles.badgeIcon} /> Connected
                      </span>
                    ) : (
                      <span className={`${styles.statusBadge} ${styles.warningBadge}`}>
                        <FaTimesCircle className={styles.badgeIcon} /> No
                      </span>
                    )}
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
          <Pagination
            page={page}
            totalPages={totalPages}
            total={total}
            onPageChange={setPage}
            label="signups"
          />
        </div>
      ) : (
        <div className={styles.emptyState}>
          <FaUserPlus className={styles.emptyIcon} />
          <p>No new signups found for {signupsPeriod} period.</p>
        </div>
      )}

      {/* User Detail Modal */}
      {selectedUser && (
        <UserDetailModal user={selectedUser} onClose={() => setSelectedUser(null)} />
      )}
    </div>
  );
};

const DetailRow = ({ icon: Icon, label, value }) => (
  <div className={styles.detailRow}>
    <div className={styles.detailLabel}>
      {Icon && <Icon className={styles.detailIcon} />}
      <span>{label}</span>
    </div>
    <div className={styles.detailValue}>{value ?? 'N/A'}</div>
  </div>
);

const UserDetailModal = ({ user, onClose }) => {
  // Close on Escape
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const isGoogle = user.signup_method === 'google';
  const googleProfile = user.google_profile || {};
  const avatar = googleProfile.picture || user.picture || '';

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <button className={styles.modalClose} onClick={onClose} aria-label="Close">
          <FaTimes />
        </button>

        <div className={styles.modalHeader}>
          {avatar ? (
            <img src={avatar} alt={user.username} className={styles.modalAvatar} />
          ) : (
            <div className={styles.modalAvatarPlaceholder}>
              {(user.username || '?').charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <h2 className={styles.modalTitle}>{user.username}</h2>
            <p className={styles.modalSubtitle}>{user.email}</p>
            <div className={styles.modalBadges}>
              {isGoogle ? (
                <span className={`${styles.methodBadge} ${styles.googleBadge}`}>
                  <FaGoogle className={styles.badgeIcon} /> Google Signup
                </span>
              ) : (
                <span className={`${styles.methodBadge} ${styles.emailBadge}`}>
                  <FaEnvelope className={styles.badgeIcon} /> Email Signup
                </span>
              )}
              {user.amazon_status ? (
                <span className={`${styles.statusBadge} ${styles.successBadge}`}>
                  <FaAmazon className={styles.badgeIcon} /> Amazon Connected
                </span>
              ) : (
                <span className={`${styles.statusBadge} ${styles.warningBadge}`}>
                  <FaAmazon className={styles.badgeIcon} /> Amazon Not Connected
                </span>
              )}
              {user.onboarding_complete ? (
                <span className={`${styles.statusBadge} ${styles.successBadge}`}>
                  <FaCheckCircle className={styles.badgeIcon} /> Onboarded
                </span>
              ) : (
                <span className={`${styles.statusBadge} ${styles.warningBadge}`}>
                  <FaTimesCircle className={styles.badgeIcon} /> Onboarding Pending
                </span>
              )}
            </div>
          </div>
        </div>

        <div className={styles.modalBody}>
          <section className={styles.modalSection}>
            <h3 className={styles.modalSectionTitle}>Account</h3>
            <DetailRow icon={FaIdBadge} label="User UUID" value={user.user_uuid} />
            <DetailRow icon={FaEnvelope} label="Email" value={user.email} />
            <DetailRow icon={FaPhone} label="Phone Number" value={user.phone_number} />
            <DetailRow icon={FaUserTag} label="Account Type" value={user.account_type || user.user_type} />
            <DetailRow icon={FaCoins} label="Current Credits" value={user.current_credits ?? 0} />
            <DetailRow icon={FaClock} label="Signup Date" value={formatDate(user.created_at)} />
          </section>

          <section className={styles.modalSection}>
            <h3 className={styles.modalSectionTitle}>Amazon</h3>
            <DetailRow
              icon={FaAmazon}
              label="Amazon Status"
              value={user.amazon_status ? 'Connected' : 'Not Connected'}
            />
            <DetailRow icon={FaBuilding} label="Store Name" value={user.amazon_store_name} />
            <DetailRow icon={FaIdBadge} label="Seller ID" value={user.amazon_seller_id} />
            <DetailRow label="Product Count" value={user.amazon_product_count ?? 0} />
            <DetailRow icon={FaClock} label="Last Updated" value={formatDate(user.last_updated)} />
          </section>

          <section className={styles.modalSection}>
            <h3 className={styles.modalSectionTitle}>Profile</h3>
            <DetailRow icon={FaBuilding} label="Company" value={user.company_name} />
            <DetailRow icon={FaUserTag} label="Job Title" value={user.job_title} />
            <DetailRow icon={FaMapMarkerAlt} label="Location" value={user.location} />
            <DetailRow label="Experience" value={user.experience} />
            <DetailRow label="Agency Size" value={user.agency_size} />
          </section>

          {isGoogle && (
            <section className={styles.modalSection}>
              <h3 className={styles.modalSectionTitle}>
                <FaGoogle style={{ marginRight: '0.5rem', color: '#ea4335' }} />
                Google Profile
              </h3>
              <DetailRow icon={FaEnvelope} label="Google Email" value={googleProfile.email} />
              <DetailRow label="Google Name" value={googleProfile.name} />
              <DetailRow
                label="Picture"
                value={
                  googleProfile.picture ? (
                    <a href={googleProfile.picture} target="_blank" rel="noopener noreferrer">
                      {googleProfile.picture}
                    </a>
                  ) : 'N/A'
                }
              />
            </section>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserSignups;
