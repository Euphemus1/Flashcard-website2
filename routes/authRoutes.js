const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Your User model
const nodemailer = require('nodemailer'); // For sending emails
const bcrypt = require('bcrypt');

// Nodemailer setup for sending emails
const transporter = nodemailer.createTransport({
  service: 'Gmail', // Use your email service (e.g., Gmail, SendGrid)
  auth: {
    user: process.env.EMAIL_USER, // Your email
    pass: process.env.EMAIL_PASS, // Your email password
  },
});

// Registration Route
router.post('/register', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    // Create new user
    const user = new User({ email, password });
    await user.save();

    // Generate email verification token
    const verificationToken = jwt.sign({ sub: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    const verificationLink = `http://yourwebsite.com/verify-email?token=${verificationToken}`;

    // Send verification email
    await transporter.sendMail({
      to: user.email,
      subject: 'Verify Your Email',
      html: `Click <a href="${verificationLink}">here</a> to verify your email.`,
    });

    res.json({ message: 'Registration successful. Please check your email to verify your account.' });
  } catch (err) {
    next(err);
  }
});

// Login Route
router.post('/login', (req, res, next) => {
  passport.authenticate('local', { session: false }, (err, user, info) => {
    if (err) return next(err);
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    // Generate JWT token
    const token = jwt.sign({ sub: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Set cookie for "Remember Me" functionality
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // HTTPS only in production
      maxAge: req.body.rememberMe ? 7 * 24 * 60 * 60 * 1000 : null, // 7 days if "Remember Me" is checked
    };
    res.cookie('jwt', token, cookieOptions);

    res.json({ token });
  })(req, res, next);
});

// Password Reset Route
router.post('/forgot-password', async (req, res, next) => {
  try {
    const { email } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Generate password reset token
    const resetToken = jwt.sign({ sub: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    // Send password reset email
    const resetLink = `http://yourwebsite.com/reset-password?token=${resetToken}`;
    await transporter.sendMail({
      to: user.email,
      subject: 'Password Reset',
      html: `Click <a href="${resetLink}">here</a> to reset your password.`,
    });

    res.json({ message: 'Password reset email sent. Please check your email.' });
  } catch (err) {
    next(err);
  }
});

// Email Verification Route
router.get('/verify-email', async (req, res, next) => {
  try {
    const { token } = req.query;

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.sub);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Mark user as verified
    user.isVerified = true;
    await user.save();

    res.json({ message: 'Email verified successfully.' });
  } catch (err) {
    next(err);
  }
});

// Protected Route Example
router.get('/dashboard', passport.authenticate('jwt', { session: false }), (req, res) => {
  res.json({ message: 'Welcome to the dashboard!', user: req.user });
});

// In your login route after successful authentication
if (user.email === 'julianjdantas@live.nl') {
  user.isAdmin = true;
  await user.save();
}

// Return admin status in response
res.json({ 
  token,
  user: {
    email: user.email,
    isAdmin: user.isAdmin
  }
});

module.exports = router;