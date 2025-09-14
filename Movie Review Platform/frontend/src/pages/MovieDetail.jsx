import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuthContext } from '../hooks/useAuthContext.jsx';
import ReviewForm from '../components/ReviewForm';
import { getMovieDetails } from '../services/tmdbService';

const MovieDetail = () => {
  const { id } = useParams(); // This is now the TMDB movie ID
  const { user } = useAuthContext();
  const [movie, setMovie] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMovieAndReviews = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Fetch movie details from TMDB
        const tmdbMovie = await getMovieDetails(id);
        if (tmdbMovie) {
          setMovie(tmdbMovie);
        } else {
          throw new Error('Movie not found on TMDB.');
        }

        // Fetch reviews from our backend using tmdbMovieId
        const reviewsResponse = await fetch(`/api/reviews/${id}`);
        if (!reviewsResponse.ok) {
          throw new Error('Could not fetch reviews');
        }
        const reviewsData = await reviewsResponse.json();
        setReviews(reviewsData);

        if (user) {
          // Check watchlist status using tmdbMovieId
          const watchlistResponse = await fetch(`/api/watchlist/${id}`, {
            headers: { Authorization: `Bearer ${user.token}` },
          });
          if (!watchlistResponse.ok) {
            throw new Error('Could not fetch watchlist status');
          }
          const watchlistData = await watchlistResponse.json();
          setIsInWatchlist(watchlistData.isInWatchlist);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMovieAndReviews();
  }, [id, user]);

  const handleReviewSubmit = (newReview) => {
    setReviews((prevReviews) => [newReview, ...prevReviews]);
  };

  const handleWatchlistToggle = async () => {
    if (!user) {
      alert('You must be logged in to manage your watchlist');
      return;
    }

    try {
      const method = isInWatchlist ? 'DELETE' : 'POST';
      const response = await fetch(`/api/watchlist/${id}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({ tmdbMovieId: id, movieTitle: movie.title }), // Pass movieTitle for watchlist
      });

      if (!response.ok) {
        throw new Error(`Could not ${isInWatchlist ? 'remove from' : 'add to'} watchlist`);
      }

      setIsInWatchlist(!isInWatchlist);
    } catch (err) {
      setError(err.message);
    }
  };

  if (isLoading) {
    return <div className="text-center text-white text-xl">Loading movie details...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500 text-xl">Error: {error}</div>;
  }

  if (!movie) {
    return <div className="text-center text-white text-xl">Movie not found.</div>;
  }

  return (
    <div className="movie-detail p-4 text-white">
      <div className="md:flex md:items-start md:space-x-8">
        {movie.poster_path ? (
          <img
            src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
            alt={movie.title}
            className="w-full md:w-1/3 h-auto object-cover mb-4 rounded-lg shadow-lg"
          />
        ) : (
          <div className="w-full md:w-1/3 h-96 bg-gray-700 rounded-lg flex items-center justify-center text-gray-400 text-center mb-4">
            No Poster Available
          </div>
        )}
        <div className="md:w-2/3">
          <h2 className="text-4xl font-bold mb-4 text-primary-color">{movie.title}</h2>
          <p className="text-lg mb-2">
            <span className="font-semibold">Genre:</span>{' '}
            {movie.genres && movie.genres.map((genre) => genre.name).join(', ')}
          </p>
          <p className="text-lg mb-2">
            <span className="font-semibold">Release Year:</span>{' '}
            {movie.release_date ? movie.release_date.substring(0, 4) : 'N/A'}
          </p>
          <p className="text-lg mb-2">
            <span className="font-semibold">Rating:</span>{' '}
            {movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A'}
          </p>
          <p className="text-md mb-4 leading-relaxed">
            <span className="font-semibold">Synopsis:</span> {movie.overview}
          </p>

          {user && (
            <button
              onClick={handleWatchlistToggle}
              className={`py-2 px-4 rounded-lg font-semibold transition duration-300 ${isInWatchlist ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'}`}
            >
              {isInWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'}
            </button>
          )}

          {movie.videos && movie.videos.results.length > 0 && (
            <div className="mb-6 mt-6">
              <h2 className="text-2xl font-semibold mb-2">Trailer</h2>
              <div className="aspect-w-16 aspect-h-9">
                <iframe
                  src={`https://www.youtube.com/embed/${movie.videos.results[0].key}`}
                  title="YouTube video player"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full rounded-lg"
                ></iframe>
              </div>
            </div>
          )}

          {movie.credits && movie.credits.cast.length > 0 && (
            <div className="mt-6">
              <h2 className="text-2xl font-semibold mb-2">Cast</h2>
              <ul className="list-disc list-inside grid grid-cols-2 sm:grid-cols-3 gap-2">
                {movie.credits.cast.slice(0, 6).map((person) => (
                  <li key={person.id} className="text-gray-300">
                    {person.name} {person.character && `as ${person.character}`}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      <h3 className="text-3xl font-bold mt-12 mb-6 text-primary-color">Reviews</h3>
      {user ? (
        <ReviewForm tmdbMovieId={id} movieTitle={movie.title} onReviewSubmitted={handleReviewSubmit} />
      ) : (
        <p className="text-lg text-gray-300">Login to submit a review.</p>
      )}

      <div className="reviews mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reviews.length > 0 ? (
          reviews.map((review) => (
            <div key={review._id} className="bg-gray-800 p-6 rounded-lg shadow-md border border-gray-700">
              <p className="text-xl font-semibold text-accent-color mb-2">Rating: {review.rating}/5</p>
              <p className="text-md text-gray-300 mb-3">{review.reviewText}</p>
              <p className="text-sm text-gray-400">By {review.userId.username}</p>
            </div>
          ))
        ) : (
          <p className="text-lg text-gray-300">No reviews yet. Be the first to review!</p>
        )}
      </div>
    </div>
  );
};

export default MovieDetail;