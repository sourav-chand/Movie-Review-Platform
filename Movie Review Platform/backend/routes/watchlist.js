const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Watchlist = require('../models/Watchlist');

// @route   GET api/users/:id/watchlist
// @desc    Retrieve user's watchlist
// @access  Private
router.get('/:id/watchlist', auth, async (req, res) => {
  try {
    if (req.user.id !== req.params.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }
    const watchlist = await Watchlist.find({ userId: req.params.id }).populate('movieId', 'title posterURL');
    res.json(watchlist);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/users/:id/watchlist
// @desc    Add movie to watchlist
// @access  Private
router.post('/:id/watchlist', auth, async (req, res) => {
  try {
    if (req.user.id !== req.params.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }
    const { movieId } = req.body;

    // Check if movie exists
    const movie = await Movie.findById(movieId);
    if (!movie) {
      return res.status(404).json({ msg: 'Movie not found' });
    }

    // Check if already in watchlist
    let watchlistEntry = await Watchlist.findOne({ userId: req.user.id, movieId });
    if (watchlistEntry) {
      return res.status(400).json({ msg: 'Movie already in watchlist' });
    }

    watchlistEntry = new Watchlist({
      userId: req.user.id,
      movieId,
    });

    await watchlistEntry.save();
    res.json(watchlistEntry);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/users/:id/watchlist/:movieId
// @desc    Remove movie from watchlist
// @access  Private
router.delete('/:id/watchlist/:movieId', auth, async (req, res) => {
  try {
    if (req.user.id !== req.params.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    const watchlistEntry = await Watchlist.findOneAndRemove({
      userId: req.user.id,
      movieId: req.params.movieId,
    });

    if (!watchlistEntry) {
      return res.status(404).json({ msg: 'Movie not found in watchlist' });
    }

    res.json({ msg: 'Movie removed from watchlist' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/watchlist/:tmdbMovieId
// @desc    Check if movie is in user's watchlist
// @access  Private
router.get('/:tmdbMovieId', auth, async (req, res) => {
  try {
    const watchlistEntry = await Watchlist.findOne({ userId: req.user.id, tmdbMovieId: req.params.tmdbMovieId });
    res.json({ isInWatchlist: !!watchlistEntry });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/watchlist/:tmdbMovieId
// @desc    Add movie to watchlist
// @access  Private
router.post('/:tmdbMovieId', auth, async (req, res) => {
  try {
    const { movieTitle } = req.body;
    const tmdbMovieId = req.params.tmdbMovieId;

    // Check if already in watchlist
    let watchlistEntry = await Watchlist.findOne({ userId: req.user.id, tmdbMovieId });
    if (watchlistEntry) {
      return res.status(400).json({ msg: 'Movie already in watchlist' });
    }

    watchlistEntry = new Watchlist({
      userId: req.user.id,
      tmdbMovieId,
      movieTitle,
    });

    await watchlistEntry.save();
    res.json(watchlistEntry);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/watchlist/:tmdbMovieId
// @desc    Remove movie from watchlist
// @access  Private
router.delete('/:tmdbMovieId', auth, async (req, res) => {
  try {
    const watchlistEntry = await Watchlist.findOneAndRemove({
      userId: req.user.id,
      tmdbMovieId: req.params.tmdbMovieId,
    });

    if (!watchlistEntry) {
      return res.status(404).json({ msg: 'Movie not found in watchlist' });
    }

    res.json({ msg: 'Movie removed from watchlist' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/watchlist
// @desc    Get all movies in user's watchlist
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const watchlist = await Watchlist.find({ userId: req.user.id }).select('-_id tmdbMovieId movieTitle');
    res.json(watchlist);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;