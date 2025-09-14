import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { addToWatchlist, removeFromWatchlist, isInWatchlist } from '../services/watchlistService';

const WatchlistButton = ({ movie, className = "" }) => {
  const { user } = useContext(AuthContext);
  const [isInList, setIsInList] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user && movie?.id) {
      checkWatchlistStatus();
    }
  }, [user, movie?.id]);

  const checkWatchlistStatus = async () => {
    try {
      const inList = await isInWatchlist(movie.id);
      setIsInList(inList);
    } catch (error) {
      console.error('Error checking watchlist status:', error);
    }
  };

  const handleAddToWatchlist = async () => {
    if (!user) {
      alert('Please login to add movies to your watchlist');
      return;
    }

    setLoading(true);
    try {
      const movieData = {
        title: movie.title,
        poster_path: movie.poster_path,
        release_date: movie.release_date,
        vote_average: movie.vote_average,
        overview: movie.overview,
      };

      await addToWatchlist(movie.id, movieData);
      setIsInList(true);
    } catch (error) {
      alert('Failed to add to watchlist');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromWatchlist = async () => {
    if (!user) return;

    setLoading(true);
    try {
      await removeFromWatchlist(movie.id);
      setIsInList(false);
    } catch (error) {
      alert('Failed to remove from watchlist');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <button
        onClick={() => alert('Please login to use watchlist')}
        className={`watchlist-button ${className}`}
        title="Add to Watchlist"
      >
        <span className="watchlist-icon">+</span>
        <span>Watchlist</span>
      </button>
    );
  }

  return (
    <button
      onClick={isInList ? handleRemoveFromWatchlist : handleAddToWatchlist}
      disabled={loading}
      className={`watchlist-button ${isInList ? 'in-watchlist' : ''} ${className}`}
      title={isInList ? 'Remove from Watchlist' : 'Add to Watchlist'}
    >
      {loading ? (
        <div className="spinner-small"></div>
      ) : (
        <>
          <span className="watchlist-icon">
            {isInList ? '✓' : '+'}
          </span>
          <span>
            {isInList ? 'In Watchlist' : 'Watchlist'}
          </span>
        </>
      )}
    </button>
  );
};

export default WatchlistButton;