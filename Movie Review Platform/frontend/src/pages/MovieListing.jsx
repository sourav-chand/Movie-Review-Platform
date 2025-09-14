import { useEffect, useState } from 'react';
import { useMovieContext } from '../hooks/useMovieContext';
import MovieDetails from '../components/MovieDetails';

const MovieListing = () => {
  const { movies, dispatch } = useMovieContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGenre, setFilterGenre] = useState('');
  const [filterYear, setFilterYear] = useState('');
  const [filterRating, setFilterRating] = useState('');

  useEffect(() => {
    const fetchMovies = async () => {
      const response = await fetch('/api/movies');
      const json = await response.json();

      if (response.ok) {
        dispatch({ type: 'SET_MOVIES', payload: json });
      }
    };

    fetchMovies();
  }, [dispatch]);

  const filteredMovies = movies
    ? movies.filter((movie) => {
        const matchesSearch = movie.title.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesGenre = filterGenre === '' || movie.genre.includes(filterGenre);
        const matchesYear = filterYear === '' || movie.releaseYear.toString() === filterYear;
        const matchesRating = filterRating === '' || movie.averageRating >= parseFloat(filterRating);
        return matchesSearch && matchesGenre && matchesYear && matchesRating;
      })
    : [];

  const genres = [...new Set(movies ? movies.flatMap((movie) => movie.genre) : [])];
  const years = [...new Set(movies ? movies.map((movie) => movie.releaseYear) : [])].sort((a, b) => b - a);

  return (
    <div className="movie-listing p-4">
      <h2 className="text-3xl font-bold text-primary-color mb-6">Movie Listing</h2>
      <div className="filters grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <input
          type="text"
          placeholder="Search by title..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input-field"
        />
        <select
          onChange={(e) => setFilterGenre(e.target.value)}
          value={filterGenre}
          className="input-field"
        >
          <option value="">All Genres</option>
          {genres.map((genre) => (
            <option key={genre} value={genre}>
              {genre}
            </option>
          ))}
        </select>
        <select
          onChange={(e) => setFilterYear(e.target.value)}
          value={filterYear}
          className="input-field"
        >
          <option value="">All Years</option>
          {years.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
        <select
          onChange={(e) => setFilterRating(e.target.value)}
          value={filterRating}
          className="input-field"
        >
          <option value="">All Ratings</option>
          {[5, 4, 3, 2, 1].map((rating) => (
            <option key={rating} value={rating}>
              {rating}+ Stars
            </option>
          ))}
        </select>
      </div>
      <div className="movies grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredMovies.length > 0 ? (
          filteredMovies.map((movie) => <MovieDetails key={movie._id} movie={movie} />)
        ) : (
          <p className="text-lg text-gray-300">No movies found.</p>
        )}
      </div>
    </div>
  );
};

export default MovieListing;