// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Registration route (unchanged)
router.post('/register', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    const user = new User({ email, password });
    await user.save();

    const token = jwt.sign(
      { sub: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({ token });
  } catch (err) {
    next(err); // Pass errors to the error handler
  }
});

// Login route using passport
router.post('/login', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) return next(err);
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    req.login(user, { session: false }, (err) => {
      if (err) return next(err);

      const token = jwt.sign(
        { sub: user._id },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      res.cookie('jwt', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });
      res.redirect('/dashboard'); // Redirect to dashboard
    });
  })(req, res, next);
});

module.exports = router;