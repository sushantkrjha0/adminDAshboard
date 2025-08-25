import React, { useState, useEffect } from 'react';
import { FaShareAlt, FaEnvelope, FaPhone } from 'react-icons/fa';
import styles from './Referrals.module.css';
import adminService from '../../services/adminService';

const Referrals = () => {
  const [referrals, setReferrals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchReferrals();
  }, []);

  const fetchReferrals = async () => {
    try {
      setIsLoading(true);
      console.log('Fetching referrals from API...'); // Debug log
      const response = await adminService.getAllReferrals();
      console.log('Referrals response:', response); // Debug log
      console.log('Referrals data:', response.referrals); // Debug log
      if (response.referrals && response.referrals.length > 0) {
        console.log('First referral item:', response.referrals[0]); // Debug log
      }
      setReferrals(response.referrals || []);
    } catch (err) {
      console.error("Error fetching referrals:", err);
      console.error("Error details:", {
        message: err.message,
        stack: err.stack,
        name: err.name
      });
      setError(`Failed to load referrals data: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString || dateString === 'N/A') return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return dateString;
    }
  };

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading referrals...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <p>{error}</p>
        <button onClick={fetchReferrals} className={styles.retryButton}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>User Referrals</h1>
        <p>Total Referrals: {referrals.length}</p>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.referralsTable}>
          <thead>
            <tr>
              <th>Referrer</th>
              <th>Referred Email</th>
              <th>Referred Phone</th>
              <th>Status</th>
              <th>Created</th>
              <th>Processed</th>
              <th>Bonus Credits</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            {referrals.length === 0 ? (
              <tr>
                <td colSpan="8" className={styles.emptyRow}>
                  <div className={styles.emptyState}>
                    <FaShareAlt className={styles.emptyIcon} />
                    <p>No referrals found</p>
                  </div>
                </td>
              </tr>
            ) : (
              referrals.map((item) => (
                <tr key={item.referral_id} className={styles.tableRow}>
                  <td>
                    <div className={styles.userCell}>
                      <strong>{item.referrer_name || 'Unknown User'}</strong>
                      <span className={styles.userId}>{item.referrer_uuid}</span>
                    </div>
                  </td>
                  <td>
                    {item.referred_email ? (
                      <div className={styles.contactCell}>
                        <FaEnvelope className={styles.contactIcon} />
                        <span>{item.referred_email}</span>
                      </div>
                    ) : (
                      <span>-</span>
                    )}
                  </td>
                  <td>
                    {item.referred_phone ? (
                      <div className={styles.contactCell}>
                        <FaPhone className={styles.contactIcon} />
                        <span>{item.referred_phone}</span>
                      </div>
                    ) : (
                      <span>-</span>
                    )}
                  </td>
                  <td>
                    <span className={`${styles.status} ${styles[`status${item.status.charAt(0).toUpperCase() + item.status.slice(1)}`]}`}>
                      {item.status.toUpperCase()}
                    </span>
                  </td>
                  <td>{formatDate(item.created_at)}</td>
                  <td>{formatDate(item.processed_at)}</td>
                  <td>
                    {item.bonus_credits > 0 ? (
                      <span className={styles.bonusCredits}>{item.bonus_credits}</span>
                    ) : (
                      <span>-</span>
                    )}
                  </td>
                  <td>
                    {item.notes ? (
                      <div className={styles.notesCell}>
                        {item.notes}
                      </div>
                    ) : (
                      <span>-</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Referrals; 