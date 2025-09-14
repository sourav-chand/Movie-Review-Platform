import React, { useState, useEffect, useContext } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { searchMovies, getPopularMovies } from '../services/tmdbService';
import { AuthContext } from '../context/AuthContext';
import MovieCard from '../components/MovieCard';
import { Search, Filter, X } from 'lucide-react';

const SearchResults = () => {
  const location = useLocation();
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);

  // Parse URL parameters
  const searchParams = new URLSearchParams(location.search);
  const query = searchParams.get('q') || '';

  useEffect(() => {
    performSearch();
  }, [location.search]);

  const performSearch = async () => {
    setLoading(true);
    setError(null);
    
    try {
      let results;
      
      if (query.trim()) {
        // Text search
        results = await searchMovies(query);
      } else {
        // Default to popular movies
        results = await getPopularMovies();
      }

      setMovies(results || []);
      setTotalPages(1); // TMDB free tier doesn't provide pagination
      setTotalResults(results?.length || 0);
    } catch (error) {
      console.error('Error searching movies:', error);
      setError('Failed to load search results');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="search-results">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Searching movies...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="search-results">
      <div className="search-header">
        <h1>
          {query ? `Search Results for "${query}"` : 'Popular Movies'}
          {totalResults > 0 && (
            <span className="results-count">({totalResults} results)</span>
          )}
        </h1>
      </div>

      <div className="results-content">
        {error && (
          <div className="error-message">
            <Search size={48} />
            <h3>{error}</h3>
            <button onClick={performSearch}>Try Again</button>
          </div>
        )}

        {!loading && !error && movies.length === 0 && (
          <div className="no-results">
            <Search size={48} />
            <h3>No movies found</h3>
            <p>Try adjusting your search terms</p>
          </div>
        )}

        {movies.length > 0 && (
          <div className="movies-grid">
            {movies.map(movie => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchResults;