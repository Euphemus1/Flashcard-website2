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
import fs from 'fs';

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
      scriptSrc: [
        "'self'", 
        'trusted-cdn.com', 
        "'unsafe-inline'", 
        "'unsafe-eval'"
      ],
      styleSrc: [
        "'self'",
        'fonts.googleapis.com',
        'cdnjs.cloudflare.com',
        "'unsafe-inline'"
      ],
      connectSrc: [
        "'self'",
        'https://medical-decks-backend.onrender.com',
        'http://localhost:10000'
      ],
      imgSrc: ["'self'", 'data:'],
      fontSrc: [
        "'self'",
        'fonts.gstatic.com',
        'cdnjs.cloudflare.com'
      ],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: []
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

// Add middleware to log static file requests
app.use((req, res, next) => {
  if (req.path.includes('.css') || req.path.includes('.js')) {
    console.log(`Serving static file: ${req.path}`);
  }
  next();
});

// Body parsing
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Rate limiting
const generalLimiter = rateLimit({ 
  windowMs: 15 * 60 * 1000, // 15 minutes 
  max: 500, // increased from 200
  message: "Too many requests, please try again later",
  standardHeaders: true,
  legacyHeaders: false
});

const authLimiter = rateLimit({ 
  windowMs: 15 * 60 * 1000, 
  max: 100,
  message: "Too many authentication attempts, please try again later", 
  standardHeaders: true,
  legacyHeaders: false
});

const apiLimiter = rateLimit({ 
  windowMs: 1 * 60 * 1000, // 1 minute 
  max: 200, // higher limit for API calls
  message: "Too many API requests, please try again later",
  standardHeaders: true,
  legacyHeaders: false
});

// Apply rate limiters
app.use(generalLimiter); // General rate limiting for all routes
app.use('/auth', authLimiter); // Specific rate limiting for auth routes
app.use('/api', apiLimiter); // Specific rate limiting for API routes

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
  res.redirect('/dashboard');
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

// Dynamic deck route - add this after the existing static routes
app.get('/deck/:deckName', (req, res) => {
  console.log(`Serving dynamic deck page for: ${req.params.deckName}`);
  const fullPath = path.join(__dirname, 'protected', 'deck-template.html');
  console.log(`Attempting to serve file at: ${fullPath}`);
  
  try {
    if (fs.existsSync(fullPath)) {
      res.sendFile(fullPath);
    } else {
      console.error(`File not found: ${fullPath}`);
      res.status(404).send(`Template file not found. Please check server logs.`);
    }
  } catch (error) {
    console.error(`Error serving dynamic deck page: ${error.message}`);
    res.status(500).send(`Server error: ${error.message}`);
  }
});

// API endpoints
const isAdmin = (req, res, next) => {
  if (req.user?.isAdmin) return next();
  res.status(403).json({ error: 'Admin access required' });
};

// New API endpoint to get subdecks for a specific deck
app.get('/api/decks/:deckName/subdecks', async (req, res) => {
  try {
    const { deckName } = req.params;
    
    console.log('API - Requested subdecks for deck:', deckName);
    
    if (!deckName) {
      console.error('API - Missing deck name parameter');
      return res.status(400).json({ error: 'Deck name is required' });
    }
    
    const decodedDeckName = decodeURIComponent(deckName);
    console.log('API - Decoded deck name:', decodedDeckName);
    
    // Find all unique subdecks for the given deck
    const subdecks = await Flashcard.distinct('subdeck', { 
      deck: decodedDeckName
    });
    
    console.log(`API - Found ${subdecks.length} subdecks for deck:`, decodedDeckName);
    console.log('API - Raw subdecks:', subdecks);
    
    // Filter out empty subdecks
    let validSubdecks = subdecks.filter(subdeck => subdeck && subdeck.trim() !== '');
    
    console.log(`API - Filtered to ${validSubdecks.length} valid subdecks`);
    
    // If no subdecks found, check if we have predefined ones in our decks structure
    if (validSubdecks.length === 0) {
      console.log('API - No subdecks found in database, checking hardcoded defaults');
      
      // Hardcoded deck structure (similar to what's in dashboard-script.js)
      const defaultDecks = {
        'Microbiología': ['Bacterias', 'Hongos', 'Parásitos', 'Virus'],
        'Patología': ['Metabolopatías', 'Inflamación', 'Neoplasias', 'Cardiovascular', 'Respiratorio', 'Digestivo', 'Aparato urinario', 'Aparato reproductor', 'Piel', 'Huesos y articulaciones', 'Sistema endocrino', 'Otros'],
        'Semiología': ['Historía clínica', 'Piel y faneras', 'Cabeza y cuello', 'Respiratorio', 'Cardiovascular', 'Digestivo', 'Urinario', 'Neurología', 'Osteoarticular'],
        'Farmacología': ['ERA1', 'ERA2'],
        'Terapéutica 1': ['ERA1', 'ERA2', 'ERA3'],
        'Medicina Interna 1': ['Neumonología', 'Cardiovascular', 'Tubo Digestivo', 'Neurología', 'Anexos'],
        'Revalida': ['Bling', 'Blang', 'Blong'],
        'MIR': ['Bling', 'Blang', 'Blong'],
      };
      
      // Check if we have default subdecks for this deck
      if (defaultDecks[decodedDeckName]) {
        validSubdecks = defaultDecks[decodedDeckName];
        console.log(`API - Using ${validSubdecks.length} default subdecks from hardcoded structure`);
      }
    }
    
    res.json(validSubdecks);
  } catch (error) {
    console.error('API - Error fetching subdecks:', error);
    res.status(500).json({ 
      error: 'Server error', 
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

app.post('/api/flashcards', async (req, res) => {
  try {
    // Log the incoming request body for debugging
    console.log('Received flashcard data:', JSON.stringify(req.body));
    
    // Validate required fields
    const requiredFields = ['type', 'question', 'answer', 'deck', 'subdeck'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        error: `Missing required fields: ${missingFields.join(', ')}`
      });
    }

    // Validate card type
    if (!['classic', 'multipleChoice'].includes(req.body.type)) {
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

    // Check if extraInfo exists and log it
    console.log('extraInfo from request:', req.body.extraInfo);

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

    // Add subsubdeck if it exists
    if (req.body.subsubdeck && req.body.subsubdeck.trim()) {
      flashcardData.subsubdeck = req.body.subsubdeck.trim();
    }

    // Log the final flashcard data before saving
    console.log('Flashcard data to be saved:', JSON.stringify(flashcardData));

    // Create the flashcard
    const flashcard = await Flashcard.create(flashcardData);
    console.log('Flashcard saved to MongoDB with ID:', flashcard._id);
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

    // Add support for subsubdeck if provided
    if (req.query.subsubdeck) {
      query.subsubdeck = req.query.subsubdeck.trim();
    }
    
    // Add support for type if provided (classic or multipleChoice)
    if (req.query.type) {
      query.type = req.query.type.trim();
    }

    // Clean query parameters
    Object.keys(query).forEach(key => {
      if (!query[key]) delete query[key];
      else query[key] = query[key].trim();
    });

    console.log(`API flashcards request with query:`, query);

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
    const { deck, subdeck, subsubdeck, type } = req.query;
    
    // Debug logging
    console.log(`📊 API CARD COUNT REQUEST for:`, { 
      deck, 
      subdeck, 
      subsubdeck, 
      type 
    });
    
    // Build query based on provided parameters
    const query = {};
    if (deck) query.deck = deck;
    if (subdeck) query.subdeck = subdeck;
    if (subsubdeck) query.subsubdeck = subsubdeck;
    if (type) query.type = type;
    
    console.log(`📊 MongoDB query for count: ${JSON.stringify(query)}`);
    
    // Get all matching cards to inspect them
    console.log(`📊 DEBUG: Getting actual cards for inspection...`);
    const actualCards = await Flashcard.find(query).lean();
    console.log(`📊 DEBUG: Found ${actualCards.length} matching cards in total`);
    
    if (actualCards.length > 0) {
      console.log(`📊 DEBUG: CARD DETAILS for ${subdeck || ''} > ${subsubdeck || ''}:`);
      actualCards.forEach((card, index) => {
        console.log(`📊 Card ${index + 1}:`, {
          id: card._id,
          question: card.question,
          type: card.type,
          deck: card.deck,
          subdeck: card.subdeck,
          subsubdeck: card.subsubdeck,
          hasLastReview: !!card.lastReview
        });
      });
    }
    
    // Count new cards
    const newCardsQuery = { ...query, lastReview: { $exists: false } };
    console.log(`📊 New cards query: ${JSON.stringify(newCardsQuery)}`);
    const newCards = await Flashcard.countDocuments(newCardsQuery);
    console.log(`📊 New cards count result: ${newCards}`);

    // Count due cards
    const dueCardsQuery = { ...query, lastReview: { $lte: Date.now() } };
    console.log(`📊 Due cards query: ${JSON.stringify(dueCardsQuery)}`);
    const dueCards = await Flashcard.countDocuments(dueCardsQuery);
    console.log(`📊 Due cards count result: ${dueCards}`);

    // Debug response
    console.log(`📊 API CARD COUNT RESPONSE for ${subdeck || ''} > ${subsubdeck || ''}: `, { newCards, dueCards });
    
    // Return response
    res.json({ newCards, dueCards });
  } catch (error) {
    console.error(`📊 ERROR in /api/flashcards/count: ${error.message}`);
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

// Add a route for the study page with deck, subdeck, and subsubdeck parameters
app.get('/study', (req, res) => {
  console.log(`Study page route with params:`, req.query);
  
  // Determine which page to redirect to based on type parameter
  const { type } = req.query;
  
  if (type === 'multipleChoice') {
    // Redirect to choice flashcard page
    console.log(`Redirecting to choice flashcard page due to multipleChoice type parameter`);
    const redirectUrl = `/choice-flashcard?${new URLSearchParams(req.query).toString()}`;
    return res.redirect(redirectUrl);
  } else if (type === 'classic' || !type) {
    // Redirect to classic flashcard page (default if no type specified)
    console.log(`Redirecting to classic flashcard page due to classic or no type parameter`);
    const redirectUrl = `/classic-flashcard?${new URLSearchParams(req.query).toString()}`;
    return res.redirect(redirectUrl);
  } else {
    // If we get here, it's an unknown type - serve the old study page for backward compatibility
    console.log(`Serving original study page due to unknown type: ${type}`);
    const fullPath = path.join(__dirname, 'protected', 'study-page.html');
    
    try {
      if (fs.existsSync(fullPath)) {
        res.sendFile(fullPath);
      } else {
        console.error(`File not found: ${fullPath}`);
        res.status(404).send(`Study page template file not found. Please check server logs.`);
      }
    } catch (error) {
      console.error(`Error serving study page: ${error.message}`);
      res.status(500).send(`Server error: ${error.message}`);
    }
  }
});

// Add routes for the classic and choice flashcard pages
app.get('/classic-flashcard', (req, res) => {
  console.log(`Serving classic flashcard page with params:`, req.query);
  const fullPath = path.join(__dirname, 'protected', 'classic-flashcard.html');
  console.log(`Attempting to serve file at: ${fullPath}`);
  
  try {
    if (fs.existsSync(fullPath)) {
      res.sendFile(fullPath);
    } else {
      console.error(`File not found: ${fullPath}`);
      res.status(404).send(`Classic flashcard template file not found. Please check server logs.`);
    }
  } catch (error) {
    console.error(`Error serving classic flashcard page: ${error.message}`);
    res.status(500).send(`Server error: ${error.message}`);
  }
});

app.get('/choice-flashcard', (req, res) => {
  console.log(`Serving choice flashcard page with params:`, req.query);
  const fullPath = path.join(__dirname, 'protected', 'choice-flashcard.html');
  console.log(`Attempting to serve file at: ${fullPath}`);
  
  try {
    if (fs.existsSync(fullPath)) {
      res.sendFile(fullPath);
    } else {
      console.error(`File not found: ${fullPath}`);
      res.status(404).send(`Choice flashcard template file not found. Please check server logs.`);
    }
  } catch (error) {
    console.error(`Error serving choice flashcard page: ${error.message}`);
    res.status(500).send(`Server error: ${error.message}`);
  }
});

// Add a debug endpoint to get all cards for a specific deck/subdeck/subsubdeck combination
app.get('/api/debug/cards', async (req, res) => {
  try {
    const { deck, subdeck, subsubdeck } = req.query;
    
    console.log(`📊 DEBUG: Querying all cards for:`, { deck, subdeck, subsubdeck });
    
    const query = {};
    if (deck) query.deck = deck;
    if (subdeck) query.subdeck = subdeck;
    if (subsubdeck) query.subsubdeck = subsubdeck;
    
    console.log(`📊 DEBUG: MongoDB query: ${JSON.stringify(query)}`);
    
    // Get all matching cards
    const cards = await Flashcard.find(query).lean();
    
    console.log(`📊 DEBUG: Found ${cards.length} cards`);
    
    // Group cards by type
    const cardsByType = {};
    for (const card of cards) {
      const type = card.type || 'unknown';
      if (!cardsByType[type]) cardsByType[type] = [];
      cardsByType[type].push(card);
    }
    
    console.log(`📊 DEBUG: Cards by type:`, 
      Object.keys(cardsByType).map(type => ({ type, count: cardsByType[type].length }))
    );
    
    // Send the results
    res.json({
      query,
      totalCount: cards.length,
      typeBreakdown: Object.keys(cardsByType).map(type => ({ type, count: cardsByType[type].length })),
      cards: cards.map(card => ({
        _id: card._id,
        question: card.question,
        type: card.type,
        deck: card.deck,
        subdeck: card.subdeck,
        subsubdeck: card.subsubdeck
      }))
    });
  } catch (error) {
    console.error(`📊 DEBUG ERROR: ${error.message}`);
    res.status(500).json({ error: 'Server error' });
  }
});

// Special debug endpoint for Neumonía
app.get('/api/debug/neumonia', async (req, res) => {
  try {
    console.log(`🔍 NEUMONÍA SPECIAL DEBUG: Checking all cards related to Neumonía`);
    
    // Check for cards with exact subsubdeck "Neumonía"
    const exactMatch = await Flashcard.find({
      subsubdeck: "Neumonía"
    }).lean();
    
    console.log(`🔍 NEUMONÍA SPECIAL DEBUG: Found ${exactMatch.length} cards with exact subsubdeck "Neumonía"`);
    
    // Check for cards with subsubdeck containing "neumon" (case insensitive)
    const partialMatches = await Flashcard.find({
      subsubdeck: { $regex: /neumon/i }
    }).lean();
    
    console.log(`🔍 NEUMONÍA SPECIAL DEBUG: Found ${partialMatches.length} cards with subsubdeck containing "neumon"`);
    
    // Also check for any cards containing neumon in any field
    const textMatches = await Flashcard.find({
      $or: [
        { question: { $regex: /neumon/i } },
        { answer: { $regex: /neumon/i } },
        { deck: { $regex: /neumon/i } },
        { subdeck: { $regex: /neumon/i } }
      ]
    }).lean();
    
    console.log(`🔍 NEUMONÍA SPECIAL DEBUG: Found ${textMatches.length} cards with "neumon" in any field`);
    
    // Check a specific combination
    const specificQuery = await Flashcard.find({
      deck: "Patología",
      subdeck: "Respiratorio",
      subsubdeck: "Neumonía"
    }).lean();
    
    console.log(`🔍 NEUMONÍA SPECIAL DEBUG: Found ${specificQuery.length} cards with exact Patología > Respiratorio > Neumonía path`);
    
    // Log normalized Neumonía naming
    console.log(`🔍 NEUMONÍA SPECIAL DEBUG: Normalized subsubdeck name variations found in database:`);
    const variations = await Flashcard.distinct('subsubdeck', {
      subsubdeck: { $regex: /neumon/i }
    });
    
    variations.forEach((variant, i) => {
      console.log(`🔍 NEUMONÍA SPECIAL DEBUG: Variation ${i+1}: "${variant}"`);
    });
    
    // Send response
    res.json({
      exactMatch: exactMatch.map(card => ({
        id: card._id,
        question: card.question,
        deck: card.deck,
        subdeck: card.subdeck,
        subsubdeck: card.subsubdeck,
        type: card.type
      })),
      partialMatches: partialMatches.map(card => ({
        id: card._id,
        question: card.question,
        deck: card.deck,
        subdeck: card.subdeck,
        subsubdeck: card.subsubdeck,
        type: card.type
      })),
      textMatches: textMatches.map(card => ({
        id: card._id,
        question: card.question,
        deck: card.deck,
        subdeck: card.subdeck,
        subsubdeck: card.subsubdeck,
        type: card.type
      })),
      specificQuery: specificQuery.map(card => ({
        id: card._id,
        question: card.question,
        deck: card.deck,
        subdeck: card.subdeck,
        subsubdeck: card.subsubdeck,
        type: card.type
      })),
      variations: variations
    });
  } catch (error) {
    console.error(`🔍 NEUMONÍA SPECIAL DEBUG ERROR: ${error.message}`);
    res.status(500).json({ error: 'Server error' });
  }
});

// Error handling
app.use((req, res) => res.status(404).json({ error: 'Route not found' }));
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ 
    error: err.message || 'Internal Server Error' 
  });
});