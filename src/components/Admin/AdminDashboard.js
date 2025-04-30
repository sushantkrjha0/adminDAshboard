// src/components/Admin/AdminDashboard.js
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './AdminDashboard.module.css';
import { FaCoins, FaUser, FaSignOutAlt, FaCheck, FaTimes, FaSpinner, FaFilter } from 'react-icons/fa';
import adminService from '../../services/adminService';

const AdminDashboard = () => {
  const [creditRequests, setCreditRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [activeTab, setActiveTab] = useState('pending');
  const [processingRequestId, setProcessingRequestId] = useState(null);
  const [modalData, setModalData] = useState(null);
  const [refreshFlag, setRefreshFlag] = useState(false); // For manual refresh control
  const isFirstRender = useRef(true); // Track if this is the first render
  const navigate = useNavigate();
  
  // Check admin auth on load
  useEffect(() => {
    const userUuid = localStorage.getItem('userUuid');
    if (!userUuid) {
      navigate('/admin/login');
    }
  }, [navigate]);
  
  // Memoize fetchCreditRequests to prevent recreation on each render
  const fetchCreditRequests = useCallback(async (showLoading = true) => {
    console.log(`[fetchCreditRequests] called for tab: ${activeTab}`);
    if (showLoading) {
      setIsLoading(true);
    }
    setError(null);
    
    try {
      // Check if admin is authenticated
      if (!adminService.isAdmin()) {
        navigate('/admin/login');
        return;
      }
      
      // Use admin service to fetch credit requests
      
      console.log("hy !!!")
      const response = await adminService.getCreditRequests(activeTab !== 'all' ? activeTab : null);
      setCreditRequests(response.credit_requests || []);
    } catch (err) {
      console.error("[fetchCreditRequests] Error:", err);
      setError("Failed to fetch credit requests. Please try again later.");
    } finally {
      if (showLoading) {
        setIsLoading(false);
      }
    }
  }, [activeTab, navigate]);
  
  // Effect for tab changes - handles the first load and tab changes
  useEffect(() => {
    // Skip the first automatic run to avoid double fetch in StrictMode
    if (isFirstRender.current) {
      console.log("[useEffect] First render detected, setting up delayed initial fetch");
      isFirstRender.current = false;
      
      // Still fetch data on first mount, but with a small delay
      const timer = setTimeout(() => {
        console.log("[useEffect] Executing delayed initial fetch");
        fetchCreditRequests(true);
      }, 50);
      
      return () => clearTimeout(timer);
    } else {
      console.log("[useEffect] Tab changed, fetching new data");
      fetchCreditRequests(true);
    }
  }, [activeTab, fetchCreditRequests]);
  
  // Effect for manual refresh via refreshFlag
  useEffect(() => {
    // Skip the initial render to avoid duplicate calls
    if (!isFirstRender.current) {
      console.log("[useEffect] Manual refresh triggered");
      fetchCreditRequests(true);
    }
  }, [refreshFlag, fetchCreditRequests]);
  
  const handleApprove = async (userUuid) => {
    setProcessingRequestId(userUuid);
    setError(null);
    setSuccessMessage(null);
    
    try {
      // Use admin service to approve the credit request
      const response = await adminService.approveCreditRequest(userUuid, "Approved by admin");
      
      setSuccessMessage(`Credit request approved successfully. New balance: ${response.new_credit_balance} credits.`);
      
      // Trigger a refresh by toggling refreshFlag
      setRefreshFlag(prev => !prev);
      
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
    // Open the modal for rejection reason
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
      // Use admin service to reject the credit request
      await adminService.rejectCreditRequest(modalData.userUuid, notes);
      
      setSuccessMessage("Credit request rejected successfully.");
      
      // Trigger a refresh by toggling refreshFlag
      setRefreshFlag(prev => !prev);
      
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
  
  const handleLogout = () => {
    localStorage.removeItem('userUuid');
    localStorage.removeItem('adminEmail');
    navigate('/admin/login');
  };
  
  // Format date for display
  const formatDate = (isoDate) => {
    if (!isoDate) return 'N/A';
    const date = new Date(isoDate);
    return date.toLocaleString();
  };
  
  // Get admin email
  const adminEmail = localStorage.getItem('adminEmail') || 'Admin';
  
  return (
    <div className={styles.dashboardContainer}>
      <header className={styles.dashboardHeader}>
        <div className={styles.headerTitle}>
          <h1><FaCoins className={styles.coinIcon} /> Admin Dashboard</h1>
          <p>Manage credit requests and user accounts</p>
        </div>
        <div className={styles.userInfo}>
          <span className={styles.userEmail}>
            <FaUser className={styles.userIcon} /> {adminEmail}
          </span>
          <button 
            onClick={handleLogout} 
            className={styles.logoutButton}
            aria-label="Logout"
          >
            <FaSignOutAlt /> Logout
          </button>
        </div>
      </header>
      
      <div className={styles.mainContent}>
        <div className={styles.tabsContainer}>
          <button 
            className={`${styles.tabButton} ${activeTab === 'pending' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('pending')}
          >
            Pending Requests
          </button>
          <button 
            className={`${styles.tabButton} ${activeTab === 'approved' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('approved')}
          >
            Approved Requests
          </button>
          <button 
            className={`${styles.tabButton} ${activeTab === 'rejected' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('rejected')}
          >
            Rejected Requests
          </button>
          <button 
            className={`${styles.tabButton} ${activeTab === 'all' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('all')}
          >
            All Requests
          </button>
        </div>
        
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
        
        {isLoading ? (
          <div className={styles.loadingContainer}>
            <FaSpinner className={styles.spinner} />
            <p>Loading credit requests...</p>
          </div>
        ) : creditRequests.length === 0 ? (
          <div className={styles.noRequests}>
            <p>No {activeTab !== 'all' ? activeTab : ''} credit requests found.</p>
          </div>
        ) : (
          <div className={styles.requestTable}>
            <table>
              <thead>
                <tr>
                  <th>User</th>
                  <th>Current Credits</th>
                  <th>Requested Credits</th>
                  <th>Requested At</th>
                  <th>Status</th>
                  {activeTab === 'pending' && <th>Actions</th>}
                  {(activeTab === 'approved' || activeTab === 'rejected') && <th>Processed At</th>}
                  {(activeTab === 'approved' || activeTab === 'rejected') && <th>Notes</th>}
                </tr>
              </thead>
              <tbody>
                {creditRequests.map((request) => (
                  <tr key={request.user_uuid} className={styles.requestRow}>
                    <td className={styles.userCell}>
                      <div className={styles.userInfo}>
                        <span className={styles.username}>{request.username}</span>
                        <span className={styles.email}>{request.email}</span>
                      </div>
                    </td>
                    <td>{request.current_credit}</td>
                    <td>{request.requested_credit}</td>
                    <td>{formatDate(request.requested_at)}</td>
                    <td>
                      <span className={`${styles.statusBadge} ${styles[request.status]}`}>
                        {request.status}
                      </span>
                    </td>
                    {activeTab === 'pending' && (
                      <td className={styles.actionCell}>
                        <button
                          onClick={() => handleApprove(request.user_uuid)}
                          className={`${styles.actionButton} ${styles.approveButton}`}
                          disabled={processingRequestId === request.user_uuid}
                        >
                          {processingRequestId === request.user_uuid ? (
                            <FaSpinner className={styles.spinner} />
                          ) : (
                            <FaCheck />
                          )}
                          <span>Approve</span>
                        </button>
                        <button
                          onClick={() => handleReject(request.user_uuid)}
                          className={`${styles.actionButton} ${styles.rejectButton}`}
                          disabled={processingRequestId === request.user_uuid}
                        >
                          {processingRequestId === request.user_uuid ? (
                            <FaSpinner className={styles.spinner} />
                          ) : (
                            <FaTimes />
                          )}
                          <span>Reject</span>
                        </button>
                      </td>
                    )}
                    {(activeTab === 'approved' || activeTab === 'rejected' || activeTab === 'all') && request.processed_at && (
                      <td>{formatDate(request.processed_at)}</td>
                    )}
                    {(activeTab === 'approved' || activeTab === 'rejected' || activeTab === 'all') && (
                      <td>{request.notes || 'No notes'}</td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
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
    onSubmit(notes);
  };
  
  return (
    <form onSubmit={handleSubmit} className={styles.rejectionForm}>
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Enter reason for rejection..."
        className={styles.rejectionInput}
        required
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

export default AdminDashboard;