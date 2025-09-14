import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { Star, Calendar, Film, Heart, Settings, User, Edit3, Save, X, MessageCircle, Clock, Trash2 } from 'lucide-react';
import { AuthContext } from '../context/AuthContext.jsx';
import { getUserReviews, getUserFavorites, deleteReview } from '../services/reviewService';

const Profile = () => {
  const { user } = useContext(AuthContext);
  const [userReviews, setUserReviews] = useState([]);
  const [favoriteMovies, setFavoriteMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('reviews');
  const [editingBio, setEditingBio] = useState(false);
  const [bio, setBio] = useState('');
  const [stats, setStats] = useState({
    totalReviews: 0,
    averageRating: 0,
    favoriteMovies: 0,
    memberSince: ''
  });

  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const [reviewsData, favoritesData] = await Promise.all([
        getUserReviews(),
        getUserFavorites()
      ]);

      setUserReviews(reviewsData || []);
      setFavoriteMovies(favoritesData || []);
      
      // Calculate stats
      const totalReviews = reviewsData?.length || 0;
      const avgRating = totalReviews > 0 
        ? reviewsData.reduce((sum, review) => sum + review.rating, 0) / totalReviews 
        : 0;
      
      setStats({
        totalReviews,
        averageRating: avgRating.toFixed(1),
        favoriteMovies: favoritesData?.length || 0,
        memberSince: user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Recently'
      });
    } catch (error) {
      setError('Failed to load user data');
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateBio = async () => {
    try {
      console.log('Updating bio:', bio);
      setEditingBio(false);
    } catch (error) {
      console.error('Error updating bio:', error);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    try {
      await deleteReview(reviewId);
      setUserReviews(userReviews.filter(review => review._id !== reviewId));
    } catch (error) {
      console.error('Error deleting review:', error);
    }
  };

  if (loading) {
    return (
      <div className="profile-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-page">
        <div className="error-message">
          <h3>Error loading profile</h3>
          <p>{error}</p>
          <button onClick={fetchUserData}>Try again</button>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="profile-page">
        <div className="auth-required">
          <User size={48} />
          <h3>Please log in</h3>
          <p>Log in to view your profile and manage your reviews.</p>
          <Link to="/login" className="btn-primary">Login</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="profile-container">
        {/* Profile Header */}
        <div className="profile-header">
          <div className="profile-avatar">
            <User size={80} />
          </div>
          <div className="profile-info">
            <h1>{user?.email || 'User'}</h1>
            <div className="profile-stats">
              <div className="stat">
                <MessageCircle size={16} />
                <span>{stats.totalReviews} Reviews</span>
              </div>
              <div className="stat">
                <Star size={16} />
                <span>{stats.averageRating} Avg Rating</span>
              </div>
              <div className="stat">
                <Heart size={16} />
                <span>{stats.favoriteMovies} Favorites</span>
              </div>
              <div className="stat">
                <Clock size={16} />
                <span>Member since {stats.memberSince}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bio Section */}
        <div className="bio-section">
          <div className="bio-header">
            <h3>About Me</h3>
            {!editingBio && (
              <button onClick={() => setEditingBio(true)} className="edit-btn">
                <Edit3 size={16} />
                Edit Bio
              </button>
            )}
          </div>
          {editingBio ? (
            <div className="bio-edit">
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell us about yourself..."
                maxLength={500}
                rows={4}
              />
              <div className="bio-actions">
                <button onClick={updateBio} className="save-btn">Save</button>
                <button onClick={() => setEditingBio(false)} className="cancel-btn">Cancel</button>
              </div>
            </div>
          ) : (
            <p className="bio-text">
              {bio || "No bio added yet. Click edit to add one!"}
            </p>
          )}
        </div>

        {/* Tabs */}
        <div className="profile-tabs">
          <button 
            className={`tab-btn ${activeTab === 'reviews' ? 'active' : ''}`}
            onClick={() => setActiveTab('reviews')}
          >
            <MessageCircle size={16} />
            My Reviews ({stats.totalReviews})
          </button>
          <button 
            className={`tab-btn ${activeTab === 'favorites' ? 'active' : ''}`}
            onClick={() => setActiveTab('favorites')}
          >
            <Heart size={16} />
            Favorites ({stats.favoriteMovies})
          </button>
        </div>

        {/* Content */}
        <div className="profile-content">
          {activeTab === 'reviews' && (
            <div className="reviews-section">
              {userReviews.length === 0 ? (
                <div className="empty-state">
                  <MessageCircle size={48} />
                  <h3>No reviews yet</h3>
                  <p>Start reviewing movies to see them here!</p>
                </div>
              ) : (
                userReviews.map(review => (
                  <div key={review._id} className="review-item">
                    <div className="review-movie">
                      <Link to={`/movie/${review.movieId}`}>
                        {review.movieTitle}
                      </Link>
                    </div>
                    <div className="review-rating">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={16} className={i < review.rating ? 'filled' : ''} />
                      ))}
                    </div>
                    <p className="review-text">{review.text}</p>
                    <div className="review-actions">
                      <button 
                        onClick={() => deleteReview(review._id)}
                        className="delete-btn"
                      >
                        <Trash2 size={14} />
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'favorites' && (
            <div className="favorites-section">
              {favoriteMovies.length === 0 ? (
                <div className="empty-state">
                  <Heart size={48} />
                  <h3>No favorites yet</h3>
                  <p>Add movies to your favorites to see them here!</p>
                </div>
              ) : (
                <div className="movies-grid">
                  {favoriteMovies.map(movie => (
                    <div key={movie.id} className="movie-card">
                      <Link to={`/movie/${movie.id}`}>
                        <img 
                          src={movie.poster_path 
                            ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` 
                            : '/placeholder-movie.jpg'} 
                          alt={movie.title} 
                        />
                        <h3>{movie.title}</h3>
                        <p>{new Date(movie.release_date).getFullYear()}</p>
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;