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

// Login
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    
    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });
    
    const token = jwt.sign(
      { sub: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    
    res.cookie('jwt', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });
    res.redirect('/dashboard'); // Redirect to dashboard
  } catch (err) {
    next(err); // Pass errors to the error handler
  }
});

module.exports = router;