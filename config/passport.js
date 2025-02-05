// config/passport.js
const passport = require('passport');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const User = require('../models/User');  // Make sure your User model is correctly defined

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
  }
}));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});
