import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FaUsers, FaSpinner, FaSearch, FaFilter, FaEye, FaEdit, FaTrash, FaTimes, FaCalendar, FaCalendarAlt, FaCalendarCheck, FaBuilding, FaBriefcase, FaMapMarkerAlt, FaClock, FaUsers as FaUsersIcon, FaAmazon, FaCoins, FaEnvelope, FaIdCard, FaChevronDown, FaChevronRight, FaShareAlt, FaComments, FaStar, FaExclamationTriangle, FaPhone } from 'react-icons/fa';
import styles from './UserManagement.module.css';
import adminService from '../../services/adminService';



const UserManagement = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);

  // Get view from search params, default to 'all'
  const currentView = searchParams.get('view') || 'all';

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await adminService.getAllUsers();
      if (response.success) {
        setUsers(response.users || []);
      } else {
        setError('Failed to fetch users');
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to fetch users. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewChange = (view) => {
    setSearchParams({ view });
  };

  // Helper to check if a date is within a period
  const isWithinPeriod = (dateString, period) => {
    if (period === 'all') return true;
    const date = new Date(dateString);
    const now = new Date();

    if (period === 'daily') {
      return date.toDateString() === now.toDateString();
    }

    if (period === 'weekly') {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(now.getDate() - 7);
      return date >= oneWeekAgo;
    }

    if (period === 'monthly') {
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    }

    return true;
  };

  // Helper to count users by period
  const countUsersByPeriod = (period) => {
    return users.filter(user => isWithinPeriod(user.created_at, period)).length;
  };

  // Filter and search users
  const filteredUsers = users.filter(user => {
    const matchesSearch =
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.user_type.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter = filterType === 'all' ||
      (filterType === 'onboarded' && user.onboarding_complete) ||
      (filterType === 'not_onboarded' && !user.onboarding_complete) ||
      (filterType === 'amazon_connected' && user.amazon_status) ||
      (filterType === 'amazon_not_connected' && !user.amazon_status);

    const matchesView = isWithinPeriod(user.created_at, currentView);

    return matchesSearch && matchesFilter && matchesView;
  });

  // Sort users
  const sortedUsers = [...filteredUsers].sort((a, b) => {
    let aValue = a[sortBy];
    let bValue = b[sortBy];

    // Handle date sorting
    if (sortBy === 'created_at' || sortBy === 'last_updated') {
      aValue = new Date(aValue === 'N/A' ? '1970-01-01' : aValue);
      bValue = new Date(bValue === 'N/A' ? '1970-01-01' : bValue);
    }

    // Handle numeric sorting
    if (sortBy === 'current_credits' || sortBy === 'amazon_product_count') {
      aValue = Number(aValue) || 0;
      bValue = Number(bValue) || 0;
    }

    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const formatDate = (dateString) => {
    if (dateString === 'N/A') return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    } catch {
      return dateString;
    }
  };

  const getStatusBadge = (status, type) => {
    if (type === 'onboarding') {
      return (
        <span className={`${styles.statusBadge} ${status ? styles.successBadge : styles.warningBadge}`}>
          {status ? 'Complete' : 'Pending'}
        </span>
      );
    } else if (type === 'amazon') {
      return (
        <span className={`${styles.statusBadge} ${status ? styles.successBadge : styles.warningBadge}`}>
          {status ? 'Connected' : 'Not Connected'}
        </span>
      );
    }
    return null;
  };

  const handleUserClick = (user) => {
    setSelectedUser(user);
    setShowUserModal(true);
  };

  const closeUserModal = () => {
    setShowUserModal(false);
    setSelectedUser(null);
  };



  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <FaSpinner className={styles.spinner} />
        <p>Loading users...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <p>{error}</p>
        <button onClick={fetchUsers} className={styles.retryButton}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerTitle}>
          <FaUsers className={styles.headerIcon} />
          <h1>User Management</h1>
        </div>
        <p className={styles.headerSubtitle}>
          Manage and monitor all user accounts
        </p>
      </div>

      {/* Statistics */}
      <div className={styles.statsContainer}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <FaUsers />
          </div>
          <div className={styles.statContent}>
            <h3>{users.length}</h3>
            <p>Total Users</p>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <FaUsers />
          </div>
          <div className={styles.statContent}>
            <h3>{users.filter(u => u.onboarding_complete).length}</h3>
            <p>Onboarded Users</p>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <FaUsers />
          </div>
          <div className={styles.statContent}>
            <h3>{users.filter(u => u.amazon_status).length}</h3>
            <p>Amazon Connected</p>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <FaUsers />
          </div>
          <div className={styles.statContent}>
            <h3>{users.reduce((sum, u) => sum + (u.current_credits || 0), 0)}</h3>
            <p>Total Credits</p>
          </div>
        </div>


      </div>

      {/* Status Tabs (Period filtering) */}
      <div className={styles.tabsContainer}>
        <button
          className={`${styles.tabButton} ${currentView === 'all' ? styles.activeTab : ''}`}
          onClick={() => handleViewChange('all')}
        >
          <FaUsers className={styles.tabIcon} />
          All Users ({users.length})
        </button>
        <button
          className={`${styles.tabButton} ${currentView === 'daily' ? styles.activeTab : ''}`}
          onClick={() => handleViewChange('daily')}
        >
          <FaCalendar className={styles.tabIcon} />
          Daily ({countUsersByPeriod('daily')})
        </button>
        <button
          className={`${styles.tabButton} ${currentView === 'weekly' ? styles.activeTab : ''}`}
          onClick={() => handleViewChange('weekly')}
        >
          <FaCalendarAlt className={styles.tabIcon} />
          Weekly ({countUsersByPeriod('weekly')})
        </button>
        <button
          className={`${styles.tabButton} ${currentView === 'monthly' ? styles.activeTab : ''}`}
          onClick={() => handleViewChange('monthly')}
        >
          <FaCalendarCheck className={styles.tabIcon} />
          Monthly ({countUsersByPeriod('monthly')})
        </button>
      </div>

      {/* Filters and Search */}
      <div className={styles.controlsContainer}>
        <div className={styles.searchContainer}>
          <FaSearch className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search users by name, email, company..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        <div className={styles.filterContainer}>
          <FaFilter className={styles.filterIcon} />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="all">All Users</option>
            <option value="onboarded">Onboarded</option>
            <option value="not_onboarded">Not Onboarded</option>
            <option value="amazon_connected">Amazon Connected</option>
            <option value="amazon_not_connected">Amazon Not Connected</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className={styles.tableContainer}>
        <table className={styles.usersTable}>
          <thead>
            <tr>
              <th onClick={() => handleSort('username')} className={styles.sortableHeader}>
                Username
                {sortBy === 'username' && (
                  <span className={styles.sortIndicator}>
                    {sortOrder === 'asc' ? '↑' : '↓'}
                  </span>
                )}
              </th>
              <th onClick={() => handleSort('created_at')} className={styles.sortableHeader}>
                Created At
                {sortBy === 'created_at' && (
                  <span className={styles.sortIndicator}>
                    {sortOrder === 'asc' ? '↑' : '↓'}
                  </span>
                )}
              </th>
              <th onClick={() => handleSort('user_type')} className={styles.sortableHeader}>
                User Type
                {sortBy === 'user_type' && (
                  <span className={styles.sortIndicator}>
                    {sortOrder === 'asc' ? '↑' : '↓'}
                  </span>
                )}
              </th>
              <th onClick={() => handleSort('company_name')} className={styles.sortableHeader}>
                Company
                {sortBy === 'company_name' && (
                  <span className={styles.sortIndicator}>
                    {sortOrder === 'asc' ? '↑' : '↓'}
                  </span>
                )}
              </th>
              <th>Phone Number</th>
              <th onClick={() => handleSort('current_credits')} className={styles.sortableHeader}>
                Credits
                {sortBy === 'current_credits' && (
                  <span className={styles.sortIndicator}>
                    {sortOrder === 'asc' ? '↑' : '↓'}
                  </span>
                )}
              </th>
              <th>Onboarding</th>
              <th>Amazon Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedUsers.map((user) => (
              <tr
                key={user.user_uuid}
                className={styles.userRow}
                onClick={() => handleUserClick(user)}
                style={{ cursor: 'pointer' }}
              >
                <td className={styles.userCell}>
                  <div className={styles.userInfo}>
                    <span className={styles.username}>{user.username}</span>
                    <span className={styles.userEmail}>{user.email}</span>
                    <span className={styles.userId}>ID: {user.user_uuid}</span>
                  </div>
                </td>
                <td>{formatDate(user.created_at)}</td>
                <td>
                  <span className={styles.userType}>{user.user_type}</span>
                </td>
                <td>
                  <div className={styles.companyInfo}>
                    <span className={styles.companyName}>{user.company_name}</span>
                    {user.job_title !== 'N/A' && (
                      <span className={styles.jobTitle}>{user.job_title}</span>
                    )}
                  </div>
                </td>
                <td>
                  <span className={styles.phoneNumber}>
                    {user.phone_number}
                  </span>
                </td>
                <td>
                  <span className={styles.creditBadge}>
                    {user.current_credits} credits
                  </span>
                </td>
                <td>
                  {getStatusBadge(user.onboarding_complete, 'onboarding')}
                </td>
                <td>
                  <div className={styles.amazonInfo}>
                    {getStatusBadge(user.amazon_status, 'amazon')}
                    {user.amazon_status && (
                      <div className={styles.amazonDetails}>
                        <small>{user.amazon_store_name}</small>
                        <small>{user.amazon_product_count} products</small>
                      </div>
                    )}
                  </div>
                </td>
                <td className={styles.actionCell}>
                  <button className={styles.actionButton} title="View Details">
                    <FaEye />
                  </button>
                  <button className={styles.actionButton} title="Edit User">
                    <FaEdit />
                  </button>
                  <button className={styles.actionButton} title="Delete User">
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {sortedUsers.length === 0 && (
          <div className={styles.emptyState}>
            <FaUsers className={styles.emptyIcon} />
            <p>No users found matching your criteria.</p>
          </div>
        )}
      </div>





      {/* User Details Modal */}
      {showUserModal && selectedUser && (
        <div className={styles.modalOverlay} onClick={closeUserModal}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>User Details</h2>
              <button className={styles.closeButton} onClick={closeUserModal}>
                <FaTimes />
              </button>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.userDetailsGrid}>
                {/* Basic Information */}
                <div className={styles.detailSection}>
                  <h3 className={styles.sectionTitle}>
                    <FaIdCard className={styles.sectionIcon} />
                    Basic Information
                  </h3>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Username:</span>
                    <span className={styles.detailValue}>{selectedUser.username}</span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Email:</span>
                    <span className={styles.detailValue}>{selectedUser.email}</span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>User ID:</span>
                    <span className={`${styles.detailValue} ${styles.userIdValue}`}>{selectedUser.user_uuid}</span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Created At:</span>
                    <span className={styles.detailValue}>
                      <FaCalendar className={styles.inlineIcon} />
                      {formatDate(selectedUser.created_at)}
                    </span>
                  </div>
                </div>

                {/* Onboarding Details */}
                <div className={styles.detailSection}>
                  <h3 className={styles.sectionTitle}>
                    <FaBuilding className={styles.sectionIcon} />
                    Onboarding Details
                  </h3>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Status:</span>
                    <span className={styles.detailValue}>
                      {getStatusBadge(selectedUser.onboarding_complete, 'onboarding')}
                    </span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>User Type:</span>
                    <span className={styles.detailValue}>
                      <FaUsersIcon className={styles.inlineIcon} />
                      {selectedUser.user_type}
                    </span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Company:</span>
                    <span className={styles.detailValue}>
                      <FaBuilding className={styles.inlineIcon} />
                      {selectedUser.company_name}
                    </span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Job Title:</span>
                    <span className={styles.detailValue}>
                      <FaBriefcase className={styles.inlineIcon} />
                      {selectedUser.job_title}
                    </span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Location:</span>
                    <span className={styles.detailValue}>
                      <FaMapMarkerAlt className={styles.inlineIcon} />
                      {selectedUser.location}
                    </span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Experience:</span>
                    <span className={styles.detailValue}>
                      <FaClock className={styles.inlineIcon} />
                      {selectedUser.experience}
                    </span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Phone Number:</span>
                    <span className={styles.detailValue}>
                      <FaPhone className={styles.inlineIcon} />
                      {selectedUser.phone_number}
                    </span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Agency Size:</span>
                    <span className={styles.detailValue}>
                      <FaUsersIcon className={styles.inlineIcon} />
                      {selectedUser.agency_size}
                    </span>
                  </div>
                </div>

                {/* Amazon Integration */}
                <div className={styles.detailSection}>
                  <h3 className={styles.sectionTitle}>
                    <FaAmazon className={styles.sectionIcon} />
                    Amazon Integration
                  </h3>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Status:</span>
                    <span className={styles.detailValue}>
                      {getStatusBadge(selectedUser.amazon_status, 'amazon')}
                    </span>
                  </div>
                  {selectedUser.amazon_status && (
                    <>
                      <div className={styles.detailRow}>
                        <span className={styles.detailLabel}>Store Name:</span>
                        <span className={styles.detailValue}>{selectedUser.amazon_store_name}</span>
                      </div>
                      <div className={styles.detailRow}>
                        <span className={styles.detailLabel}>Seller ID:</span>
                        <span className={styles.detailValue}>{selectedUser.amazon_seller_id}</span>
                      </div>
                      <div className={styles.detailRow}>
                        <span className={styles.detailLabel}>Product Count:</span>
                        <span className={styles.detailValue}>{selectedUser.amazon_product_count} products</span>
                      </div>
                      <div className={styles.detailRow}>
                        <span className={styles.detailLabel}>Last Updated:</span>
                        <span className={styles.detailValue}>
                          <FaClock className={styles.inlineIcon} />
                          {formatDate(selectedUser.last_updated)}
                        </span>
                      </div>
                    </>
                  )}
                </div>

                {/* Credits and Activity */}
                <div className={styles.detailSection}>
                  <h3 className={styles.sectionTitle}>
                    <FaCoins className={styles.sectionIcon} />
                    Credits & Activity
                  </h3>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Current Credits:</span>
                    <span className={styles.detailValue}>
                      <FaCoins className={styles.inlineIcon} />
                      <span className={styles.creditAmount}>{selectedUser.current_credits}</span> credits
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button className={styles.modalButton} onClick={closeUserModal}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement; 