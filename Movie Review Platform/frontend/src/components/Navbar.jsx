import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import SearchBar from './SearchBar';
import { AuthContext } from '../context/AuthContext.jsx';
import { LogOut, User, Home, Film } from 'lucide-react';

const Navbar = () => {
  const { user, dispatch } = useContext(AuthContext);

  const handleLogout = () => {
    localStorage.removeItem('token');
    dispatch({ type: 'LOGOUT' });
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          <span className="logo-text">MovieReview</span>
        </Link>
        
        <div className="nav-search">
          <SearchBar />
        </div>

        <div className="nav-menu">
          <Link to="/" className="nav-link">
            <Home size={16} />
            Home
          </Link>
          
          {user ? (
            <>
              <Link to="/watchlist" className="nav-link">
                <Film size={16} />
                Watchlist
              </Link>
              <Link to="/profile" className="nav-link">
                <User size={16} />
                Profile
              </Link>
              <button onClick={handleLogout} className="nav-link logout-btn">
                <LogOut size={16} />
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link">Login</Link>
              <Link to="/signup" className="nav-link signup-btn">Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;