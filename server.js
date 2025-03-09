import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import mongoose from 'mongoose';
import passport from 'passport';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import authRoutes from './routes/authRoutes.js';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import nodemailer from 'nodemailer';
import crypto from 'crypto';
import Flashcard from './models/Flashcard.js';
import User from './models/User.js';
import configurePassport from './config/passport.js';

// Configure __dirname equivalent for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Environment variables validation
const requiredEnvVars = ['MONGODB_URI', 'JWT_SECRET', 'EMAIL_USER', 'EMAIL_PASS', 'FRONTEND_URL'];
requiredEnvVars.forEach(envVar => {
  if (!process.env[envVar]) {
    console.error(`Missing required environment variable: ${envVar}`);
    process.exit(1);
  }
});

// Initialize passport
app.use(passport.initialize());
configurePassport(passport);

// Nodemailer setup
const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", 'trusted-cdn.com'],
      styleSrc: [
        "'self'",
        'fonts.googleapis.com',    // Google Fonts
        'cdnjs.cloudflare.com',    // Font Awesome
      ],
      connectSrc: [
        "'self'",
        'https://medical-decks-backend.onrender.com', // Your backend
        'http://localhost:10000'   // For local development
      ],
      imgSrc: ["'self'", 'data:'], // Allow images from self and data URLs
      fontSrc: [
        "'self'",
        'fonts.gstatic.com',       // Google Fonts
        'cdnjs.cloudflare.com' // For Font Awesome fonts
      ]
    }
  },
  hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
  referrerPolicy: { policy: 'same-origin' }
}));

// Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// CORS configuration
app.use(cors({
  origin: (origin, callback) => {
    const allowedOrigins = [
      'http://localhost:10000',
      'http://localhost:3000',
      'https://euphemus2.github.io/Flashcard-website/',
      'https://medical-decks-backend.onrender.com'
    ];
    callback(null, allowedOrigins.includes(origin) || !origin ? null : new Error('CORS blocked'));
  },
  credentials: true
}));

// Serve static files
app.use(express.static(path.join(process.cwd(), 'public')));

// Body parsing
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Rate limiting
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 200 }));
app.use('/auth', rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));

// Database connection
mongoose.connect(process.env.MONGODB_URI, { 
  dbName: "Flashcards-database"   
})
  .then(() => {
    console.log('MongoDB connected');
    const PORT = process.env.PORT || 10000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Routes
app.use('/auth', authRoutes);

// Email verification endpoints
app.post('/auth/send-verification-email', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const token = crypto.randomBytes(20).toString('hex');
    user.verificationToken = token;
    await user.save();

    await transporter.sendMail({
      from: 'no-reply@meddecks.com',
      to: user.email,
      subject: 'Verify Your Email',
      html: `<p>Verify email: ${process.env.FRONTEND_URL}/verify?token=${token}</p>`
    });

    res.json({ message: 'Verification email sent' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to send verification email' });
  }
});

// Password reset endpoints
app.post('/auth/request-password-reset', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const token = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000;
    await user.save();

    await transporter.sendMail({
      from: 'no-reply@meddecks.com',
      to: user.email,
      subject: 'Password Reset',
      html: `<p>Reset password: ${process.env.FRONTEND_URL}/reset-password?token=${token}</p>`
    });

    res.json({ message: 'Password reset email sent' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to send reset email' });
  }
});

// Dashboard routes
app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(process.cwd(), 'protected', 'dashboard.html'));
});

app.get('/dashboard.html', (req, res) => {
  res.sendFile(path.join(process.cwd(), 'protected', 'dashboard.html'));
});

app.use('/protected', express.static(path.join(process.cwd(), 'protected')));

// Route for ERA1 page
app.get('/patologia', (req, res) => {
  res.sendFile(path.join(__dirname, 'protected/patologia.html'));
});

// Route for ERA1 page
app.get('/patologia-era1', (req, res) => {
  res.sendFile(path.join(__dirname, 'protected/patologia-era1.html'));
});

// Route for ERA2 page
app.get('/patologia-era2', (req, res) => {
  res.sendFile(path.join(__dirname, 'protected/patologia-era2.html'));
});

// Route for ERA3 page
app.get('/patologia-era3', (req, res) => {
  res.sendFile(path.join(__dirname, 'protected/patologia-era3.html'));
});

// API endpoints
const isAdmin = (req, res, next) => {
  if (req.user?.isAdmin) return next();
  res.status(403).json({ error: 'Admin access required' });
};

//app.post('/api/flashcards', 
//passport.authenticate('jwt', { session: false }), // Keep JWT auth
//  async (req, res) => { // Remove isAdmin check temporarily
//    try {
      // Add admin check INSIDE the route handler
 //     if (!req.user.isAdmin) {
 //       return res.status(403).json({ error: "Admin access required" });
 //     }

 //     const flashcard = await Flashcard.create({ 
     //   deck: req.query.deck,
   //     subdeck: req.query.subdeck // Add this line
//        createdBy: req.user._id 
  //    });
  //    res.status(201).json(flashcard);
 //   } catch (error) {
  //    res.status(400).json({ error: error.message });
  //  }
//});

app.post('/api/flashcards', async (req, res) => {
  try {
      if (!req.body.question || !req.body.answer || !req.body.deck || !req.body.subdeck) {
          return res.status(400).json({ 
              error: "Missing required fields: question, answer, deck, subdeck" 
          });
      }

    const cleanDeck = req.body.deck
      .trim()
      .replace(/\s+/g, ' ');

    const flashcardData = {
      ...req.body,
      deck: cleanDeck,
      subtitle: req.body.subtitle || '' // Ensure subtitle exists
    };

    console.log('Processed data:', flashcardData); // Verify data

    const flashcard = await Flashcard.create(flashcardData);
    res.status(201).json(flashcard);
  } catch (error) {
    console.error('Full error:', error);
    res.status(400).json({ 
      error: `Server error: ${error.message}` 
    });
  }
});

app.get('/api/flashcards', async (req, res) => { // Removed passport.authenticate
  try {
    // 1. Create a query object with both deck and subdeck
    const query = {
      deck: req.query.deck,
      subdeck: req.query.subdeck // Add subdeck filtering
    };

    // 2. Clean undefined parameters
    Object.keys(query).forEach(key => {
      if (query[key] === undefined) delete query[key];
    });

    // 3. Find cards with the combined query
    const flashcards = await Flashcard.find(query);
    
    res.json(flashcards);
  } catch (error) {
    res.status(500).json({ 
      error: `Failed to load cards: ${error.message}` 
    });
  }
});

// Add this with your other API endpoints (around line 296 in your file)
app.get('/api/flashcards/count', async (req, res) => {
  try {
    const { deck, subdeck } = req.query;
    
    const newCards = await Flashcard.countDocuments({
      deck,
      subdeck,
      lastReview: { $exists: false }
    });

    const dueCards = await Flashcard.countDocuments({
      deck,
      subdeck,
      lastReview: { $lte: Date.now() }
    });

    res.json({ newCards, dueCards });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Health check
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
  res.status(err.status || 500).json({ 
    error: err.message || 'Internal Server Error' 
  });
});