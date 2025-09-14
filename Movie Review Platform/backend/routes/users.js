const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const Review = require('../models/Review');
const { check, validationResult } = require('express-validator');

// @route   GET api/users/:id
// @desc    Retrieve user profile and review history
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    const reviews = await Review.find({ userId: req.params.id }).populate('movieId', 'title posterURL');

    res.json({ user, reviews });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/users/:id
// @desc    Update user profile
// @access  Private
router.put(
  '/:id',
  [auth, [check('username', 'Username is required').not().isEmpty(), check('email', 'Please include a valid email').isEmail()]],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
  const { username, email, profilePicture } = req.body;

  // Build user object
  const userFields = {};
  if (username) userFields.username = username;
  if (email) userFields.email = email;
  if (profilePicture) userFields.profilePicture = profilePicture;

  try {
    let user = await User.findById(req.params.id);

    if (!user) return res.status(404).json({ msg: 'User not found' });

    // Make sure user owns profile
    if (user._id.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: userFields },
      { new: true }
    ).select('-password');

    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;