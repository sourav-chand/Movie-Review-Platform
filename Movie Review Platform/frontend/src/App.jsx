import { BrowserRouter, Routes, Route } from 'react-router-dom';

// pages & components
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import MovieDetail from './pages/MovieDetail';
import Profile from './pages/Profile';
import Watchlist from './pages/Watchlist';
import Navbar from './components/Navbar';
import SearchResults from './pages/SearchResults';

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <Navbar />
        <div className="pages">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/movie/:id" element={<MovieDetail />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/watchlist" element={<Watchlist />} />
            <Route path="/search" element={<SearchResults />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
