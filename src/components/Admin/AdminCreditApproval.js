import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaCoins, FaCheck, FaTimes, FaSpinner } from 'react-icons/fa';
import styles from './AdminCreditApproval.css';

const AdminCreditApproval = () => {
  const [creditRequests, setCreditRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('pending');
  const [processingIds, setProcessingIds] = useState([]);

  // Fetch credit requests on component mount
  useEffect(() => {
    fetchCreditRequests();
  }, [activeTab]);

  // Function to get API URL
  const getApiUrl = () => {
    // Import the centralized API config
    const { getApiBaseUrl } = require('../../utils/apiConfig');
    return getApiBaseUrl();
  };

  // Function to fetch credit requests based on tab/status
  const fetchCreditRequests = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Get the stored admin token
      const storedToken = localStorage.getItem('adminToken');
      // Get the stored UUID
      const userUuid = localStorage.getItem('userUuid');
      
      if (!storedToken || !userUuid) {
        setError("Authentication error. Please log in again.");
        return;
      }
      
      const API_URL = getApiUrl();
      console.log("test !!!!")
      
      // Add status filter if not viewing all requests
      const statusFilter = activeTab !== 'all' ? `?status=${activeTab}` : '';
      console.log("test !!!!")
      const response = await axios.get(
        `${API_URL}/auth/credit_requests${statusFilter}`,
        {
          headers: {
            'X-User-UUID': userUuid,
            'Content-Type': 'application/json'
          }
        }
      );
      
      setCreditRequests(response.data.credit_requests || []);
    } catch (err) {
      console.error("Error fetching credit requests:", err);
      setError("Failed to fetch credit requests. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Function to handle credit request approval
  const handleApprove = async (userId, requestId) => {
    if (!userId || !requestId) {
      console.error("Invalid user ID or request ID:", { userId, requestId });
      setError("Invalid user ID or request ID. Cannot process request.");
      return;
    }
    
    // Add user ID to processing list
    setProcessingIds(prev => [...prev, userId]);
    
    try {
      // Get the stored admin token
      const storedToken = localStorage.getItem('adminToken');
      // Get the stored UUID
      const userUuid = localStorage.getItem('userUuid');
      
      if (!storedToken || !userUuid) {
        setError("Authentication error. Please log in again.");
        return;
      }
      
      const API_URL = getApiUrl();
      
      await axios.post(
        `${API_URL}/auth/credit_requests/${requestId}/approve`,
        { notes: "Approved by admin" },
        {
          headers: {
            'X-User-UUID': userUuid,
            'Content-Type': 'application/json'
          }
        }
      );
      
      // Refresh the list after approval
      fetchCreditRequests();
    } catch (err) {
      console.error("Error approving request:", err);
      setError("Failed to approve credit request. Please try again.");
    } finally {
      // Remove user ID from processing list
      setProcessingIds(prev => prev.filter(id => id !== userId));
    }
  };

  // Function to handle credit request rejection
  const handleReject = async (userId, requestId) => {
    if (!userId || !requestId) {
      console.error("Invalid user ID or request ID:", { userId, requestId });
      setError("Invalid user ID or request ID. Cannot process request.");
      return;
    }
    
    // Add user ID to processing list
    setProcessingIds(prev => [...prev, userId]);
    
    try {
      // Get the stored admin token
      const storedToken = localStorage.getItem('adminToken');
      // Get the stored UUID
      const userUuid = localStorage.getItem('userUuid');
      
      if (!storedToken || !userUuid) {
        setError("Authentication error. Please log in again.");
        return;
      }
      
      const API_URL = getApiUrl();
      
      await axios.post(
        `${API_URL}/auth/credit_requests/${requestId}/reject`,
        { notes: "Rejected by admin" },
        {
          headers: {
            'X-User-UUID': userUuid,
            'Content-Type': 'application/json'
          }
        }
      );
      
      // Refresh the list after rejection
      fetchCreditRequests();
    } catch (err) {
      console.error("Error rejecting request:", err);
      setError("Failed to reject credit request. Please try again.");
    } finally {
      // Remove user ID from processing list
      setProcessingIds(prev => prev.filter(id => id !== userId));
    }
  };

  // Format date for display
  const formatDate = (isoDate) => {
    if (!isoDate) return 'N/A';
    const date = new Date(isoDate);
    return date.toLocaleString();
  };

  // Render tabs for filtering credit requests
  const renderTabs = () => (
    <div className={styles.tabContainer}>
      <button 
        className={`${styles.tab} ${activeTab === 'pending' ? styles.activeTab : ''}`}
        onClick={() => setActiveTab('pending')}
      >
        Pending Requests
      </button>
      <button 
        className={`${styles.tab} ${activeTab === 'approved' ? styles.activeTab : ''}`}
        onClick={() => setActiveTab('approved')}
      >
        Approved Requests
      </button>
      <button 
        className={`${styles.tab} ${activeTab === 'rejected' ? styles.activeTab : ''}`}
        onClick={() => setActiveTab('rejected')}
      >
        Rejected Requests
      </button>
      <button 
        className={`${styles.tab} ${activeTab === 'all' ? styles.activeTab : ''}`}
        onClick={() => setActiveTab('all')}
      >
        All Requests
      </button>
    </div>
  );

  // Render credit request table with proper actions
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>
        <FaCoins className={styles.titleIcon} /> 
        Credit Request Management
      </h1>
      
      {renderTabs()}
      
      {error && (
        <div className={styles.errorMessage}>
          {error}
        </div>
      )}
      
      {isLoading ? (
        <div className={styles.loadingContainer}>
          <FaSpinner className={styles.spinner} />
          <p>Loading credit requests...</p>
        </div>
      ) : creditRequests.length === 0 ? (
        <div className={styles.emptyState}>
          <p>No {activeTab !== 'all' ? activeTab : ''} credit requests found.</p>
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
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {creditRequests.map((request) => (
                <tr key={request.user_uuid} className={styles.requestRow}>
                  <td>{request.username || 'Unknown'}</td>
                  <td>{request.current_credit}</td>
                  <td>{request.requested_credit}</td>
                  <td>{formatDate(request.requested_at)}</td>
                  <td>
                    <span className={`${styles.status} ${styles[request.status]}`}>
                      {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                    </span>
                  </td>
                  <td>
                    {request.status === 'pending' ? (
                      <div className={styles.actionButtons}>
                        <button
                          onClick={() => handleApprove(request.user_uuid, request._id)}
                          className={`${styles.actionButton} ${styles.approveButton}`}
                          disabled={processingIds.includes(request.user_uuid)}
                        >
                          {processingIds.includes(request.user_uuid) ? (
                            <FaSpinner className={styles.spinnerSmall} />
                          ) : (
                            <><FaCheck /> Approve</>
                          )}
                        </button>
                        <button
                          onClick={() => handleReject(request.user_uuid, request._id)}
                          className={`${styles.actionButton} ${styles.rejectButton}`}
                          disabled={processingIds.includes(request.user_uuid)}
                        >
                          {processingIds.includes(request.user_uuid) ? (
                            <FaSpinner className={styles.spinnerSmall} />
                          ) : (
                            <><FaTimes /> Reject</>
                          )}
                        </button>
                      </div>
                    ) : (
                      <div className={styles.processedInfo}>
                        <p>Processed: {formatDate(request.processed_at)}</p>
                        {request.notes && <p>Notes: {request.notes}</p>}
                      </div>
                    )}
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

export default AdminCreditApproval;