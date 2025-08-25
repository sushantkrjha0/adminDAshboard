import React, { useState, useEffect } from 'react';
import { FaCommentDots, FaStar } from 'react-icons/fa';
import styles from './Feedback.module.css';
import adminService from '../../services/adminService';

const Feedback = () => {
  const [feedback, setFeedback] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchFeedback();
  }, []);

  const fetchFeedback = async () => {
    try {
      setIsLoading(true);
      console.log('Fetching feedback from API...'); // Debug log
      const response = await adminService.getAllFeedback();
      console.log('Feedback response:', response); // Debug log
      console.log('Feedback data:', response.feedback); // Debug log
      if (response.feedback && response.feedback.length > 0) {
        console.log('First feedback item:', response.feedback[0]); // Debug log
      }
      setFeedback(response.feedback || []);
    } catch (err) {
      console.error("Error fetching feedback:", err);
      console.error("Error details:", {
        message: err.message,
        stack: err.stack,
        name: err.name
      });
      setError(`Failed to load feedback data: ${err.message}`);
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

  const calculateAverageRating = (feedbackObj) => {
    if (!feedbackObj) return 0;
    
    const ratings = [
      feedbackObj.rating_description || 0,
      feedbackObj.rating_title_bullets || 0,
      feedbackObj.rating_infographics || 0
    ];
    
    const validRatings = ratings.filter(rating => rating > 0);
    if (validRatings.length === 0) return 0;
    
    return Math.round(validRatings.reduce((sum, rating) => sum + rating, 0) / validRatings.length);
  };

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading feedback...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <p>{error}</p>
        <button onClick={fetchFeedback} className={styles.retryButton}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>User Feedback</h1>
        <p>Total Feedback: {feedback.length}</p>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.feedbackTable}>
          <thead>
            <tr>
              <th>User</th>
              <th>Rating</th>
              <th>Description Rating</th>
              <th>Title Bullets Rating</th>
              <th>Infographics Rating</th>
              <th>Would Refer</th>
              <th>Improvement Suggestion</th>
              <th>General Comment</th>
              <th>Submitted</th>
            </tr>
          </thead>
          <tbody>
            {feedback.length === 0 ? (
              <tr>
                <td colSpan="9" className={styles.emptyRow}>
                  <div className={styles.emptyState}>
                    <FaCommentDots className={styles.emptyIcon} />
                    <p>No feedback found</p>
                  </div>
                </td>
              </tr>
            ) : (
              feedback.map((item) => {
                const avgRating = calculateAverageRating(item.feedback);
                return (
                  <tr key={item._id || item.feedback_id} className={styles.tableRow}>
                    <td>
                      <div className={styles.userCell}>
                        <strong>{item.name || 'Unknown User'}</strong>
                        <span className={styles.userId}>{item.uuid}</span>
                      </div>
                    </td>
                    <td>
                      {avgRating > 0 ? (
                        <div className={styles.rating}>
                          {[...Array(5)].map((_, i) => (
                            <FaStar 
                              key={i} 
                              className={i < avgRating ? styles.starFilled : styles.starEmpty} 
                            />
                          ))}
                          <span className={styles.ratingValue}>({avgRating}/5)</span>
                        </div>
                      ) : (
                        <span>No rating</span>
                      )}
                    </td>
                    <td>
                      {item.feedback?.rating_description ? (
                        <div className={styles.rating}>
                          {[...Array(5)].map((_, i) => (
                            <FaStar 
                              key={i} 
                              className={i < item.feedback.rating_description ? styles.starFilled : styles.starEmpty} 
                            />
                          ))}
                          <span className={styles.ratingValue}>({item.feedback.rating_description}/5)</span>
                        </div>
                      ) : (
                        <span>-</span>
                      )}
                    </td>
                    <td>
                      {item.feedback?.rating_title_bullets ? (
                        <div className={styles.rating}>
                          {[...Array(5)].map((_, i) => (
                            <FaStar 
                              key={i} 
                              className={i < item.feedback.rating_title_bullets ? styles.starFilled : styles.starEmpty} 
                            />
                          ))}
                          <span className={styles.ratingValue}>({item.feedback.rating_title_bullets}/5)</span>
                        </div>
                      ) : (
                        <span>-</span>
                      )}
                    </td>
                    <td>
                      {item.feedback?.rating_infographics ? (
                        <div className={styles.rating}>
                          {[...Array(5)].map((_, i) => (
                            <FaStar 
                              key={i} 
                              className={i < item.feedback.rating_infographics ? styles.starFilled : styles.starEmpty} 
                            />
                          ))}
                          <span className={styles.ratingValue}>({item.feedback.rating_infographics}/5)</span>
                        </div>
                      ) : (
                        <span>-</span>
                      )}
                    </td>
                    <td>
                      <span className={`${styles.referralStatus} ${item.feedback?.would_refer === 'yes' ? styles.wouldRefer : styles.wouldNotRefer}`}>
                        {item.feedback?.would_refer === 'yes' ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td>
                      {item.feedback?.improvement_suggestion ? (
                        <div className={styles.textCell}>
                          {item.feedback.improvement_suggestion}
                        </div>
                      ) : (
                        <span>-</span>
                      )}
                    </td>
                    <td>
                      {item.feedback?.general_comment ? (
                        <div className={styles.textCell}>
                          {item.feedback.general_comment}
                        </div>
                      ) : (
                        <span>-</span>
                      )}
                    </td>
                    <td>{formatDate(item.submitted_at)}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Feedback; 