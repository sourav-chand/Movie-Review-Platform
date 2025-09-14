import axios from 'axios';

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const BASE_URL = import.meta.env.VITE_TMDB_BASE_URL;

const tmdb = axios.create({
  baseURL: BASE_URL,
  params: {
    api_key: API_KEY,
  },
});

export const searchMovies = async (query) => {
  try {
    const response = await tmdb.get('/search/movie', {
      params: {
        query: query,
      },
    });
    return response.data.results;
  } catch (error) {
    console.error('Error searching movies:', error);
    return [];
  }
};

export const getMovieDetails = async (id) => {
  try {
    const response = await tmdb.get(`/movie/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error getting movie details for ID ${id}:`, error);
    return null;
  }
};

export const getPopularMovies = async () => {
  try {
    const response = await tmdb.get('/movie/popular');
    return response.data.results;
  } catch (error) {
    console.error('Error getting popular movies:', error);
    return [];
  }
};

export const getMovieCast = async (id) => {
  try {
    const response = await tmdb.get(`/movie/${id}/credits`);
    return response.data;
  } catch (error) {
    console.error(`Error getting movie cast for ID ${id}:`, error);
    return { cast: [], crew: [] };
  }
};

export const getMovieTrailer = async (id) => {
  try {
    const response = await tmdb.get(`/movie/${id}/videos`);
    return response.data;
  } catch (error) {
    console.error(`Error getting movie trailer for ID ${id}:`, error);
    return { results: [] };
  }
};

export const getMovieReviews = async (id) => {
  try {
    const response = await tmdb.get(`/movie/${id}/reviews`);
    return response.data.results;
  } catch (error) {
    console.error(`Error getting movie reviews for ID ${id}:`, error);
    return [];
  }
};

export const getSimilarMovies = async (id) => {
  try {
    const response = await tmdb.get(`/movie/${id}/similar`);
    return response.data.results;
  } catch (error) {
    console.error(`Error getting similar movies for ID ${id}:`, error);
    return [];
  }
};

export const getMovieImages = async (id) => {
  try {
    const response = await tmdb.get(`/movie/${id}/images`);
    return response.data;
  } catch (error) {
    console.error(`Error getting movie images for ID ${id}:`, error);
    return { backdrops: [], posters: [] };
  }
};