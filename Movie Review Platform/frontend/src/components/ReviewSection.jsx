import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { getMovieReviews, createReview, updateReview, deleteReview, likeReview } from '../services/reviewService';
import { Star, ThumbsUp, Edit2, Trash2 } from 'lucide-react';

const ReviewSection = ({ movieId, movieTitle }) => {
  const { user } = useContext(AuthContext);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newReview, setNewReview] = useState({ rating: 0, comment: '' });
  const [editingReview, setEditingReview] = useState(null);
  const [reviewStats, setReviewStats] = useState({ average: 0, total: 0, distribution: {} });

  useEffect(() => {
    fetchReviews();
  }, [movieId]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await getMovieReviews(movieId);
      setReviews(response || []);
      calculateReviewStats(response || []);
    } catch (err) {
      setError('Failed to load reviews');
      console.error('Error fetching reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  const calculateReviewStats = (reviews) => {
    if (!reviews || reviews.length === 0) {
      setReviewStats({ average: 0, total: 0, distribution: {} });
      return;
    }

    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const average = totalRating / reviews.length;

    const distribution = reviews.reduce((acc, review) => {
      acc[review.rating] = (acc[review.rating] || 0) + 1;
      return acc;
    }, {});

    setReviewStats({
      average: Math.round(average * 10) / 10,
      total: reviews.length,
      distribution
    });
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!user) return;

    try {
      const reviewData = {
        ...newReview,
        movieId,
        movieTitle
      };

      const response = await createReview(movieId, reviewData);
      setReviews([response, ...reviews]);
      setNewReview({ rating: 0, comment: '' });
      calculateReviewStats([response, ...reviews]);
    } catch (err) {
      console.error('Error creating review:', err);
      alert('Failed to create review');
    }
  };

  const handleUpdateReview = async (reviewId, updatedData) => {
    try {
      const response = await updateReview(reviewId, updatedData);
      const updatedReviews = reviews.map(review => 
        review._id === reviewId ? response : review
      );
      setReviews(updatedReviews);
      setEditingReview(null);
      calculateReviewStats(updatedReviews);
    } catch (err) {
      console.error('Error updating review:', err);
      alert('Failed to update review');
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;

    try {
      await deleteReview(reviewId);
      const updatedReviews = reviews.filter(review => review._id !== reviewId);
      setReviews(updatedReviews);
      calculateReviewStats(updatedReviews);
    } catch (err) {
      console.error('Error deleting review:', err);
      alert('Failed to delete review');
    }
  };

  const handleLikeReview = async (reviewId) => {
    if (!user) return;

    try {
      const response = await likeReview(reviewId);
      const updatedReviews = reviews.map(review => 
        review._id === reviewId ? response : review
      );
      setReviews(updatedReviews);
    } catch (err) {
      console.error('Error liking review:', err);
    }
  };

  const StarRating = ({ rating, onRatingChange, clickable = false }) => {
    return (
      <div className="star-rating">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={20}
            className={`star ${rating >= star ? 'filled' : ''} ${clickable ? 'clickable' : ''}`}
            onClick={() => clickable && onRatingChange(star)}
            fill={rating >= star ? '#fbbf24' : 'none'}
          />
        ))}
      </div>
    );
  };

  const ReviewDistribution = () => {
    if (!reviewStats.total) return null;

    return (
      <div className="review-distribution">
        <h4>Rating Distribution</h4>
        <div className="distribution-bars">
          {[5, 4, 3, 2, 1].map((rating) => {
            const count = reviewStats.distribution[rating] || 0;
            const percentage = (count / reviewStats.total) * 100;
            return (
              <div key={rating} className="distribution-item">
                <span className="rating-label">{rating} ★</span>
                <div className="bar-container">
                  <div 
                    className="bar" 
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="count">{count}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="reviews-section">
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading reviews...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="reviews-section">
      <div className="reviews-header">
        <h2>Reviews & Ratings</h2>
        <div className="review-summary">
          <div className="average-rating">
            <div className="rating-number">{reviewStats.average}</div>
            <div className="rating-stars">
              <StarRating rating={Math.round(reviewStats.average)} />
            </div>
            <div className="rating-count">{reviewStats.total} reviews</div>
          </div>
          <ReviewDistribution />
        </div>
      </div>

      {user && (
        <div className="review-form">
          <h3>Write a Review</h3>
          <form onSubmit={handleSubmitReview}>
            <div className="form-group">
              <label>Your Rating</label>
              <StarRating 
                rating={newReview.rating} 
                onRatingChange={(rating) => setNewReview({...newReview, rating})}
                clickable={true}
              />
            </div>
            <div className="form-group">
              <label>Your Review</label>
              <textarea
                className="review-textarea"
                value={newReview.comment}
                onChange={(e) => setNewReview({...newReview, comment: e.target.value})}
                placeholder="Share your thoughts about this movie..."
                required
              />
            </div>
            <button type="submit" className="btn-primary" disabled={!newReview.rating}>
              Submit Review
            </button>
          </form>
        </div>
      )}

      <div className="reviews-list">
        {reviews.length === 0 ? (
          <div className="no-reviews">
            <p>No reviews yet. Be the first to review this movie!</p>
          </div>
        ) : (
          reviews.map((review) => (
            <div key={review._id} className="review-card">
              {editingReview === review._id ? (
                <div className="edit-review-form">
                  <h4>Edit Review</h4>
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    handleUpdateReview(review._id, {
                      rating: newReview.rating,
                      comment: newReview.comment
                    });
                  }}>
                    <div className="form-group">
                      <label>Rating</label>
                      <StarRating 
                        rating={newReview.rating} 
                        onRatingChange={(rating) => setNewReview({...newReview, rating})}
                        clickable={true}
                      />
                    </div>
                    <div className="form-group">
                      <label>Comment</label>
                      <textarea
                        className="review-textarea"
                        value={newReview.comment}
                        onChange={(e) => setNewReview({...newReview, comment: e.target.value})}
                        required
                      />
                    </div>
                    <div className="edit-actions">
                      <button type="submit" className="btn-primary">Save</button>
                      <button 
                        type="button" 
                        className="btn-secondary"
                        onClick={() => setEditingReview(null)}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                <>
                  <div className="review-header">
                    <div className="user-info">
                      <div className="user-avatar">
                        {review.user?.username?.charAt(0)?.toUpperCase() || 'U'}
                      </div>
                      <div>
                        <h4>{review.user?.username || 'Anonymous'}</h4>
                        <div className="review-meta">
                          <StarRating rating={review.rating} />
                          <span className="review-date">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    {user && user._id === review.user?._id && (
                      <div className="review-actions">
                        <button 
                          className="edit-button"
                          onClick={() => {
                            setEditingReview(review._id);
                            setNewReview({ rating: review.rating, comment: review.comment });
                          }}
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          className="delete-button"
                          onClick={() => handleDeleteReview(review._id)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="review-comment">
                    {review.comment}
                  </div>
                  <div className="review-actions">
                    <button 
                      className={`like-button ${review.likes?.includes(user?._id) ? 'liked' : ''}`}
                      onClick={() => handleLikeReview(review._id)}
                      disabled={!user}
                    >
                      <ThumbsUp size={16} />
                      <span>{review.likes?.length || 0}</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ReviewSection;