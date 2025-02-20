import express from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import nodemailer from 'nodemailer';
import bcrypt from 'bcrypt';

const router = express.Router();

// Nodemailer setup
const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Registration Route
router.post('/register', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const existingUser = await User.findOne({ email });
    
    if (existingUser) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    const user = new User({ email, password });
    await user.save();

    // Generate verification token
    const verificationToken = jwt.sign({ sub: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    const verificationLink = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;

    await transporter.sendMail({
      to: user.email,
      subject: 'Verify Your Email',
      html: `Click <a href="${verificationLink}">here</a> to verify your email.`,
    });

    res.json({ message: 'Registration successful. Please check your email.' });
  } catch (err) {
    next(err);
  }
});

// Login Route
router.post('/login', (req, res, next) => {
  passport.authenticate('local', { session: false }, async (err, user, info) => {
    try {
      if (err || !user) return res.status(401).json({ error: 'Invalid credentials' });

      // Admin check
      if (user.email === 'julianjdantas@live.nl') {
        user.isAdmin = true;
        await user.save();
      }

      const token = jwt.sign({ sub: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
      
      res.cookie('jwt', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: req.body.rememberMe ? 604800000 : null // 7 days
      });

      res.json({ 
        token,
        user: {
          email: user.email,
          isAdmin: user.isAdmin
        }
      });
    } catch (error) {
      next(error);
    }
  })(req, res, next);
});

// Password Reset Route
router.post('/forgot-password', async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    
    if (!user) return res.status(404).json({ error: 'User not found' });

    const resetToken = jwt.sign({ sub: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000;
    await user.save();

    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    await transporter.sendMail({
      to: user.email,
      subject: 'Password Reset',
      html: `Click <a href="${resetLink}">here</a> to reset your password.`,
    });

    res.json({ message: 'Password reset email sent' });
  } catch (err) {
    next(err);
  }
});

// Email Verification Route
router.get('/verify-email', async (req, res, next) => {
  try {
    const { token } = req.query;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.sub);

    if (!user) return res.status(404).json({ error: 'User not found' });

    user.isVerified = true;
    await user.save();
    res.json({ message: 'Email verified successfully' });
  } catch (err) {
    next(err);
  }
});

// Protected Route
router.get('/dashboard', passport.authenticate('jwt', { session: false }), (req, res) => {
  res.json({ message: 'Welcome to dashboard', user: req.user });
});

export default router;