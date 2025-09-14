import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Calendar } from 'lucide-react';

const MovieCard = ({ movie }) => {
  if (!movie) return null;

  const getImageUrl = (path, size = 'w500') => {
    if (!path) return null;
    return `https://image.tmdb.org/t/p/${size}${path}`;
  };

  return (
    <div className="movie-card">
      <Link to={`/movie/${movie.id}`} className="movie-link">
        <div className="movie-poster">
          {movie.poster_path ? (
            <img 
              src={getImageUrl(movie.poster_path, 'w500')} 
              alt={movie.title}
              className="poster-image"
              loading="lazy"
            />
          ) : (
            <div className="poster-placeholder">
              <div className="placeholder-content">
                <span className="placeholder-text">No Image</span>
              </div>
            </div>
          )}
          
          {movie.vote_average && (
            <div className="movie-rating">
              <Star size={14} fill="#fbbf24" />
              <span>{movie.vote_average.toFixed(1)}</span>
            </div>
          )}
        </div>
        
        <div className="movie-info">
          <h3 className="movie-title">{movie.title}</h3>
          
          {movie.release_date && (
            <div className="movie-year">
              <Calendar size={14} />
              <span>{new Date(movie.release_date).getFullYear()}</span>
            </div>
          )}
          
          {movie.overview && (
            <p className="movie-overview">
              {movie.overview.length > 100 
                ? `${movie.overview.substring(0, 100)}...` 
                : movie.overview}
            </p>
          )}
        </div>
      </Link>
    </div>
  );
};

export default MovieCard;