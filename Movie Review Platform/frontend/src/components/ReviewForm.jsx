import React, { useState } from 'react';
import { useAuthContext } from '../hooks/useAuthContext';

const ReviewForm = ({ tmdbMovieId, movieTitle, onReviewSubmitted }) => {
  const { user } = useAuthContext();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (!user) {
      setError('You must be logged in to submit a review');
      setIsLoading(false);
      return;
    }

    const review = { rating, comment, tmdbMovieId, movieTitle };

    try {
      const response = await fetch(`/api/reviews/${tmdbMovieId}`, {
        method: 'POST',
        body: JSON.stringify(review),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`,
        },
      });

      const json = await response.json();

      if (!response.ok) {
        setError(json.error);
      } else {
        setRating(0);
        setComment('');
        onReviewSubmitted(json); // Callback to update movie details with new review
      }
    } catch (err) {
      setError('Failed to submit review');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form className="review-form bg-white p-6 rounded-lg shadow-md" onSubmit={handleSubmit}>
      <h3 className="text-xl font-semibold text-primary-color mb-4">Submit a Review</h3>
      <label className="block text-gray-700 text-sm font-bold mb-2">Rating (1-5):</label>
      <input
        type="number"
        min="1"
        max="5"
        value={rating}
        onChange={(e) => setRating(e.target.value)}
        required
        className="input-field mb-4"
      />

      <label className="block text-gray-700 text-sm font-bold mb-2">Comment:</label>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        required
        className="input-field mb-4"
      ></textarea>

      <button disabled={isLoading} className="btn-primary">Submit Review</button>
      {error && <div className="error mt-4 text-red-500">{error}</div>}
    </form>
  );
};

export default ReviewForm;