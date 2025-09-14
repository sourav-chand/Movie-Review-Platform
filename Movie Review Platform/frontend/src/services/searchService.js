import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const searchService = {
  // Search movies
  searchMovies: async (query, filters = {}) => {
    const params = new URLSearchParams({
      q: query,
      ...filters
    });
    const response = await api.get(`/search/movies?${params}`);
    return response.data;
  },

  // Get search suggestions
  getSearchSuggestions: async (query) => {
    const response = await api.get(`/search/suggestions?q=${encodeURIComponent(query)}`);
    return response.data;
  },

  // Get popular searches
  getPopularSearches: async () => {
    const response = await api.get('/search/popular');
    return response.data;
  },

  // Get filter options
  getFilterOptions: async () => {
    const response = await api.get('/search/filters');
    return response.data;
  },

  // Advanced search with filters
  advancedSearch: async (filters) => {
    const params = new URLSearchParams();
    
    Object.keys(filters).forEach(key => {
      if (filters[key]) {
        if (Array.isArray(filters[key])) {
          filters[key].forEach(value => params.append(key, value));
        } else {
          params.append(key, filters[key]);
        }
      }
    });

    const response = await api.get(`/search/advanced?${params}`);
    return response.data;
  },

  // Search by genre
  searchByGenre: async (genreId, page = 1) => {
    const response = await api.get(`/search/genre/${genreId}?page=${page}`);
    return response.data;
  },

  // Search by year
  searchByYear: async (year, page = 1) => {
    const response = await api.get(`/search/year/${year}?page=${page}`);
    return response.data;
  },

  // Search by rating
  searchByRating: async (minRating, maxRating = 10, page = 1) => {
    const response = await api.get(`/search/rating?min=${minRating}&max=${maxRating}&page=${page}`);
    return response.data;
  },

  // Save search history (for logged in users)
  saveSearchHistory: async (query) => {
    const response = await api.post('/search/history', { query });
    return response.data;
  },

  // Get search history
  getSearchHistory: async () => {
    const response = await api.get('/search/history');
    return response.data;
  },

  // Clear search history
  clearSearchHistory: async () => {
    const response = await api.delete('/search/history');
    return response.data;
  },

  // Get trending searches
  getTrendingSearches: async () => {
    const response = await api.get('/search/trending');
    return response.data;
  }
};

export default searchService;