// src/components/Admin/AdminDashboard.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './AdminDashboard.module.css';
import { FaCoins, FaUser, FaSignOutAlt, FaCheck, FaTimes, FaSpinner, FaSync, FaFilter } from 'react-icons/fa';
import adminService from '../../services/adminService';

const AdminDashboard = () => {
  const [creditRequests, setCreditRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [activeTab, setActiveTab] = useState('pending');
  const [processingRequestId, setProcessingRequestId] = useState(null);
  const [modalData, setModalData] = useState(null);
  const navigate = useNavigate();
  
  // Check admin auth on load
  useEffect(() => {
    const adminToken = localStorage.getItem('adminToken');
    if (!adminToken) {
      navigate('/admin/login');
    }
  }, [navigate]);
  
  // Fetch credit requests on load and when tab changes
  useEffect(() => {
    fetchCreditRequests();
    
    // Set up auto-refresh every 30 seconds for pending requests
    let intervalId;
    if (activeTab === 'pending') {
      intervalId = setInterval(() => {
        fetchCreditRequests(false); // Silent refresh
      }, 30000);
    }
    
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [activeTab]);
  
  const fetchCreditRequests = async (showLoading = true) => {
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
      console.log("HY before!!")
      const response = await adminService.getCreditRequests(activeTab !== 'all' ? activeTab : null);
      console.log("HY !!")
      setCreditRequests(response.credit_requests || []);
    } catch (err) {
      console.error("Error fetching credit requests:", err);
      setError("Failed to fetch credit requests. Please try again later.");
    } finally {
      if (showLoading) {
        setIsLoading(false);
      }
    }
  };
  
  const handleApprove = async (userId) => {
    setProcessingRequestId(userId);
    setError(null);
    setSuccessMessage(null);
    
    try {
      // Use admin service to approve the credit request
      const response = await adminService.approveCreditRequest(userId, "Approved by admin");
      
      setSuccessMessage(`Credit request approved successfully. New balance: ${response.new_credit_balance} credits.`);
      
      // Refresh the list after approval
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
  
  const handleReject = async (userId) => {
    // Open the modal for rejection reason
    setModalData({
      userId,
      action: 'reject',
      title: 'Reject Credit Request',
      message: 'Please provide a reason for rejecting this credit request:',
    });
  };
  
  const handleRejectConfirm = async (notes) => {
    if (!modalData) return;
    
    setProcessingRequestId(modalData.userId);
    setModalData(null);
    setError(null);
    setSuccessMessage(null);
    
    try {
      // Use admin service to reject the credit request
      await adminService.rejectCreditRequest(modalData.userId, notes);
      
      setSuccessMessage("Credit request rejected successfully.");
      
      // Refresh the list after rejection
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
  
  const handleLogout = () => {
    localStorage.removeItem('adminToken');
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
                  <tr key={request._id} className={styles.requestRow}>
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
                          onClick={() => handleApprove(request._id)}
                          className={`${styles.actionButton} ${styles.approveButton}`}
                          disabled={processingRequestId === request._id}
                        >
                          {processingRequestId === request._id ? (
                            <FaSpinner className={styles.spinner} />
                          ) : (
                            <FaCheck />
                          )}
                          <span>Approve</span>
                        </button>
                        <button
                          onClick={() => handleReject(request._id)}
                          className={`${styles.actionButton} ${styles.rejectButton}`}
                          disabled={processingRequestId === request._id}
                        >
                          {processingRequestId === request._id ? (
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