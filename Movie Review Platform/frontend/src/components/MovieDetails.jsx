import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getMovieDetails, getMovieCast, getMovieTrailer, getSimilarMovies, getMovieImages } from '../services/tmdbService';
import { getMovieReviews } from '../services/reviewService';
import ReviewSection from './ReviewSection';
import WatchlistButton from './WatchlistButton';
import { 
  Star, 
  Play, 
  Calendar, 
  Clock, 
  Tag, 
  DollarSign, 
  Building, 
  Globe, 
  Languages,
  Users
} from 'lucide-react';

const MovieDetails = () => {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [cast, setCast] = useState([]);
  const [trailer, setTrailer] = useState(null);
  const [similarMovies, setSimilarMovies] = useState([]);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userRating, setUserRating] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);

  useEffect(() => {
    fetchMovieDetails();
  }, [id]);

  const fetchMovieDetails = async () => {
    try {
      setLoading(true);
      
      const [detailsResponse, castResponse, trailerResponse, reviewsResponse, 
             similarResponse, imagesResponse] = await Promise.all([
        getMovieDetails(id),
        getMovieCast(id),
        getMovieTrailer(id),
        getMovieReviews(id),
        getSimilarMovies(id),
        getMovieImages(id)
      ]);

      setMovie(detailsResponse);
      setCast(castResponse?.cast || []);
      setTrailer(trailerResponse?.results?.[0] || null);
      setSimilarMovies(similarResponse?.results || []);
      setImages(imagesResponse?.backdrops || []);
      
      // Calculate review stats
      const reviews = reviewsResponse || [];
      if (reviews.length > 0) {
        const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
        setUserRating(Math.round((totalRating / reviews.length) * 10) / 10);
        setReviewCount(reviews.length);
      }

    } catch (err) {
      setError('Failed to load movie details');
      console.error('Error fetching movie details:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatRuntime = (minutes) => {
    if (!minutes) return 'N/A';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Loading movie details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error">
        <div className="error-content">
          <h3>Error Loading Movie</h3>
          <p>{error}</p>
          <Link to="/" className="btn-primary">Back to Home</Link>
        </div>
      </div>
    );
  }

  if (!movie) return null;

  return (
    <div className="movie-details">
      {/* Backdrop Image */}
      {movie.backdrop_path && (
        <div className="movie-backdrop">
          <img 
            src={`https://image.tmdb.org/t/p/original${movie.backdrop_path}`} 
            alt={movie.title}
            className="backdrop-image"
          />
          <div className="backdrop-overlay"></div>
        </div>
      )}

      <div className="movie-content">
        <div className="movie-main">
          <div className="movie-poster">
            {movie.poster_path ? (
              <img 
                src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`} 
                alt={movie.title}
                className="poster-image"
              />
            ) : (
              <div className="poster-placeholder">No Image</div>
            )}
          </div>

          <div className="movie-info">
            <h1>{movie.title}</h1>
            
            {/* Enhanced Rating Display */}
            <div className="movie-rating-display">
              {userRating > 0 && (
                <div className="user-rating">
                  <div className="rating-badge">
                    <Star size={16} fill="#fbbf24" />
                    <span className="rating-number">{userRating}</span>
                    <span className="rating-count">({reviewCount} reviews)</span>
                  </div>
                </div>
              )}
              
              {movie.vote_average && (
                <div className="tmdb-rating">
                  <span className="rating-label">TMDB:</span>
                  <span className="rating-score">{movie.vote_average.toFixed(1)}</span>
                </div>
              )}
            </div>

            <div className="movie-meta">
              <div className="meta-item">
                <Calendar size={16} />
                <span>{new Date(movie.release_date).getFullYear()}</span>
              </div>
              <div className="meta-item">
                <Clock size={16} />
                <span>{formatRuntime(movie.runtime)}</span>
              </div>
              <div className="meta-item">
                <Tag size={16} />
                <span>{movie.genres?.map(g => g.name).join(', ')}</span>
              </div>
            </div>

            <p className="movie-overview">{movie.overview}</p>

            <div className="movie-actions">
              {trailer && (
                <a 
                  href={`https://www.youtube.com/watch?v=${trailer.key}`}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="btn-secondary"
                >
                  <Play size={16} />
                  Watch Trailer
                </a>
              )}
              <WatchlistButton movieId={movie.id} movieTitle={movie.title} />
            </div>
          </div>
        </div>

        {/* Additional Movie Info */}
        <div className="additional-info">
          <div className="info-grid">
            {movie.budget > 0 && (
              <div className="info-card">
                <div className="info-icon">
                  <DollarSign size={24} />
                </div>
                <div className="info-content">
                  <h4>Budget</h4>
                  <p>{formatCurrency(movie.budget)}</p>
                </div>
              </div>
            )}
            
            {movie.revenue > 0 && (
              <div className="info-card">
                <div className="info-icon">
                  <DollarSign size={24} />
                </div>
                <div className="info-content">
                  <h4>Revenue</h4>
                  <p>{formatCurrency(movie.revenue)}</p>
                </div>
              </div>
            )}

            {movie.original_language && (
              <div className="info-card">
                <div className="info-icon">
                  <Languages size={24} />
                </div>
                <div className="info-content">
                  <h4>Language</h4>
                  <p>{movie.original_language.toUpperCase()}</p>
                </div>
              </div>
            )}

            {movie.status && (
              <div className="info-card">
                <div className="info-icon">
                  <Globe size={24} />
                </div>
                <div className="info-content">
                  <h4>Status</h4>
                  <p>{movie.status}</p>
                </div>
              </div>
            )}
          </div>

          {/* Production Companies */}
          {movie.production_companies?.length > 0 && (
            <div className="production-section">
              <h3>Production Companies</h3>
              <div className="production-grid">
                {movie.production_companies.map((company) => (
                  <div key={company.id} className="production-item">
                    {company.logo_path ? (
                      <img 
                        src={`https://image.tmdb.org/t/p/w200${company.logo_path}`}
                        alt={company.name}
                        className="company-logo"
                      />
                    ) : (
                      <div className="company-name">
                        <Building size={16} />
                        <span>{company.name}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Production Countries */}
          {movie.production_countries?.length > 0 && (
            <div className="countries-section">
              <h3>Production Countries</h3>
              <div className="countries-list">
                {movie.production_countries.map((country) => (
                  <span key={country.iso_3166_1} className="country-tag">
                    {country.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Cast Section */}
        {cast.length > 0 && (
          <div className="cast-section">
            <h2>Cast</h2>
            <div className="cast-grid">
              {cast.slice(0, 12).map((person) => (
                <div key={person.id} className="cast-card">
                  <div className="cast-image">
                    {person.profile_path ? (
                      <img 
                        src={`https://image.tmdb.org/t/p/w185${person.profile_path}`}
                        alt={person.name}
                      />
                    ) : (
                      <div className="cast-placeholder">No Image</div>
                    )}
                  </div>
                  <div className="cast-info">
                    <h4>{person.name}</h4>
                    <p>{person.character}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Images Section */}
        {images.length > 0 && (
          <div className="images-section">
            <h2>Images</h2>
            <div className="images-grid">
              {images.slice(0, 6).map((image) => (
                <div key={image.file_path} className="image-item">
                  <img 
                    src={`https://image.tmdb.org/t/p/w780${image.file_path}`}
                    alt="Movie scene"
                    className="scene-image"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reviews Section */}
        <ReviewSection movieId={movie.id} movieTitle={movie.title} />

        {/* Similar Movies */}
        {similarMovies.length > 0 && (
          <div className="similar-movies">
            <h2>Similar Movies</h2>
            <div className="movies-grid">
              {similarMovies.slice(0, 6).map((movie) => (
                <div key={movie.id} className="movie-card">
                  <Link to={`/movie/${movie.id}`}>
                    <div className="movie-poster">
                      {movie.poster_path ? (
                        <img 
                          src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                          alt={movie.title}
                        />
                      ) : (
                        <div className="poster-placeholder">No Image</div>
                      )}
                    </div>
                    <div className="movie-info">
                      <h3>{movie.title}</h3>
                      <p>{new Date(movie.release_date).getFullYear()}</p>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MovieDetails;