// config/passport.js
const passport = require('passport');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/User');  // Make sure your User model is correctly defined

// Local Strategy
passport.use(new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password'
}, async (email, password, done) => {
  try {
    const user = await User.findOne({ email });
    if (!user) return done(null, false, { message: 'Invalid credentials' });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return done(null, false, { message: 'Invalid credentials' });

    return done(null, user);
  } catch (err) {
    return done(err);
  }
}));

// JWT Strategy
const jwtOpts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // Extract JWT from Authorization header
  secretOrKey: process.env.JWT_SECRET // Secret key to verify the token
};

passport.use(new JwtStrategy(jwtOpts, async (jwt_payload, done) => {
  try {
    // Look for the user by the ID stored in the 'sub' field of the JWT payload
    const user = await User.findById(jwt_payload.sub);
    // If user exists, pass the user to the next middleware
    if (user) {
      return done(null, user);
    } else {
      // If no user found, return false (authentication failed)
      return done(null, false);
    }
  } catch (err) {
    console.error('Passport JWT Error:', err); // Log the error
    return done(err, false);
  } // fuck you mach
}));
