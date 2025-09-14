import React, { useState, useEffect, useRef, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchService } from '../services/searchService';
import { Search, X, Clock, TrendingUp, Filter } from 'lucide-react';
import { AuthContext } from '../context/AuthContext.jsx';

const SearchBar = ({ onSearch, showFilters = false }) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchHistory, setSearchHistory] = useState([]);
  const [trendingSearches, setTrendingSearches] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [filters, setFilters] = useState({
    genre: '',
    year: '',
    minRating: '',
    maxRating: '',
    sortBy: 'popularity'
  });
  
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const searchRef = useRef(null);
  const debounceTimeout = useRef(null);

  useEffect(() => {
    // Load search history and trending searches
    loadInitialData();
    
    // Close suggestions when clicking outside
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadInitialData = async () => {
    try {
      const [trending, history] = await Promise.all([
        searchService.getTrendingSearches(),
        user ? searchService.getSearchHistory() : Promise.resolve([])
      ]);
      
      setTrendingSearches(trending || []);
      setSearchHistory(history || []);
    } catch (error) {
      console.error('Error loading search data:', error);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    if (value.length >= 2) {
      debounceTimeout.current = setTimeout(() => {
        fetchSuggestions(value);
      }, 300);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const fetchSuggestions = async (searchQuery) => {
    if (!searchQuery.trim()) return;
    
    setIsLoading(true);
    try {
      const data = await searchService.getSearchSuggestions(searchQuery);
      setSuggestions(data || []);
      setShowSuggestions(true);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (searchQuery = query, searchFilters = filters) => {
    if (!searchQuery.trim() && !Object.values(searchFilters).some(v => v)) return;
    
    setShowSuggestions(false);
    
    // Save to search history if user is logged in
    if (user && searchQuery.trim()) {
      searchService.saveSearchHistory(searchQuery.trim());
    }
    
    // Build search URL
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.append('q', searchQuery.trim());
    
    Object.keys(searchFilters).forEach(key => {
      if (searchFilters[key]) {
        params.append(key, searchFilters[key]);
      }
    });
    
    navigate(`/search?${params}`);
    onSearch?.(searchQuery, searchFilters);
  };

  const handleSuggestionClick = (suggestion) => {
    setQuery(suggestion.title || suggestion);
    handleSearch(suggestion.title || suggestion);
  };

  const handleHistoryClick = (historyItem) => {
    setQuery(historyItem);
    handleSearch(historyItem);
  };

  const clearHistory = async () => {
    try {
      await searchService.clearSearchHistory();
      setSearchHistory([]);
    } catch (error) {
      console.error('Error clearing search history:', error);
    }
  };

  const handleFilterChange = (filterType, value) => {
    const newFilters = { ...filters, [filterType]: value };
    setFilters(newFilters);
    
    // Auto-search if query exists
    if (query.trim()) {
      handleSearch(query, newFilters);
    }
  };

  const resetFilters = () => {
    const defaultFilters = {
      genre: '',
      year: '',
      minRating: '',
      maxRating: '',
      sortBy: 'popularity'
    };
    setFilters(defaultFilters);
    if (query.trim()) {
      handleSearch(query, defaultFilters);
    }
  };

  const genres = [
    { value: '', label: 'All Genres' },
    { value: '28', label: 'Action' },
    { value: '12', label: 'Adventure' },
    { value: '16', label: 'Animation' },
    { value: '35', label: 'Comedy' },
    { value: '80', label: 'Crime' },
    { value: '99', label: 'Documentary' },
    { value: '18', label: 'Drama' },
    { value: '10751', label: 'Family' },
    { value: '14', label: 'Fantasy' },
    { value: '36', label: 'History' },
    { value: '27', label: 'Horror' },
    { value: '10402', label: 'Music' },
    { value: '9648', label: 'Mystery' },
    { value: '10749', label: 'Romance' },
    { value: '878', label: 'Science Fiction' },
    { value: '53', label: 'Thriller' },
    { value: '10752', label: 'War' },
    { value: '37', label: 'Western' }
  ];

  const years = Array.from({ length: 30 }, (_, i) => 2024 - i);
  const ratings = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  return (
    <div className="search-container" ref={searchRef}>
      <div className="search-bar">
        <div className="search-input-container">
          <Search className="search-icon" size={20} />
          <input
            type="text"
            placeholder="Search movies, actors, directors..."
            value={query}
            onChange={handleInputChange}
            onFocus={() => setShowSuggestions(true)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            className="search-input"
          />
          {query && (
            <button
              className="clear-btn"
              onClick={() => {
                setQuery('');
                setSuggestions([]);
                setShowSuggestions(false);
              }}
            >
              <X size={16} />
            </button>
          )}
          {showFilters && (
            <button
              className="filter-btn"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter size={16} />
            </button>
          )}
        </div>

        {showFilters && (
          <div className="filters-panel">
            <div className="filter-row">
              <select
                value={filters.genre}
                onChange={(e) => handleFilterChange('genre', e.target.value)}
                className="filter-select"
              >
                {genres.map(genre => (
                  <option key={genre.value} value={genre.value}>
                    {genre.label}
                  </option>
                ))}
              </select>

              <select
                value={filters.year}
                onChange={(e) => handleFilterChange('year', e.target.value)}
                className="filter-select"
              >
                <option value="">All Years</option>
                {years.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>

              <select
                value={filters.minRating}
                onChange={(e) => handleFilterChange('minRating', e.target.value)}
                className="filter-select"
              >
                <option value="">Min Rating</option>
                {ratings.map(rating => (
                  <option key={rating} value={rating}>{rating}+</option>
                ))}
              </select>

              <select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                className="filter-select"
              >
                <option value="popularity">Most Popular</option>
                <option value="release_date">Newest First</option>
                <option value="vote_average">Highest Rated</option>
                <option value="title">A-Z</option>
              </select>

              <button
                onClick={resetFilters}
                className="reset-filters-btn"
              >
                Reset
              </button>
            </div>
          </div>
        )}

        {showSuggestions && (
          <div className="search-suggestions">
            {isLoading && (
              <div className="suggestion-item loading">
                <div className="spinner"></div>
                Searching...
              </div>
            )}

            {trendingSearches.length > 0 && !query && (
              <div className="suggestion-section">
                <div className="suggestion-header">
                  <TrendingUp size={16} />
                  <span>Trending Searches</span>
                </div>
                {trendingSearches.slice(0, 5).map((trending, index) => (
                  <div
                    key={index}
                    className="suggestion-item"
                    onClick={() => handleSuggestionClick(trending)}
                  >
                    {trending}
                  </div>
                ))}
              </div>
            )}

            {searchHistory.length > 0 && !query && (
              <div className="suggestion-section">
                <div className="suggestion-header">
                  <Clock size={16} />
                  <span>Recent Searches</span>
                  <button className="clear-history-btn" onClick={clearHistory}>
                    Clear
                  </button>
                </div>
                {searchHistory.slice(0, 5).map((history, index) => (
                  <div
                    key={index}
                    className="suggestion-item"
                    onClick={() => handleHistoryClick(history)}
                  >
                    <Clock size={14} />
                    {history}
                  </div>
                ))}
              </div>
            )}

            {suggestions.length > 0 && query && (
              <div className="suggestion-section">
                <div className="suggestion-header">
                  <Search size={16} />
                  <span>Suggestions</span>
                </div>
                {suggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className="suggestion-item"
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    <Search size={14} />
                    <div className="suggestion-content">
                      <span className="suggestion-title">
                        {suggestion.title || suggestion}
                      </span>
                      {suggestion.year && (
                        <span className="suggestion-meta">{suggestion.year}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {query && !isLoading && suggestions.length === 0 && (
              <div className="suggestion-item no-results">
                No movies found for "{query}"
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchBar;