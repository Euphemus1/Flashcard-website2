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
    // Validate required fields
    const requiredFields = ['type', 'question', 'answer', 'deck', 'subdeck'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        error: `Missing required fields: ${missingFields.join(', ')}`
      });
    }

    // Validate card type
    if (!['Clasic', 'multipleChoice'].includes(req.body.type)) {
      return res.status(400).json({ error: 'Invalid card type' });
    }

    let processedCorrectIndex = -1;
    let processedOptions = [];

    // Process multiple choice cards
    if (req.body.type === 'multipleChoice') {
      // Convert options to array if it's a string
      if (typeof req.body.options === 'string') {
        processedOptions = req.body.options.split('\n')
          .map(opt => opt.trim())
          .filter(opt => opt !== '');
      } else {
        processedOptions = req.body.options.map(opt => opt.trim())
                          .filter(opt => opt !== '');
      }

      // Validate options array
      if (processedOptions.length < 2) {
        return res.status(400).json({
          error: 'Multiple choice requires at least 2 options'
        });
      }

      if (processedOptions.length > 6) {
        return res.status(400).json({
          error: 'Maximum 6 options allowed'
        });
      }

      // Validate and convert correctIndex
      const rawIndex = req.body.correctIndex;
      const parsedIndex = parseInt(rawIndex, 10);
      
      if (isNaN(parsedIndex)) {
        return res.status(400).json({
          error: 'Correct answer index must be a number'
        });
      }

      if (parsedIndex < 0 || parsedIndex >= processedOptions.length) {
        return res.status(400).json({
          error: `Invalid correct index. Must be between 0 and ${processedOptions.length - 1}`
        });
      }

      processedCorrectIndex = parsedIndex;
    }

    // Clean and format data
    const flashcardData = {
      type: req.body.type,
      question: req.body.question.trim(),
      answer: req.body.type === 'multipleChoice' 
              ? processedOptions[processedCorrectIndex] 
              : req.body.answer.trim(),
      deck: req.body.deck.trim().replace(/\s+/g, ' '),
      subdeck: req.body.subdeck.trim(),
      options: processedOptions,
      correctIndex: processedCorrectIndex,
      subtitle: req.body.subtitle?.trim() || '',
      extraInfo: req.body.extraInfo?.trim() || '',
      references: Array.isArray(req.body.references) 
                ? req.body.references.map(r => r.trim()) 
                : [],
      tags: Array.isArray(req.body.tags) 
          ? req.body.tags.map(t => t.trim()) 
          : []
    };

    // Create the flashcard
    const flashcard = await Flashcard.create(flashcardData);
    res.status(201).json(flashcard);

  } catch (error) {
    console.error('Error:', error);
    res.status(400).json({ 
      error: `Server error: ${error.message}` 
    });
  }
});

app.get('/api/flashcards', async (req, res) => {
  try {
    const query = {
      deck: req.query.deck,
      subdeck: req.query.subdeck
    };

    // Clean query parameters
    Object.keys(query).forEach(key => {
      if (!query[key]) delete query[key];
      else query[key] = query[key].trim();
    });

    // Fetch cards with lean() for better performance
    const flashcards = await Flashcard.find(query)
      .lean()
      .select('-__v -createdAt -updatedAt');

    // Format response for different card types
    const formattedCards = flashcards.map(card => {
      if (card.type === 'multipleChoice') {
        return {
          ...card,
          options: card.options || [],
          correctIndex: card.correctIndex || -1
        };
      }
      return card;
    });

    res.json(formattedCards);
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