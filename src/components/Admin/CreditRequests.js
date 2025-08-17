import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FaCoins, FaCheck, FaTimes, FaSpinner, FaFilter, FaEye } from 'react-icons/fa';
import styles from './CreditRequests.module.css';
import adminService from '../../services/adminService';

const CreditRequests = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [creditRequests, setCreditRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [processingRequestId, setProcessingRequestId] = useState(null);
  const [modalData, setModalData] = useState(null);
  const [stats, setStats] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
    total: 0
  });

  // Get status from URL params, default to 'pending'
  const currentStatus = searchParams.get('status') || 'pending';

  // Fetch credit requests when component mounts or status changes
  useEffect(() => {
    fetchCreditRequests();
  }, [currentStatus]);

  const fetchCreditRequests = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await adminService.getCreditRequests(currentStatus !== 'all' ? currentStatus : null);
      setCreditRequests(response.credit_requests || []);
      
      // Calculate stats
      const allRequests = await adminService.getCreditRequests('all');
      const allData = allRequests.credit_requests || [];
      
      setStats({
        pending: allData.filter(req => req.status === 'pending').length,
        approved: allData.filter(req => req.status === 'approved').length,
        rejected: allData.filter(req => req.status === 'rejected').length,
        total: allData.length
      });
    } catch (err) {
      console.error("Error fetching credit requests:", err);
      setError("Failed to fetch credit requests. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  }, [currentStatus]);

  const handleStatusChange = (status) => {
    setSearchParams({ status });
  };

  const handleApprove = async (userUuid) => {
    setProcessingRequestId(userUuid);
    setError(null);
    setSuccessMessage(null);
    
    try {
      const response = await adminService.approveCreditRequest(userUuid, "Approved by admin");
      
      setSuccessMessage(`Credit request approved successfully. New balance: ${response.new_credit_balance} credits.`);
      
      // Refresh the data
      fetchCreditRequests();
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (err) {
      console.error("Error approving credit request:", err);
      setError(err.response?.data?.message || "Failed to approve credit request. Please try again later.");
    } finally {
      setProcessingRequestId(null);
    }
  };

  const handleReject = async (userUuid) => {
    setModalData({
      userUuid,
      action: 'reject',
      title: 'Reject Credit Request',
      message: 'Please provide a reason for rejecting this credit request:',
    });
  };

  const handleRejectConfirm = async (notes) => {
    if (!modalData) return;
    
    setProcessingRequestId(modalData.userUuid);
    setModalData(null);
    setError(null);
    setSuccessMessage(null);
    
    try {
      await adminService.rejectCreditRequest(modalData.userUuid, notes);
      
      setSuccessMessage("Credit request rejected successfully.");
      
      // Refresh the data
      fetchCreditRequests();
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (err) {
      console.error("Error rejecting credit request:", err);
      setError(err.response?.data?.message || "Failed to reject credit request. Please try again later.");
    } finally {
      setProcessingRequestId(null);
    }
  };

  const formatDate = (isoDate) => {
    if (!isoDate) return 'N/A';
    const date = new Date(isoDate);
    return date.toLocaleString();
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'pending':
        return styles.pendingBadge;
      case 'approved':
        return styles.approvedBadge;
      case 'rejected':
        return styles.rejectedBadge;
      default:
        return styles.defaultBadge;
    }
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerTitle}>
          <FaCoins className={styles.headerIcon} />
          <h1>Credit Request Management</h1>
        </div>
        <p className={styles.headerSubtitle}>
          Manage user credit requests and approvals
        </p>
      </div>

      {/* Statistics Cards */}
      <div className={styles.statsContainer}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <FaCoins />
          </div>
          <div className={styles.statContent}>
            <h3>{stats.total}</h3>
            <p>Total Requests</p>
          </div>
        </div>
        
        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.pendingIcon}`}>
            <FaSpinner />
          </div>
          <div className={styles.statContent}>
            <h3>{stats.pending}</h3>
            <p>Pending</p>
          </div>
        </div>
        
        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.approvedIcon}`}>
            <FaCheck />
          </div>
          <div className={styles.statContent}>
            <h3>{stats.approved}</h3>
            <p>Approved</p>
          </div>
        </div>
        
        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.rejectedIcon}`}>
            <FaTimes />
          </div>
          <div className={styles.statContent}>
            <h3>{stats.rejected}</h3>
            <p>Rejected</p>
          </div>
        </div>
      </div>

      {/* Status Tabs */}
      <div className={styles.tabsContainer}>
        <button 
          className={`${styles.tabButton} ${currentStatus === 'pending' ? styles.activeTab : ''}`}
          onClick={() => handleStatusChange('pending')}
        >
          <FaSpinner className={styles.tabIcon} />
          Pending Requests ({stats.pending})
        </button>
        <button 
          className={`${styles.tabButton} ${currentStatus === 'approved' ? styles.activeTab : ''}`}
          onClick={() => handleStatusChange('approved')}
        >
          <FaCheck className={styles.tabIcon} />
          Approved Requests ({stats.approved})
        </button>
        <button 
          className={`${styles.tabButton} ${currentStatus === 'rejected' ? styles.activeTab : ''}`}
          onClick={() => handleStatusChange('rejected')}
        >
          <FaTimes className={styles.tabIcon} />
          Rejected Requests ({stats.rejected})
        </button>
        <button 
          className={`${styles.tabButton} ${currentStatus === 'all' ? styles.activeTab : ''}`}
          onClick={() => handleStatusChange('all')}
        >
          <FaFilter className={styles.tabIcon} />
          All Requests ({stats.total})
        </button>
      </div>

      {/* Messages */}
      {error && (
        <div className={styles.errorMessage}>
          {error}
        </div>
      )}
      
      {successMessage && (
        <div className={styles.successMessage}>
          {successMessage}
        </div>
      )}

      {/* Content */}
      {isLoading ? (
        <div className={styles.loadingContainer}>
          <FaSpinner className={styles.spinner} />
          <p>Loading credit requests...</p>
        </div>
      ) : creditRequests.length === 0 ? (
        <div className={styles.emptyState}>
          <FaCoins className={styles.emptyIcon} />
          <p>No {currentStatus !== 'all' ? currentStatus : ''} credit requests found.</p>
        </div>
      ) : (
        <div className={styles.tableContainer}>
          <table className={styles.requestTable}>
            <thead>
              <tr>
                <th>User</th>
                <th>Current Credits</th>
                <th>Requested Credits</th>
                <th>Requested At</th>
                <th>Status</th>
                {currentStatus === 'pending' && <th>Actions</th>}
                {(currentStatus === 'approved' || currentStatus === 'rejected' || currentStatus === 'all') && (
                  <>
                    <th>Processed At</th>
                    <th>Notes</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {creditRequests.map((request) => (
                <tr key={request.user_uuid} className={styles.requestRow}>
                  <td className={styles.userCell}>
                    <div className={styles.userInfo}>
                      <span className={styles.username}>{request.username || 'Unknown'}</span>
                      <span className={styles.userId}>ID: {request.user_uuid}</span>
                    </div>
                  </td>
                  <td className={styles.creditCell}>
                    <span className={styles.currentCredit}>{request.current_credit}</span>
                  </td>
                  <td className={styles.creditCell}>
                    <span className={styles.requestedCredit}>+{request.requested_credit}</span>
                  </td>
                  <td>{formatDate(request.requested_at)}</td>
                  <td>
                    <span className={`${styles.statusBadge} ${getStatusBadgeClass(request.status)}`}>
                      {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                    </span>
                  </td>
                  
                  {currentStatus === 'pending' && (
                    <td className={styles.actionCell}>
                      <button
                        onClick={() => handleApprove(request.user_uuid)}
                        className={`${styles.actionButton} ${styles.approveButton}`}
                        disabled={processingRequestId === request.user_uuid}
                        title="Approve request"
                      >
                        {processingRequestId === request.user_uuid ? (
                          <FaSpinner className={styles.spinnerSmall} />
                        ) : (
                          <FaCheck />
                        )}
                        <span>Approve</span>
                      </button>
                      <button
                        onClick={() => handleReject(request.user_uuid)}
                        className={`${styles.actionButton} ${styles.rejectButton}`}
                        disabled={processingRequestId === request.user_uuid}
                        title="Reject request"
                      >
                        {processingRequestId === request.user_uuid ? (
                          <FaSpinner className={styles.spinnerSmall} />
                        ) : (
                          <FaTimes />
                        )}
                        <span>Reject</span>
                      </button>
                    </td>
                  )}
                  
                  {(currentStatus === 'approved' || currentStatus === 'rejected' || currentStatus === 'all') && (
                    <>
                      <td>{formatDate(request.processed_at)}</td>
                      <td className={styles.notesCell}>
                        {request.notes || 'No notes'}
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Rejection Modal */}
      {modalData && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2>{modalData.title}</h2>
              <button 
                className={styles.closeButton}
                onClick={() => setModalData(null)}
              >
                <FaTimes />
              </button>
            </div>
            <div className={styles.modalBody}>
              <p>{modalData.message}</p>
              <RejectionForm onSubmit={handleRejectConfirm} onCancel={() => setModalData(null)} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Component for rejection reason form
const RejectionForm = ({ onSubmit, onCancel }) => {
  const [notes, setNotes] = useState('');
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (notes.trim()) {
      onSubmit(notes);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className={styles.rejectionForm}>
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Enter reason for rejection..."
        className={styles.rejectionInput}
        required
        rows={4}
      />
      <div className={styles.formActions}>
        <button type="button" onClick={onCancel} className={styles.cancelButton}>
          Cancel
        </button>
        <button type="submit" className={styles.confirmButton}>
          Confirm Rejection
        </button>
      </div>
    </form>
  );
};

export default CreditRequests; 