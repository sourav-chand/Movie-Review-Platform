import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getPopularMovies } from '../services/tmdbService';

const Home = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setLoading(true);
        const data = await getPopularMovies();
        setMovies(data.results || []);
      } catch (err) {
        setError(err.message || 'Failed to fetch movies');
      } finally {
        setLoading(false);
      }
    };
    fetchMovies();
  }, []);

  const filteredMovies = movies.filter(movie =>
    movie.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="pages">
        <div className="loading">
          <div className="loading-content">
            <div className="spinner animate-pulse"></div>
            <p className="loading-text">Loading amazing movies...</p>
          </div>
        </div>
        
        {/* Loading skeletons */}
        <div className="movies-grid">
          {[...Array(8)].map((_, index) => (
            <div key={index} className="movie-card-skeleton animate-fade-in" 
                 style={{ animationDelay: `${index * 0.1}s` }}>
              <div className="skeleton-poster"></div>
              <div className="skeleton-content">
                <div className="skeleton-title"></div>
                <div className="skeleton-text"></div>
                <div className="skeleton-text short"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pages">
        <div className="error">
          <div className="error-content">
            <div className="error-icon">😢</div>
            <h3>Oops! Something went wrong</h3>
            <p>{error}</p>
            <button 
              className="btn-primary" 
              onClick={() => window.location.reload()}
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pages">
      <div className="home animate-fade-in">
        <div className="search-container">
          <input
            type="text"
            placeholder="Search movies..."
            className="search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        {filteredMovies.length === 0 ? (
          <div className="no-results">
            <div className="no-results-content">
              <div className="no-results-icon">🔍</div>
              <h3>No movies found</h3>
              <p>Try adjusting your search terms</p>
            </div>
          </div>
        ) : (
          <div className="movies-grid">
            {filteredMovies.map((movie, index) => (
              <Link 
                to={`/movie/${movie.id}`} 
                key={movie.id} 
                className="movie-card animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="movie-poster-container">
                  <img
                    src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                    alt={movie.title}
                    className="movie-poster"
                    loading="lazy"
                  />
                  <div className="movie-overlay">
                    <div className="movie-rating">
                      <span className="rating-star">⭐</span>
                      <span>{movie.vote_average.toFixed(1)}</span>
                    </div>
                    <div className="movie-year">
                      {new Date(movie.release_date).getFullYear()}
                    </div>
                  </div>
                </div>
                <div className="movie-card-content">
                  <h3 className="movie-title">{movie.title}</h3>
                  <p className="movie-overview">
                    {movie.overview.length > 100 
                      ? `${movie.overview.substring(0, 100)}...` 
                      : movie.overview}
                  </p>
                  <div className="movie-meta">
                    <span className="movie-genres">
                      {movie.genre_ids?.slice(0, 3).join(', ') || 'Action, Drama'}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;