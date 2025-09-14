import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext.jsx';
import { getUserWatchlist, removeFromWatchlist } from '../services/watchlistService';
import { Heart, Trash2, Film } from 'lucide-react';

const Watchlist = () => {
  const { user } = useContext(AuthContext);
  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user) {
      fetchWatchlist();
    }
  }, [user]);

  const fetchWatchlist = async () => {
    try {
      setLoading(true);
      const data = await getUserWatchlist();
      setWatchlist(data);
    } catch (err) {
      setError('Failed to load watchlist');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromWatchlist = async (movieId) => {
    try {
      await removeFromWatchlist(movieId);
      setWatchlist(watchlist.filter(movie => movie.movieId !== movieId));
    } catch (error) {
      alert('Failed to remove from watchlist');
    }
  };

  if (!user) {
    return (
      <div className="watchlist-page">
        <div className="auth-required">
          <Film size={48} />
          <h2>Please Login</h2>
          <p>Login to view and manage your watchlist</p>
          <Link to="/login" className="btn-primary">
            Login
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="watchlist-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading your watchlist...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="watchlist-page">
        <div className="error-message">
          <h2>{error}</h2>
          <button onClick={fetchWatchlist} className="btn-primary">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="watchlist-page">
      <div className="page-header">
        <h1>My Watchlist</h1>
        <p>{watchlist.length} {watchlist.length === 1 ? 'movie' : 'movies'} in your watchlist</p>
      </div>

      {watchlist.length === 0 ? (
        <div className="empty-state">
          <Film size={48} />
          <h3>Your watchlist is empty</h3>
          <p>Start adding movies you want to watch later</p>
          <Link to="/" className="btn-primary">
            Browse Movies
          </Link>
        </div>
      ) : (
        <div className="movies-grid">
          {watchlist.map((item) => (
            <div key={item.movieId} className="movie-card">
              <Link to={`/movie/${item.movieId}`}>
                <img
                  src={
                    item.poster_path
                      ? `https://image.tmdb.org/t/p/w300${item.poster_path}`
                      : '/placeholder-movie.jpg'
                  }
                  alt={item.title}
                  className="poster-image"
                />
                <h3>{item.title}</h3>
                <p>{item.release_date?.split('-')[0]}</p>
                <div className="rating">⭐ {item.vote_average?.toFixed(1)}</div>
              </Link>
              <button
                onClick={() => handleRemoveFromWatchlist(item.movieId)}
                className="btn-secondary"
              >
                <Trash2 size={14} />
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Watchlist;