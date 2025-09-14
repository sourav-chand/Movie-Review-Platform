import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const watchlistService = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
watchlistService.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const addToWatchlist = async (movieId, movieData) => {
  try {
    const response = await watchlistService.post('/watchlist', {
      movieId,
      ...movieData,
    });
    return response.data;
  } catch (error) {
    console.error('Error adding to watchlist:', error);
    throw error;
  }
};

export const removeFromWatchlist = async (movieId) => {
  try {
    const response = await watchlistService.delete(`/watchlist/${movieId}`);
    return response.data;
  } catch (error) {
    console.error('Error removing from watchlist:', error);
    throw error;
  }
};

export const getUserWatchlist = async () => {
  try {
    const response = await watchlistService.get('/watchlist');
    return response.data;
  } catch (error) {
    console.error('Error getting watchlist:', error);
    return [];
  }
};

export const isInWatchlist = async (movieId) => {
  try {
    const response = await watchlistService.get(`/watchlist/check/${movieId}`);
    return response.data.inWatchlist;
  } catch (error) {
    console.error('Error checking watchlist status:', error);
    return false;
  }
};

export const updateWatchlistStatus = async (movieId, status) => {
  try {
    const response = await watchlistService.put(`/watchlist/${movieId}`, {
      status,
    });
    return response.data;
  } catch (error) {
    console.error('Error updating watchlist status:', error);
    throw error;
  }
};