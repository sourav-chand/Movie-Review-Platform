import { useEffect, useState } from 'react';
import { useMovieContext } from '../context/MovieContext.jsx';

export const useMovies = () => {
  const { dispatch } = useMovieContext();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMovies = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/movies');
        if (!response.ok) {
          throw new Error('Could not fetch movies');
        }
        const json = await response.json();
        dispatch({ type: 'SET_MOVIES', payload: json });
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMovies();
  }, [dispatch]);

  return { isLoading, error };
};