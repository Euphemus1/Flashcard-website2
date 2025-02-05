const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const authRoutes = require('./routes/authRoutes');
const path = require('path');
const cors = require('cors');
const nodemailer = require('nodemailer');
require('dotenv').config();


const app = express();

// Nodemailer setup for sending emails
const transporter = nodemailer.createTransport({
  service: 'Gmail', // Use your email service (e.g., Gmail, SendGrid)
  auth: {
    user: process.env.EMAIL_USER, // Your email
    pass: process.env.EMAIL_PASS, // Your email password
  },
});

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Initialize passport
app.use(passport.initialize());
require('./config/passport'); // Load passport configuration

// Validate environment variables
const requiredEnvVars = ['MONGODB_URI', 'JWT_SECRET', 'EMAIL_USER', 'EMAIL_PASS'];
requiredEnvVars.forEach(envVar => {
  if (!process.env[envVar]) {
    console.error(`Missing required environment variable: ${envVar}`);
    process.exit(1);
  }
});

// Root route for testing server status
app.get('/', (req, res) => {
  res.send('/api/health-check');
});

// Security middleware
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"], // Allow only your domain
        scriptSrc: ["'self'", 'trusted-cdn.com'], // Allow scripts from your domain and a trusted CDN
        styleSrc: ["'self'", 'fonts.googleapis.com'], // Allow styles from your domain and Google Fonts
      },
    },
    hsts: {
      maxAge: 31536000, // 1 year in seconds
      includeSubDomains: true,
      preload: true,
    },
    referrerPolicy: { policy: 'same-origin' },
  })
);

// Logging (development only)
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// CORS Configuration
const allowedOrigins = [
  'http://localhost:10000', // Local development
  'https://euphemus1.github.io/Flashcard-website/', // Production (GitHub Pages)
];

app.use(cors({
  origin: (origin, callback) => {
    if (allowedOrigins.includes(origin) || !origin) {
      callback(null, true); // Allow the request
    } else {
      callback(new Error('Not allowed by CORS')); // Block the request
    }
  },
  credentials: true, // Allow cookies/auth headers
}));

// Body parsing middleware
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Rate limiting
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 200,  // Adjust based on expected traffic
});
app.use(globalLimiter); // Apply to all routes

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use('/auth', authLimiter);

// Database connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Routes
app.use('/auth', authRoutes);
app.use('/dashboard', express.static(path.join(__dirname, 'protected')));

// Protected route example
app.get('/api/protected', passport.authenticate('jwt', { session: false }), (req, res) => {
  res.json({ message: 'Protected route accessed', user: req.user });
});

// User route example
app.get('/api/user', passport.authenticate('jwt', { session: false }), (req, res) => {
  res.json({ email: req.user.email });
});

// Public routes
app.get('/api/health-check', (req, res) => {
  res.json({ 
    status: 'active',
    message: 'Backend connected to MongoDB!',
    timestamp: new Date().toISOString()
  });
});

// Error handling
app.use((req, res) => res.status(404).json({ error: 'Route not found' }));
app.use((err, req, res, next) => {
  console.error(err.stack);

  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }

  res.status(500).json({ error: 'Internal Server Error' });
});


const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});