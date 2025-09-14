import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const reviewService = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
reviewService.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const createReview = async (movieId, reviewData) => {
  try {
    const response = await reviewService.post('/reviews', {
      movieId,
      ...reviewData,
    });
    return response.data;
  } catch (error) {
    console.error('Error creating review:', error);
    throw error;
  }
};

export const getMovieReviews = async (movieId) => {
  try {
    const response = await reviewService.get(`/reviews/movie/${movieId}`);
    return response.data;
  } catch (error) {
    console.error('Error getting movie reviews:', error);
    return [];
  }
};

export const updateReview = async (reviewId, reviewData) => {
  try {
    const response = await reviewService.put(`/reviews/${reviewId}`, reviewData);
    return response.data;
  } catch (error) {
    console.error('Error updating review:', error);
    throw error;
  }
};

export const deleteReview = async (reviewId) => {
  try {
    const response = await reviewService.delete(`/reviews/${reviewId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting review:', error);
    throw error;
  }
};

export const getUserReviews = async (userId) => {
  try {
    const response = await reviewService.get(`/reviews/user/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error getting user reviews:', error);
    return [];
  }
};

export const likeReview = async (reviewId) => {
  try {
    const response = await reviewService.post(`/reviews/${reviewId}/like`);
    return response.data;
  } catch (error) {
    console.error('Error liking review:', error);
    throw error;
  }
};

export const unlikeReview = async (reviewId) => {
  try {
    const response = await reviewService.delete(`/reviews/${reviewId}/like`);
    return response.data;
  } catch (error) {
    console.error('Error unliking review:', error);
    throw error;
  }
};

export const getUserFavorites = async () => {
  try {
    const response = await reviewService.get('/reviews/favorites');
    return response.data;
  } catch (error) {
    console.error('Error getting user favorites:', error);
    return [];
  }
};