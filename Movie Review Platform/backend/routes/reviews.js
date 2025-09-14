const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Review = require('../models/Review');
const { check, validationResult } = require('express-validator');
router.get('/:tmdbMovieId', async (req, res) => {
  try {
    const reviews = await Review.find({ tmdbMovieId: req.params.tmdbMovieId }).populate('userId', 'username');
    res.json(reviews);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/reviews/:tmdbMovieId
// @desc    Submit a new review for a movie
// @access  Private
router.post(
  '/:tmdbMovieId',
  [auth, [check('rating', 'Rating is required and must be a number between 1 and 5').not().isEmpty().isInt({ min: 1, max: 5 }), check('comment', 'Review text is required').not().isEmpty()]],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { rating, comment, movieTitle } = req.body;

    try {
      const newReview = new Review({
        userId: req.user.id,
        tmdbMovieId: req.params.tmdbMovieId,
        movieTitle,
        rating,
        reviewText: comment,
      });

      const review = await newReview.save();

      res.json(review);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

module.exports = router;